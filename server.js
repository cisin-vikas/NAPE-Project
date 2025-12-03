const express = require('express');
const cors = require('cors');

// Dynamic import for node-fetch (v3 is ESM only)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const port = 5000;
const PMS_BASE_URL = 'https://cors-anywhere.herokuapp.com/https://pms.cisin.com';

app.use(cors()); // Allow requests from the frontend
app.use(express.json());

// --- LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// --- HELPER: ERROR HANDLER ---
const handlePmsError = (res, error, context) => {
    console.error(`Error in ${context}:`, error);
    res.status(500).json({ 
        error: `Failed to communicate with PMS: ${error.message}`,
        details: 'Ensure the VPN is connected if required and the API Key is correct.' 
    });
};

// --- HEALTH CHECK ---
app.get('/', (req, res) => {
  res.send('NAPE Backend is running and configured for pms.cisin.com. Use /api/projects to fetch data.');
});

// --- ENDPOINT: LIST PROJECTS ---
app.get('/api/projects', async (req, res) => {
  const apiKey = req.headers['x-pms-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'X-Pms-Api-Key header is required.' });
  }

  try {
    // Redmine API: /projects.json
    const pmsUrl = `${PMS_BASE_URL}/projects.json?key=${apiKey}&limit=100`;
    console.log(`Fetching projects from: ${pmsUrl}`);
    
    const response = await fetch(pmsUrl);
    
    if (!response.ok) {
        throw new Error(`PMS responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Redmine projects to NAPE format
    // Redmine returns { projects: [ { id, name, identifier, ... } ], ... }
    const projects = data.projects.map(p => ({
        id: p.id.toString(), // Use numeric ID as string
        name: p.name
    }));

    res.json(projects);

  } catch (error) {
    handlePmsError(res, error, 'fetch projects');
  }
});

// --- ENDPOINT: PROJECT SNAPSHOT ---
app.get('/api/projects/:projectId/snapshot', async (req, res) => {
  const { projectId } = req.params;
  const apiKey = req.headers['x-pms-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'X-Pms-Api-Key header is required.' });
  }

  try {
    // 1. Fetch Project Details
    const projectUrl = `${PMS_BASE_URL}/projects/${projectId}.json?key=${apiKey}`;
    const projectRes = await fetch(projectUrl);
    if (!projectRes.ok) throw new Error(`Failed to fetch project details: ${projectRes.status}`);
    const projectData = await projectRes.json();
    const p = projectData.project;

    // 2. Fetch Issues (Tasks)
    // status_id=* fetches all open and closed issues. limit=100 is a safe default for demo.
    const issuesUrl = `${PMS_BASE_URL}/issues.json?project_id=${projectId}&status_id=*&limit=100&key=${apiKey}`;
    const issuesRes = await fetch(issuesUrl);
    if (!issuesRes.ok) throw new Error(`Failed to fetch issues: ${issuesRes.status}`);
    const issuesData = await issuesRes.json();
    const issues = issuesData.issues || [];

    // 3. Transform Data to NAPE Snapshot Schema
    
    // --- CALCULATE AGGREGATES ---
    let totalPoints = 0;
    let completedPoints = 0;
    const teamMap = new Map(); // Track unique users

    const tasks = issues.map(issue => {
        // Redmine uses estimated_hours usually. NAPE uses points. We map 1h = 1pt approx or use the value directly.
        const points = issue.estimated_hours || 1; // Default to 1 point if null
        const isDone = issue.status.name.toLowerCase() === 'closed' || issue.done_ratio === 100;
        
        totalPoints += points;
        if (isDone) completedPoints += points;

        // Build Team list
        if (issue.assigned_to) {
            if (!teamMap.has(issue.assigned_to.id)) {
                teamMap.set(issue.assigned_to.id, {
                    user_id: issue.assigned_to.id.toString(),
                    user_name: issue.assigned_to.name,
                    role_seniority: 'Developer', // Default, as Redmine issue doesn't have role
                    current_task_load: 0
                });
            }
            // Increment load if task is not done
            if (!isDone) {
                teamMap.get(issue.assigned_to.id).current_task_load += points;
            }
        }

        // Map Issue to Task
        return {
            task_id: issue.id.toString(),
            status: issue.status.name,
            assignee_id: issue.assigned_to ? issue.assigned_to.id.toString() : 'unassigned',
            priority: issue.priority.name,
            time_logged_hours: issue.spent_hours || 0,
            original_estimate_hours: issue.estimated_hours || 0,
            is_overdue: issue.due_date ? new Date(issue.due_date) < new Date() && !isDone : false,
            // Redmine doesn't always send dependencies in list view, skipping for simple integration
        };
    });

    const team = Array.from(teamMap.values());

    // --- SYNTHESIZE MISSING METRICS ---
    // Since Redmine doesn't provide these natively, we generate plausible data 
    // based on the real task state to ensure the Analysis engine has something to work with.
    
    const isProjectLate = new Date() > new Date(p.due_date || new Date().setDate(new Date().getDate() + 30));
    
    // Heuristic: If many tasks are overdue, accuracy is likely low.
    const overdueCount = tasks.filter(t => t.is_overdue).length;
    const accuracy = overdueCount > 2 ? 0.8 : 1.05;

    const snapshot = {
        project: {
            project_id: p.id.toString(),
            project_name: p.name,
            target_due_date: p.due_date || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            total_story_points: Math.round(totalPoints),
            completed_story_points: Math.round(completedPoints),
            last_update_date: p.updated_on ? p.updated_on.split('T')[0] : new Date().toISOString().split('T')[0],
        },
        tasks: tasks,
        team: team,
        // Synthetic Nuance Metrics based on real issue counts
        nuance_metrics: {
            team_historical_velocity: Math.max(10, Math.round(completedPoints / 4)), // Rough estimate: total completed / 4 weeks
            team_historical_estimation_accuracy: accuracy,
            task_reopen_rate: 0.05, // Default/Assumption
            avg_blocker_resolution_time_days: 2.0, // Default/Assumption
            task_churn_rate: 0.1, // Default/Assumption
            new_team_member_flag: false,
        },
        recent_trends: {
            velocity_change_pct_last_3_sprints: 0.0,
            completed_points_last_week: Math.round(completedPoints / 10), // Rough estimate
        },
        timestamp: new Date().toISOString(),
    };

    res.json(snapshot);

  } catch (error) {
    handlePmsError(res, error, `fetch snapshot for ${projectId}`);
  }
});

app.listen(port, () => {
  console.log(`\n--- NAPE BACKEND ---`);
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`Connected to PMS: ${PMS_BASE_URL}`);
  console.log(`Ready to process requests...\n`);
});
