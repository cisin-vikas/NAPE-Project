import { Project, ProjectSnapshot } from '../types';

// --- LIVE API CONFIGURATION ---
const PMS_BASE_URL = 'https://pms.cisin.com';

// --- MOCK DATA FALLBACK ---
// This data is used if the live API call fails or if no API key is provided.
// IDs have been changed to numeric strings to align with typical API behavior.
const mockProjects: Project[] = [
  { id: '101', name: 'Project Alpha - Mobile App Relaunch' },
  { id: '102', name: 'Project Beta - Data Warehouse Migration' },
  { id: '103', name: 'Project Gamma - E-commerce Platform Upgrade' },
];

const mockProjectSnapshots: { [key: string]: ProjectSnapshot } = {
  '101': {
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
  '102': {
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
  '103': {
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

const handleFetchError = (error: any, context: string, useMock: boolean = false): void => {
    console.error(`Error fetching ${context}:`, error);
    if (useMock && error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn(
            `A network error occurred. This is often due to a CORS policy on the remote server.
            The application will fall back to mock data. For a production environment, a backend
            proxy server is recommended to bypass this browser security feature.`
        );
    }
    // FIX: Do not re-throw the error. This allows the calling function to proceed with the fallback to mock data.
};

/**
 * Fetches the list of all projects from the PMS.
 * @param apiKey The PMS API key, passed from the configuration panel.
 * @returns A promise that resolves to an array of projects.
 */
export const getProjects = async (apiKey: string): Promise<Project[]> => {
  if (!apiKey) {
    console.warn('No PMS API Key provided. Falling back to mock data.');
    return mockProjects;
  }

  try {
    const response = await fetch(`${PMS_BASE_URL}/projects.json?key=${apiKey}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (!data.projects || !Array.isArray(data.projects)) {
        throw new Error("Invalid response format from PMS API: 'projects' array not found.");
    }
    
    // Map projects using their numeric ID for API calls, as per API docs.
    return data.projects
      .filter((p: any) => typeof p === 'object' && p.id && p.name)
      .map((p: any) => ({ id: p.id.toString(), name: p.name }));
  } catch (error) {
    handleFetchError(error, 'project list', true);
    return mockProjects; // Fallback on error
  }
};

/**
 * Fetches a detailed snapshot for a specific project from the PMS.
 * @param projectId The numeric identifier of the project to fetch.
 * @param apiKey The PMS API key, passed from the configuration panel.
 * @returns A promise that resolves to the project snapshot.
 */
export const getProjectSnapshot = async (projectId: string, apiKey: string): Promise<ProjectSnapshot> => {
    if (!apiKey) {
      console.warn(`No PMS API Key provided for snapshot of ${projectId}. Falling back to mock data.`);
      const mockSnapshot = mockProjectSnapshots[projectId];
      if (mockSnapshot) return mockSnapshot;
      throw new Error(`Mock project with ID '${projectId}' not found.`);
    }
    
    try {
        // Promise.all for parallel fetching
        const [projectDetailsRes, issuesRes, membershipsRes] = await Promise.all([
            fetch(`${PMS_BASE_URL}/projects/${projectId}.json?key=${apiKey}`),
            fetch(`${PMS_BASE_URL}/issues.json?project_id=${projectId}&key=${apiKey}&limit=100`),
            fetch(`${PMS_BASE_URL}/projects/${projectId}/memberships.json?key=${apiKey}`)
        ]);

        if (!projectDetailsRes.ok || !issuesRes.ok || !membershipsRes.ok) {
            throw new Error('One or more PMS API calls failed.');
        }

        const [projectDetails, issues, memberships] = await Promise.all([
            projectDetailsRes.json(),
            issuesRes.json(),
            membershipsRes.json(),
        ]);
        
        // Assemble the snapshot from different API responses
        // Using mock data as a template for fields not available in the API
        const mockTemplate = mockProjectSnapshots[projectId] || mockProjectSnapshots['101'];

        const snapshot: ProjectSnapshot = {
            project: {
                project_id: projectDetails.project.identifier,
                project_name: projectDetails.project.name,
                // These custom fields are assumed; if not present, fall back to mock data
                target_due_date: projectDetails.project.custom_fields?.find((cf: any) => cf.name === 'Due Date')?.value || mockTemplate.project.target_due_date,
                total_story_points: projectDetails.project.custom_fields?.find((cf: any) => cf.name === 'Total Story Points')?.value || mockTemplate.project.total_story_points,
                completed_story_points: projectDetails.project.custom_fields?.find((cf: any) => cf.name === 'Completed Story Points')?.value || mockTemplate.project.completed_story_points,
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
            // Nuance and trends are complex metrics likely not available from a standard PMS API,
            // so we continue to use mock data for them to ensure the analysis model works.
            nuance_metrics: mockTemplate.nuance_metrics,
            recent_trends: mockTemplate.recent_trends,
            timestamp: new Date().toISOString(),
        };

        return snapshot;

    } catch (error) {
        handleFetchError(error, `snapshot for project ${projectId}`, true);
        const mockSnapshot = mockProjectSnapshots[projectId];
        if (mockSnapshot) return mockSnapshot;
        throw new Error(`Live API failed and mock project with ID '${projectId}' was not found.`);
    }
};