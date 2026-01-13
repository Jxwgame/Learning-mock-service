// src/modules/me/me.api.ts
import client from "../../core/api/client";

export interface UserProfile {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    isActive: boolean;
}

interface BackendMeData {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    roles: string[];
    is_active: boolean;
}

export const meApi = {
    // Get current user profile
    async getMe(): Promise<UserProfile> {
        const res = await client.get<BackendMeData>("/me/me");
        const data = res.data;
        return {
            userId: data.user_id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            roles: data.roles || [],
            isActive: data.is_active,
        };
    },

    // Update current user profile
    async updateMe(payload: { firstName: string; lastName: string }): Promise<UserProfile> {
        const res = await client.patch<BackendMeData>("/me/me", {
            first_name: payload.firstName,
            last_name: payload.lastName,
        });
        const data = res.data;
        return {
            userId: data.user_id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            roles: data.roles || [],
            isActive: data.is_active,
        };
    },
};
