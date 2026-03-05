import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../context/auth/authProvider";
import { getToken, authFetch } from "../adminApi";
import type { UserInfo } from "../adminTypes";
import type { MemberSummary } from "../adminTypes";

export function useUsersSummary() {
  const { session } = useAuth();
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const token = getToken(session);
    if (!token) return;
    setLoading(true);
    try {
      const res = await authFetch(token, "/users/summary");
      const data = await res.json();
      const admins = (data as (UserInfo & { rank?: string })[])
        .filter((i) => i.role === "e-board")
        .map((i) => i.email);
      const generalMembers = (data as (UserInfo & { rank?: string })[])
        .filter((i) => i.role === "general-member")
        .map((i) => ({
          email: i.email,
          name: i.name,
          rank: i.rank
            ? i.rank.charAt(0).toUpperCase() + i.rank.slice(1)
            : "Not Specified",
        }));
      setAdminEmails(admins);
      setMembers(generalMembers);
    } catch (e) {
      console.error("Error fetching users summary:", e);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    refetch();
  }, [session, refetch]);

  return {
    adminEmails,
    setAdminEmails,
    members,
    setMembers,
    loading,
    refetch,
  };
}
