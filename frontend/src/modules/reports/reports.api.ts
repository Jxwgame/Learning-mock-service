// Reports/Dashboard API module
import client from "../../core/api/client";

export interface DashboardStats {
    // Original stats
    courseCount: number;
    enrollmentCount: number;
    instructorCount: number;
    pendingAssignmentCount: number;
    recentActivities: any[];
    // Extended stats
    userCount: number;
    learnerCount: number;
    adminCount: number;
    publishedCourseCount: number;
    draftCourseCount: number;
    gradedSubmissionCount: number;
    topCourses: any[];
    latestEnrollments: any[];
    recentSubmissions: any[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const res = await client.get<DashboardStats>("/dashboard/stats");
    return res.data;
}

export interface LogsResponse {
    ok: boolean;
    logs: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type LogType = 'system' | 'entity';

export interface LogsParams {
    type?: LogType;
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    actionType?: string;
    entityType?: string;
    changeType?: string;
    userId?: number;
}

export async function getLogs(params: LogsParams = {}): Promise<LogsResponse> {
    const res = await client.get<LogsResponse>("/admin/logs", { params });
    return res.data;
}

export const reportsApi = {
    getDashboardStats,
    getLogs
};
