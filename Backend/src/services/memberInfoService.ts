import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "../config/db";
import extractEmail from "../utils/extractEmail";

export class MemberInfoService {
    private supabase: SupabaseClient;
    
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
     * Get member info
     * @param user_id 
     * @returns information about the member
     */
    async getMemberInfo(user_id: string) {
        const { data: member_info, error } = await this.supabase
            .from('member_info')
            .select('*')
            .eq('user_id', user_id)

        if (error) throw error;
        return member_info;
    }

   

    /**
     * Search for a member
     * @param search_query 
     * @returns information about the member
     */
    async search(search_query: string) {
        const { data, error } = await this.supabase
            .from('member_info_search')
            .select('*')
            .ilike('search_text', `%${search_query}%`)

        if (error) throw error;



        // Get email for each member
        const membersWithEmail = await Promise.all(
            data.map(async (member) => {
                const email = await extractEmail(member.user_id);
                return {
                    ...member,
                    user_email: email || null
                };
            })
        );

        return membersWithEmail;
    }

    /**
     * Edit member info
     * @param user_id - The user id of the member
     * @param bio - The bio of the member
     * @param internship - The internship of the member
     * @param first_name - The first name of the member
     * @param last_name - The last name of the member
     * @param year - The year of the member
     * @param major - The major of the member
     * @returns the updated member info
     */
    async editMemberInfo(user_id: string, bio: string, internship: string, first_name: string, last_name: string, year: string, major: string, contact_me: boolean) {
        const { data, error } = await this.supabase
            .from('member_info')
            .update({ bio, internship, first_name, last_name, year, major, contact_me })
            .eq('user_id', user_id)
            .select();

        if (error) throw error;
        return data;
    }


    /**
     * Edit member bio
     * @param user_id - The user id of the member
     * @param bio - The bio of the member
     * @returns the updated member info
     */
    async editMemberBio(user_id: string, bio: string) {
        const { data, error } = await this.supabase
            .from('member_info')
            .update({ bio: bio })
            .eq('user_id', user_id)
            .select();

        if (error) throw error;
        return data;
    }

    /**
     * Edit member internship
     * @param user_id - The user id of the member
     * @param internship - The internship of the member
     * @returns the updated member info
     */
    async editMemberInternship(user_id: string, internship: string) {
        const { data, error } = await this.supabase
            .from('member_info')
            .update({ internship: internship })
            .eq('user_id', user_id)
            .select();

        if (error) throw error;
        return data;
    }

    /**
     * Delete member
     * @param user_id - The user id of the member
     * @returns the updated member info
     */
    async deleteMember(user_id: string) {
        const { data, error } = await this.supabase
            .from('member_info')
            .delete()
            .eq('user_id', user_id)
            .select();
        if (error) throw error;
        return data;
    }

    /**
     * Add member
     * @param user_id - The user id of the member
     * @returns the updated member info
     */
    async addMember(user_id: string) {
        const { data, error } = await this.supabase
            .from('member_info')
            .insert({ user_id })
            .select();

        if (error) throw error;
        return data;
    }
    
    /**
     * Edit member first name
     * @param user_id - The user id of the member
     * @param first_name - The first name of the member
     * @returns the updated member info
     */
    async editMemberFirstName(user_id: string, first_name: string) {
        const { data, error } = await this.supabase
            .from('member_info')
            .update({ first_name: first_name })
            .eq('user_id', user_id)
            .select();

        if (error) throw error;
        return data;
    }

    /**
     * Edit member last name
     * @param user_id - The user id of the member
     * @param last_name - The last name of the member
     * @returns the updated member info
     */
    async editMemberLastName(user_id: string, last_name: string) {
        const { data, error } = await this.supabase
            .from('member_info')
            .update({ last_name: last_name })
            .eq('user_id', user_id)
            .select();

        if (error) throw error;
        return data;
    }

    /**
     * Edit member year
     * @param user_id - The user id of the member
     * @param year - The year of the member
     * @returns the updated member info
     */
    async editMemberYear(user_id: string, year: string) {
        const { data, error } = await this.supabase
            .from('member_info')
            .update({ year: year })
            .eq('user_id', user_id)
            .select();

        if (error) throw error;
        return data;
    }

    /**
     * Edit member major
     * @param user_id - The user id of the member
     * @param major - The major of the member
     * @returns the updated member info
     */
    async editMemberMajor(user_id: string, major: string) {
        const { data, error } = await this.supabase
            .from('member_info')
            .update({ major: major })
            .eq('user_id', user_id)
            .select();

        if (error) throw error;
        return data;
    }
}