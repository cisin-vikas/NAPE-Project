const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors()); // Allow requests from the frontend
app.use(express.json());

// 56fa936e0b1f403f7b5e7bbdaf9deeb1b3c0fb15
// --- MOCK DATA FOR BACKEND ---
// The data is defined here to allow the backend server to function independently
// for demonstration purposes when the "Live Data Service" is enabled in the frontend.

const MOCK_PROJECTS = [
    { id: 'proj-apollo', name: 'Project Apollo - Q3 Launch Campaign' },
    { id: 'proj-vulcan', name: 'Project Vulcan - Internal Tools Platform' },
    { id: 'proj-neptune', name: 'Project Neptune - Data Migration (At Risk)' },
];

const MOCK_SNAPSHOTS = {
    'proj-apollo': { // A healthy, on-track project
        project: {
            project_id: 'proj-apollo',
            project_name: 'Project Apollo - Q3 Launch Campaign',
            target_due_date: '2024-11-30',
            total_story_points: 300,
            completed_story_points: 250,
            last_update_date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
        },
        tasks: Array.from({ length: 50 }, (_, i) => ({
            task_id: `AP-${i + 1}`,
            status: i < 45 ? 'Done' : 'In Progress',
            assignee_id: `user-0${(i % 4) + 1}`,
            priority: 'Medium',
        })),
        team: [
            { user_id: 'user-01', user_name: 'Alice', role_seniority: 'Senior Engineer', current_task_load: 1 },
            { user_id: 'user-02', user_name: 'Bob', role_seniority: 'Mid-level Engineer', current_task_load: 2 },
            { user_id: 'user-03', user_name: 'Charlie', role_seniority: 'Designer', current_task_load: 1 },
            { user_id: 'user-04', user_name: 'Diana', role_seniority: 'Junior Engineer', current_task_load: 1 },
        ],
        nuance_metrics: {
            team_historical_velocity: 22,
            team_historical_estimation_accuracy: 0.97, // Very accurate
            task_reopen_rate: 0.03,
            avg_blocker_resolution_time_days: 1.5,
            task_churn_rate: 0.05,
            new_team_member_flag: false,
        },
        recent_trends: {
            velocity_change_pct_last_3_sprints: 0.08, // Velocity increased
            completed_points_last_week: 24,
        },
        timestamp: new Date().toISOString(),
    },
    'proj-vulcan': { // A new project, just started
        project: {
            project_id: 'proj-vulcan',
            project_name: 'Project Vulcan - Internal Tools Platform',
            target_due_date: '2025-02-28',
            total_story_points: 180,
            completed_story_points: 15,
            last_update_date: new Date().toISOString().split('T')[0],
        },
        tasks: [
             { task_id: 'VUL-01', status: 'In Progress', assignee_id: 'user-01', priority: 'High' },
             { task_id: 'VUL-02', status: 'To Do', assignee_id: 'user-02', priority: 'High' },
             { task_id: 'VUL-03', status: 'To Do', assignee_id: 'user-01', priority: 'Medium' },
        ],
        team: [
            { user_id: 'user-01', user_name: 'Alice', role_seniority: 'Senior Engineer', current_task_load: 2 },
            { user_id: 'user-02', user_name: 'Bob', role_seniority: 'Mid-level Engineer', current_task_load: 1 },
        ],
        nuance_metrics: {
            team_historical_velocity: 20, // Based on team's past projects
            team_historical_estimation_accuracy: 1.05, // Slight underestimation
            task_reopen_rate: 0.01,
            avg_blocker_resolution_time_days: 0.5,
            task_churn_rate: 0.0,
            new_team_member_flag: false,
        },
        recent_trends: {
            velocity_change_pct_last_3_sprints: 0,
            completed_points_last_week: 8,
        },
        timestamp: new Date().toISOString(),
    },
    'proj-neptune': { // An at-risk project
        project: {
            project_id: 'proj-neptune',
            project_name: 'Project Neptune - Data Migration (At Risk)',
            target_due_date: '2024-09-30',
            total_story_points: 250,
            completed_story_points: 110,
            last_update_date: new Date().toISOString().split('T')[0],
        },
        tasks: [
            { task_id: 'NEP-01', status: 'Done', assignee_id: 'user-01', priority: 'High' },
            { task_id: 'NEP-02', status: 'In Progress', assignee_id: 'user-02', priority: 'High', dependencies: ['NEP-01'] },
            { task_id: 'NEP-03', status: 'Blocked', assignee_id: 'user-03', priority: 'High', dependencies: ['NEP-02'], is_overdue: true },
            { task_id: 'NEP-04', status: 'To Do', assignee_id: 'user-01', priority: 'Medium' },
            { task_id: 'NEP-05', status: 'In Progress', assignee_id: 'user-04', priority: 'Medium', time_logged_hours: 10, original_estimate_hours: 20 },
            { task_id: 'NEP-06', status: 'To Do', assignee_id: 'user-02', priority: 'Low' },
        ],
        team: [
            { user_id: 'user-01', user_name: 'Alice', role_seniority: 'Senior Engineer', current_task_load: 2 },
            { user_id: 'user-02', user_name: 'Bob', role_seniority: 'Mid-level Engineer', current_task_load: 3, scheduled_pto: [`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate() + 5).padStart(2, '0')}`] },
            { user_id: 'user-03', user_name: 'Charlie', role_seniority: 'Designer', current_task_load: 1 },
            { user_id: 'user-04', user_name: 'Diana', role_seniority: 'Junior Engineer', current_task_load: 1, team_join_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0] },
        ],
        nuance_metrics: {
            team_historical_velocity: 15, // SP/week
            team_historical_estimation_accuracy: 1.25, // Tends to underestimate by 25%
            task_reopen_rate: 0.11, // 11% of tasks are reopened
            avg_blocker_resolution_time_days: 4,
            task_churn_rate: 0.15, // 15% of tasks change scope
            new_team_member_flag: true,
        },
        recent_trends: {
            velocity_change_pct_last_3_sprints: -0.20, // Velocity dropped by 20%
            completed_points_last_week: 9,
        },
        timestamp: new Date().toISOString(),
    },
};

// --- ENDPOINTS ---

// 1. Fetch all projects
app.get('/api/projects', (req, res) => {
  const pmsApiKey = req.headers['x-pms-api-key'];

  if (!pmsApiKey) {
    return res.status(401).json({ error: 'X-Pms-Api-Key header is required.' });
  }

  // Simulate delay
  setTimeout(() => {
    res.json(MOCK_PROJECTS);
  }, 500);
});

// 2. Fetch a single project snapshot
app.get('/api/projects/:projectId/snapshot', (req, res) => {
  const { projectId } = req.params;
  const pmsApiKey = req.headers['x-pms-api-key'];

  if (!pmsApiKey) {
    return res.status(401).json({ error: 'X-Pms-Api-Key header is required.' });
  }

  const snapshot = MOCK_SNAPSHOTS[projectId];
  
  // Simulate delay
  setTimeout(() => {
      if (snapshot) {
          res.json(snapshot);
      } else {
          // Fallback if needed, or error
          res.status(404).json({ error: 'Project not found' });
      }
  }, 800);
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  console.log('NOTE: Ensure dependencies are installed: npm install express cors');
});
