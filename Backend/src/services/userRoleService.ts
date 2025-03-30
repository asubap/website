import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createSupabaseClient } from '../config/db';

dotenv.config();

export default class UserRoleService {
    private supabase: SupabaseClient;

    /**
     * Constructor for the UserRoleService
     */
    constructor() {
        this.supabase = createSupabaseClient();
    }

    /**
     * Set the token for the user
     * @param token - The token for the user
     */
    setToken(token: string) {
        if (!token) return;
        this.supabase = createSupabaseClient(token);
    }

    /**
     * Get the roles of a user
     * @param user_id - The ID of the user
     * @returns The roles of the user
     */
    async getUserRoles(user_id: string) {
        const { data, error } = await this.supabase
            .from('user_roles')
            .select(`
                role_id
            `)
            .eq('user_id', user_id);

        if (error) throw error;
        
        // Convert role IDs to role names
        return data.map(role => ({
            role: this.convertIdToRole(role.role_id)
        }));
    }

    private convertRoleToId(role: string): number {
        switch (role) {
            case 'e-board':
                return 1;
            case 'sponsor':
                return 2;
            case 'general-member':
                return 3;
            default:
                throw new Error('Invalid role');
        }
    }

    private convertIdToRole(roleId: number): string {
        switch (roleId) {
            case 1:
                return 'e-board';
            case 2:
                return 'sponsor';
            case 3:
                return 'general-member';
            default:
                throw new Error('Invalid role ID');
        }
    }

    async assignRole(user_id: string, role: string) {
        const roleNumber = this.convertRoleToId(role);
        
        const { data: existingRole } = await this.supabase
            .from('user_roles')
            .select()
            .eq('user_id', user_id)
            .eq('role_id', roleNumber)
            .single();

        if (existingRole) {
            return false;
        }

        const { error } = await this.supabase
            .from('user_roles')
            .insert([
                { user_id, role_id: roleNumber }
            ])
            .select()
            .single();

        if (error) throw error;
        return true;
    }

    async removeRole(user_id: string, role: string) {
        const roleNumber = this.convertRoleToId(role);

        const { error } = await this.supabase
            .from('user_roles')
            .delete()
            .eq('user_id', user_id)
            .eq('role_id', roleNumber);

        if (error) throw error;
        return true;
    }
}