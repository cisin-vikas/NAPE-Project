
export interface Project {
  id: string;
  name: string;
}

export interface ProjectSnapshot {
  project: {
    project_id: string;
    project_name: string;
    target_due_date: string;
    total_story_points: number;
    completed_story_points: number;
    last_update_date: string;
  };
  tasks: {
    task_id: string;
    status: string;
    assignee_id: string;
    priority: string;
    dependencies?: string[];
    is_overdue?: boolean;
    time_logged_hours?: number;
    original_estimate_hours?: number;
  }[];
  team: {
    user_id: string;
    user_name: string;
    role_seniority: string;
    current_task_load: number;
    scheduled_pto?: string[];
    team_join_date?: string;
  }[];
  nuance_metrics: {
    team_historical_velocity: number;
    team_historical_estimation_accuracy: number;
    task_reopen_rate: number;
    avg_blocker_resolution_time_days: number;
    task_churn_rate: number;
    new_team_member_flag: boolean;
  };
  recent_trends: {
    velocity_change_pct_last_3_sprints: number;
    completed_points_last_week: number;
  };
  timestamp: string;
}

export interface AnalysisResult {
  projectId: string;
  projectName: string;
  asOfDate: string;
  projectedCompletionDate: string;
  projectStatus: "On Track" | "At Risk" | "Off Track";
  confidenceLevel: "High" | "Medium" | "Low";
  rawCompletionPercent: number;
  adjustedCompletionPercent: number;
  estimatedWeeksRemaining: number;
  estimatedDaysRemaining: number;
  velocityTrend: {
    sprint: string;
    points: number;
  }[];
  justification: string;
  topRisks: {
    risk: string;
    details: string;
  }[];
  recommendations: {
    action: string;
    details: string;
  }[];
  diagnostics: {
    missing: string[];
    assumptions: string[];
    suggestedData: string[];
  };
}
