import { db } from '../config/db';

export default class UserRoleService {
    async getUserRoles(user_id: string) {
        const { data, error } = await db
            .from('user_roles')
            .select('role')
            .eq('user_id', user_id);

        if (error) throw error;
        return data;
    }

    async assignRole(user_id: string, role: string) {
        const { data, error } = await db
            .from('user_roles')
            .insert([
                { user_id, role }
            ])
            .select();

        if (error) throw error;
        return data;
    }
}
