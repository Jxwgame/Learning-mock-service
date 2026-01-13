import client from "@/core/api/client";

export interface RecentActivity {
    log_id: number;
    user_id: number;
    action: string;
    created_at: string;
    user?: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface DashboardStats {
    courseCount: number;
    enrollmentCount: number;
    instructorCount: number;
    pendingAssignmentCount: number;
    recentActivities: RecentActivity[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const response = await client.get("/dashboard/stats");
    const d = response.data as any;
    if (d && typeof d === 'object' && 'ok' in d && 'data' in d) {
        return d.data;
    }
    return d;
}
