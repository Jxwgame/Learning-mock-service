// RBAC & Admin API Module - Uses shared client from core/api
import client from "../../core/api/client";

// ===== Request/Response Types =====
export interface User {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    roles: string[];
    created_at?: string;
    last_login_at?: string;
}

export interface Role {
    role_id: number;
    role_name: string;
    description?: string;
}

export interface Permission {
    permission_id: number;
    permission_name: string;
    description?: string;
}

export interface DirectUserPermission {
    id: number;
    permission_id: number;
    permission_name: string;
    description?: string;
    is_revoked: boolean;
    assigned_by: { user_id: number; name: string } | null;
    assigned_at: string;
}

export interface Session {
    session_id: string;
    device_id: string;
    user_agent?: string;
    ip_address?: string;
    created_at: string;
    last_activity_at?: string;
    is_current?: boolean;
}

export interface CreateUserPayload {
    email: string;
    first_name: string;
    last_name: string;
    role_ids?: number[];
}

export interface UpdateUserPayload {
    first_name?: string;
    last_name?: string;
    is_active?: boolean;
}

// ===== API Service =====
export const adminApi = {
    // ===== USER MANAGEMENT =====

    // Get all users with their roles
    async getUsers(): Promise<User[]> {
        const res = await client.get<{ users: User[] }>("/admin/users");
        return res.data.users;
    },

    // Get single user by ID
    async getUserById(userId: number): Promise<User> {
        const res = await client.get<{ user: User }>(`/admin/users/${userId}`);
        return res.data.user;
    },

    // Create new user
    async createUser(payload: CreateUserPayload): Promise<User> {
        const res = await client.post<{ user: User }>("/admin/users", payload);
        return res.data.user;
    },

    // Update user
    async updateUser(userId: number, payload: UpdateUserPayload): Promise<User> {
        const res = await client.patch<{ user: User }>(`/admin/users/${userId}`, payload);
        return res.data.user;
    },

    // Delete user
    async deleteUser(userId: number): Promise<void> {
        await client.delete(`/admin/users/${userId}`);
    },

    // Toggle user active status
    async toggleUserStatus(userId: number): Promise<User> {
        const res = await client.patch<{ user: User }>(`/admin/users/${userId}/toggle-status`);
        return res.data.user;
    },

    // ===== ROLE ASSIGNMENT =====

    // Assign role to user
    async assignRole(userId: number, roleId: number): Promise<void> {
        await client.post(`/admin/users/${userId}/roles`, { role_id: roleId });
    },

    // Revoke role from user
    async revokeRole(userId: number, roleId: number): Promise<void> {
        await client.delete(`/admin/users/${userId}/roles/${roleId}`);
    },

    // ===== ROLES =====

    // Get all roles
    async getRoles(): Promise<Role[]> {
        const res = await client.get<{ roles: Role[] }>("/admin/roles");
        return res.data.roles;
    },

    // Create new role
    async createRole(payload: { role_name: string; description?: string }): Promise<Role> {
        const res = await client.post<{ role: Role }>("/admin/roles", payload);
        return res.data.role;
    },

    // Update role
    async updateRole(roleId: number, payload: { role_name?: string; description?: string }): Promise<Role> {
        const res = await client.patch<{ role: Role }>(`/admin/roles/${roleId}`, payload);
        return res.data.role;
    },

    // Delete role
    async deleteRole(roleId: number): Promise<void> {
        await client.delete(`/admin/roles/${roleId}`);
    },

    // Assign role to user
    async assignRoleToUser(userId: number, roleId: number): Promise<void> {
        await client.post(`/admin/users/${userId}/roles`, { role_id: roleId });
    },

    // Remove role from user
    async revokeRoleFromUser(userId: number, roleId: number): Promise<void> {
        await client.delete(`/admin/users/${userId}/roles/${roleId}`);
    },

    // Set permissions for a role
    async setRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
        await client.put(`/admin/roles/${roleId}/permissions`, { permission_ids: permissionIds });
    },

    // ===== PERMISSIONS =====

    // Get all permissions
    async getPermissions(): Promise<Permission[]> {
        const res = await client.get<{ permissions: Permission[] }>("/admin/permissions");
        return res.data.permissions;
    },

    // Create new permission
    async createPermission(payload: { permission_name: string; description?: string }): Promise<Permission> {
        const res = await client.post<{ permission: Permission }>("/admin/permissions", payload);
        return res.data.permission;
    },

    // Update permission
    async updatePermission(permissionId: number, payload: { permission_name?: string; description?: string }): Promise<Permission> {
        const res = await client.patch<{ permission: Permission }>(`/admin/permissions/${permissionId}`, payload);
        return res.data.permission;
    },

    // Delete permission
    async deletePermission(permissionId: number): Promise<void> {
        await client.delete(`/admin/permissions/${permissionId}`);
    },

    // ===== SESSIONS =====

    // Get sessions for a user (or current user)
    async getSessions(userId?: number): Promise<Session[]> {
        const url = userId ? `/admin/users/${userId}/sessions` : "/admin/sessions";
        const res = await client.get<{ sessions: Session[] }>(url);
        return res.data.sessions;
    },

    // Revoke a specific session
    async revokeSession(sessionId: string): Promise<void> {
        await client.delete(`/admin/sessions/${sessionId}`);
    },

    // Revoke all sessions for a user
    async revokeAllSessions(userId: number): Promise<{ revoked_count: number }> {
        const res = await client.delete<{ revoked_count: number }>(`/admin/users/${userId}/sessions`);
        return res.data;
    },

    // ===== USER DIRECT PERMISSIONS =====

    // Get direct permissions for a user (not from roles)
    async getUserDirectPermissions(userId: number): Promise<DirectUserPermission[]> {
        const res = await client.get<DirectUserPermission[]>(`/admin/users/${userId}/permissions`);
        return res.data;
    },

    // Grant a permission directly to a user
    async grantUserPermission(userId: number, permissionName: string): Promise<void> {
        await client.post(`/admin/users/${userId}/permissions`, { permission_name: permissionName });
    },

    // Revoke a permission from a user (explicit deny)
    async revokeUserPermission(userId: number, permissionName: string): Promise<void> {
        await client.post(`/admin/users/${userId}/permissions/revoke`, { permission_name: permissionName });
    },

    // Remove a direct permission entry (revert to role-based)
    async removeUserDirectPermission(userId: number, permissionName: string): Promise<void> {
        await client.delete(`/admin/users/${userId}/permissions/${permissionName}`);
    },
};

export const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser,
    revokeRoleFromUser,
    setRolePermissions,
    getPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    getSessions,
    revokeSession,
    revokeAllSessions,
    getUserDirectPermissions,
    grantUserPermission,
    revokeUserPermission,
    removeUserDirectPermission,
} = adminApi;

