import client from '../../core/api/client';

export interface User {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    roles?: string[];
}

export async function getAllUsers(): Promise<User[]> {
    const response = await client.get('/admin/users');
    return response.data.users || [];
}

export const usersApi = {
    getAllUsers,
};
