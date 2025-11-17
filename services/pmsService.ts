import { Project, ProjectSnapshot } from '../types';

// --- LIVE API CONFIGURATION ---
const PMS_BASE_URL = 'https://pms.cisin.com';
const PMS_API_KEY = process.env.PMS_API_KEY;

if (!PMS_API_KEY) {
  console.warn(
    'PMS_API_KEY environment variable not set. The application will use mock data. Please provide a valid key for live data.'
  );
}

// --- MOCK DATA FALLBACK ---
// This data is used if the live API call fails, which can happen due to
// network issues or browser security policies (CORS).
const mockProjects: Project[] = [
  { id: 'PROJ-ALPHA', name: 'Project Alpha - Mobile App Relaunch' },
  { id: 'PROJ-BETA', name: 'Project Beta - Data Warehouse Migration' },
  { id: 'PROJ-GAMMA', name: 'Project Gamma - E-commerce Platform Upgrade' },
];

const mockProjectSnapshots: { [key: string]: ProjectSnapshot } = {
  'PROJ-ALPHA': {
    project: {
      project_id: 'PROJ-ALPHA',
      project_name: 'Project Alpha',
      target_due_date: '2024-12-31',
      total_story_points: 300,
      completed_story_points: 180,
      last_update_date: '2024-09-15',
    },
    tasks: [
      { task_id: 'TASK-123', status: 'Blocked', assignee_id: 'USER-007', priority: 'High', dependencies: ['TASK-121', 'TASK-122'], is_overdue: true },
      { task_id: 'TASK-124', status: 'In Progress', assignee_id: 'USER-008', priority: 'High', time_logged_hours: 10, original_estimate_hours: 8 },
      { task_id: 'TASK-125', status: 'In Review', assignee_id: 'USER-009', priority: 'Medium' }
    ],
    team: [
      { user_id: 'USER-007', user_name: 'Alex Johnson', role_seniority: 'Senior Developer', current_task_load: 3, scheduled_pto: ['2024-10-10', '2024-10-11'] },
      { user_id: 'USER-008', user_name: 'Sam Lee', role_seniority: 'Junior Developer', current_task_load: 2, team_join_date: '2024-09-01' }
    ],
    nuance_metrics: {
      team_historical_velocity: 25,
      team_historical_estimation_accuracy: 1.2,
      task_reopen_rate: 0.15,
      avg_blocker_resolution_time_days: 2.5,
      task_churn_rate: 0.10,
      new_team_member_flag: true,
    },
    recent_trends: {
      velocity_change_pct_last_3_sprints: -18,
      completed_points_last_week: 12,
    },
    timestamp: new Date().toISOString(),
  },
  'PROJ-BETA': {
    project: {
      project_id: 'PROJ-BETA',
      project_name: 'Project Beta - Data Warehouse Migration',
      target_due_date: '2025-01-31',
      total_story_points: 500,
      completed_story_points: 100,
      last_update_date: '2024-09-20',
    },
    tasks: [
        { task_id: 'TASK-201', status: 'In Progress', assignee_id: 'USER-010', priority: 'High' },
        { task_id: 'TASK-202', status: 'To Do', assignee_id: 'USER-011', priority: 'High' },
    ],
    team: [
        { user_id: 'USER-010', user_name: 'Maria Garcia', role_seniority: 'Lead Engineer', current_task_load: 1 },
        { user_id: 'USER-011', user_name: 'Chen Wei', role_seniority: 'Data Engineer', current_task_load: 1 },
    ],
    nuance_metrics: {
      team_historical_velocity: 40,
      team_historical_estimation_accuracy: 1.1,
      task_reopen_rate: 0.05,
      avg_blocker_resolution_time_days: 1.5,
      task_churn_rate: 0.05,
      new_team_member_flag: false,
    },
    recent_trends: {
      velocity_change_pct_last_3_sprints: 5,
      completed_points_last_week: 45,
    },
    timestamp: new Date().toISOString(),
  },
  'PROJ-GAMMA': {
    project: {
        project_id: 'PROJ-GAMMA',
        project_name: 'Project Gamma - E-commerce Platform Upgrade',
        target_due_date: '2024-11-30',
        total_story_points: 450,
        completed_story_points: 400,
        last_update_date: '2024-09-18',
    },
    tasks: [
        { task_id: 'TASK-301', status: 'In Review', assignee_id: 'USER-012', priority: 'High' },
        { task_id: 'TASK-302', status: 'Done', assignee_id: 'USER-013', priority: 'Medium' },
    ],
    team: [
        { user_id: 'USER-012', user_name: 'David Kim', role_seniority: 'Senior Frontend Developer', current_task_load: 1 },
        { user_id: 'USER-013', user_name: 'Emily White', role_seniority: 'Backend Developer', current_task_load: 0 },
    ],
    nuance_metrics: {
        team_historical_velocity: 35,
        team_historical_estimation_accuracy: 0.95,
        task_reopen_rate: 0.02,
        avg_blocker_resolution_time_days: 1.0,
        task_churn_rate: 0.03,
        new_team_member_flag: false,
    },
    recent_trends: {
        velocity_change_pct_last_3_sprints: 10,
        completed_points_last_week: 38,
    },
    timestamp: new Date().toISOString(),
  }
};
// --- END MOCK DATA ---

