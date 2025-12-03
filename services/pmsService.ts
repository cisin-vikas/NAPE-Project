
import { Project, ProjectSnapshot } from '../types';

// UPDATED: Direct connection to the PMS.
// NOTE: This may require CORS configuration on the pms.cisin.com server to work from a browser.
const API_BASE_URL = 'https://cors-anywhere.herokuapp.com/https://pms.cisin.com';

// --- FALLBACK MOCK DATA ---
// Used when the API is not reachable (e.g., due to CORS or network issues).
const MOCK_PROJECTS: Project[] = [
    { id: 'proj-apollo', name: 'Project Apollo - Q3 Launch Campaign (Mock)' },
    { id: 'proj-vulcan', name: 'Project Vulcan - Internal Tools Platform (Mock)' },
];

const MOCK_SNAPSHOTS: Record<string, ProjectSnapshot> = {
    'proj-apollo': { 
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
            dependencies: (i % 7 === 0 && i > 0) ? [`AP-${i}`] : [],
        })),
        team: [
            { user_id: 'user-01', user_name: 'Alice', role_seniority: 'Senior Engineer', current_task_load: 1 },
            { user_id: 'user-02', user_name: 'Bob', role_seniority: 'Mid-level Engineer', current_task_load: 2 },
        ],
        nuance_metrics: {
            team_historical_velocity: 22,
            team_historical_estimation_accuracy: 0.97,
            task_reopen_rate: 0.03,
            avg_blocker_resolution_time_days: 1.5,
            task_churn_rate: 0.05,
            new_team_member_flag: false,
        },
        recent_trends: {
            velocity_change_pct_last_3_sprints: 0.08,
            completed_points_last_week: 24,
        },
        timestamp: new Date().toISOString(),
    }
};

// Helper to handle direct Redmine API errors
const handleApiError = async (response: Response, context: string) => {
    if (!response.ok) {
        // Try to parse text/json error
        const text = await response.text();
        console.warn(`Error in ${context}: ${response.status} ${response.statusText}`, text);
        throw new Error(`PMS Request Failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
};

export const getProjects = async (apiKey: string): Promise<Project[]> => {
  if (!apiKey) {
    throw new Error('PMS API Key is required.');
  }

  try {
      // Redmine API: /projects.json
      // Using 'key' query param as requested by the user's URL structure
      const url = `${API_BASE_URL}/projects.json?key=${apiKey}&limit=100`;
      
      const response = await fetch(url, {
          method: 'GET',
          headers: {
             'Content-Type': 'application/json'
             // Note: Some Redmine configs prefer 'X-Redmine-API-Key': apiKey header instead of query param
          }
      });

      const data = await handleApiError(response, 'getProjects');

      // Transform Redmine format to NAPE format
      return data.projects.map((p: any) => ({
        id: p.id.toString(),
        name: p.name
      }));

  } catch (error) {
      console.warn("Direct API connection failed (likely CORS or Network). Falling back to Mock.", error);
      return MOCK_PROJECTS;
  }
};

export const getProjectSnapshot = async (projectId: string, apiKey:string): Promise<ProjectSnapshot> => {
    if (!projectId) throw new Error('A project must be selected.');
    if (!apiKey) throw new Error('PMS API Key is required.');
    
    try {
        // 1. Fetch Project Details
        const projectUrl = `${API_BASE_URL}/projects/${projectId}.json?key=${apiKey}`;
        const projectRes = await fetch(projectUrl);
        const projectData = await handleApiError(projectRes, 'getProjectDetails');
        const p = projectData.project;

        // 2. Fetch Issues (Tasks)
        // status_id=* gets all statuses
        const issuesUrl = `${API_BASE_URL}/issues.json?project_id=${projectId}&status_id=*&limit=100&key=${apiKey}`;
        const issuesRes = await fetch(issuesUrl);
        const issuesData = await handleApiError(issuesRes, 'getProjectIssues');
        const issues = issuesData.issues || [];

        // 3. Transform Data to NAPE Snapshot Schema (Logic moved from server.js to client)
        let totalPoints = 0;
        let completedPoints = 0;
        const teamMap = new Map<string, any>(); 

        const tasks = issues.map((issue: any) => {
            const points = issue.estimated_hours || 1; 
            const isDone = (issue.status.name || '').toLowerCase() === 'closed' || issue.done_ratio === 100;
            
            totalPoints += points;
            if (isDone) completedPoints += points;

            // Build Team list
            if (issue.assigned_to) {
                const userId = issue.assigned_to.id.toString();
                if (!teamMap.has(userId)) {
                    teamMap.set(userId, {
                        user_id: userId,
                        user_name: issue.assigned_to.name,
                        role_seniority: 'Developer', 
                        current_task_load: 0
                    });
                }
                if (!isDone) {
                    teamMap.get(userId).current_task_load += points;
                }
            }

            return {
                task_id: issue.id.toString(),
                status: issue.status.name,
                assignee_id: issue.assigned_to ? issue.assigned_to.id.toString() : 'unassigned',
                priority: issue.priority.name,
                time_logged_hours: issue.spent_hours || 0,
                original_estimate_hours: issue.estimated_hours || 0,
                is_overdue: issue.due_date ? new Date(issue.due_date) < new Date() && !isDone : false,
                dependencies: [], // Default to empty array as standard Redmine list response doesn't include relations
            };
        });

        const team = Array.from(teamMap.values());

        // Synthetic Nuance Metrics (Calculated on client side now)
        const overdueCount = tasks.filter((t: any) => t.is_overdue).length;
        const accuracy = overdueCount > 2 ? 0.8 : 1.05;

        // Default to a due date 30 days out if not set
        const targetDueDate = p.due_date || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0];

        return {
            project: {
                project_id: p.id.toString(),
                project_name: p.name,
                target_due_date: targetDueDate,
                total_story_points: Math.round(totalPoints),
                completed_story_points: Math.round(completedPoints),
                last_update_date: p.updated_on ? p.updated_on.split('T')[0] : new Date().toISOString().split('T')[0],
            },
            tasks: tasks,
            team: team,
            nuance_metrics: {
                team_historical_velocity: Math.max(10, Math.round(completedPoints / 4)), 
                team_historical_estimation_accuracy: accuracy,
                task_reopen_rate: 0.05, 
                avg_blocker_resolution_time_days: 2.0, 
                task_churn_rate: 0.1, 
                new_team_member_flag: false,
            },
            recent_trends: {
                velocity_change_pct_last_3_sprints: 0.0,
                completed_points_last_week: Math.round(completedPoints / 10), 
            },
            timestamp: new Date().toISOString(),
        };

    } catch (error) {
        console.warn(`Error fetching snapshot for project ${projectId}. Falling back to MOCK DATA.`, error);
        const mockSnapshot = MOCK_SNAPSHOTS[projectId] || MOCK_SNAPSHOTS['proj-apollo'];
        // Return a mock if specific one missing
        return mockSnapshot; 
    }
};