const handleFetchError = (error: any, context: string): never => {
    console.error(`Error fetching ${context}:`, error);
    if (error.message.includes('Failed to fetch')) {
        console.warn(
            `A network error occurred. This is often due to a CORS policy on the remote server.
            The application will fall back to mock data. For a production environment, a backend
            proxy server is recommended to bypass this browser security feature.`
        );
    }
    throw error;
};

/**
 * Fetches the list of all projects from the PMS.
 */
export const getProjects = async (): Promise<Project[]> => {
  if (!PMS_API_KEY) {
    return mockProjects;
  }

  try {
    const response = await fetch(`${PMS_BASE_URL}/projects.json?key=${PMS_API_KEY}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.projects.map((p: any) => ({ id: p.identifier, name: p.name }));
  } catch (error) {
    handleFetchError(error, 'project list');
    return mockProjects;
  }
};

/**
 * Fetches a detailed snapshot for a specific project from the PMS.
 * @param projectId The identifier of the project to fetch.
 */
export const getProjectSnapshot = async (projectId: string): Promise<ProjectSnapshot> => {
    if (!PMS_API_KEY) {
      return mockProjectSnapshots[projectId] || Promise.reject(new Error(`Mock project with ID '${projectId}' not found.`));
    }
    
    try {
        const [projectDetails, issues, memberships] = await Promise.all([
            fetch(`${PMS_BASE_URL}/projects/${projectId}.json?key=${PMS_API_KEY}`).then(res => res.json()),
            fetch(`${PMS_BASE_URL}/issues.json?project_id=${projectId}&key=${PMS_API_KEY}&limit=100`).then(res => res.json()),
            fetch(`${PMS_BASE_URL}/projects/${projectId}/memberships.json?key=${PMS_API_KEY}`).then(res => res.json())
        ]);
        
        // Assemble the snapshot from different API responses
        const snapshot: Partial<ProjectSnapshot> = {
            project: {
                project_id: projectDetails.project.identifier,
                project_name: projectDetails.project.name,
                target_due_date: projectDetails.project.custom_fields?.find((cf: any) => cf.name === 'Due Date')?.value || mockProjectSnapshots[projectId].project.target_due_date,
                total_story_points: projectDetails.project.custom_fields?.find((cf: any) => cf.name === 'Total Story Points')?.value || mockProjectSnapshots[projectId].project.total_story_points,
                completed_story_points: projectDetails.project.custom_fields?.find((cf: any) => cf.name === 'Completed Story Points')?.value || mockProjectSnapshots[projectId].project.completed_story_points,
                last_update_date: projectDetails.project.updated_on,
            },
            tasks: issues.issues.map((issue: any) => ({
                task_id: `TASK-${issue.id}`,
                status: issue.status.name,
                assignee_id: issue.assigned_to?.id ? `USER-${issue.assigned_to.id}` : 'unassigned',
                priority: issue.priority.name,
            })),
            team: memberships.memberships.map((member: any) => ({
                user_id: `USER-${member.user.id}`,
                user_name: member.user.name,
                role_seniority: member.roles.map((r: any) => r.name).join(', ') || 'Member',
                current_task_load: issues.issues.filter((i: any) => i.assigned_to?.id === member.user.id).length,
            })),
            timestamp: new Date().toISOString(),
        };

        // Nuance and trends are complex metrics not available from the API, so we use mock data for them.
        const mockMetrics = mockProjectSnapshots[projectId] || mockProjectSnapshots['PROJ-ALPHA'];
        return {
            ...mockMetrics,
            ...snapshot,
        } as ProjectSnapshot;

    } catch (error) {
        handleFetchError(error, `snapshot for project ${projectId}`);
        return mockProjectSnapshots[projectId] || Promise.reject(new Error(`Mock project with ID '${projectId}' not found.`));
    }
};
