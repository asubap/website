import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "../../../context/auth/authProvider";
import { useToast } from "../../../context/toast/ToastContext";
import { getToken, authFetch } from "../adminApi";
import type { MemberDetail } from "../adminTypes";

export function useMemberDetails() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [memberDetails, setMemberDetails] = useState<Record<string, MemberDetail>>({});
  const detailsRef = useRef(memberDetails);
  useEffect(() => {
    detailsRef.current = memberDetails;
  }, [memberDetails]);

  const fetchOrGet = useCallback(
    async (email: string): Promise<void> => {
      const key = email.trim().toLowerCase();
      if (detailsRef.current[key]) return;
      const token = getToken(session);
      if (!token) {
        showToast("Authentication error. Please log in again.", "error");
        return;
      }
      try {
        const res = await authFetch(
          token,
          `/member-info/${encodeURIComponent(email)}`
        );
        if (!res.ok) throw new Error("Failed to fetch member details");
        const raw = await res.json();
        const fresh: MemberDetail = {
          id: raw.id?.toString() || raw.user_id || raw.user_email,
          email: raw.user_email || raw.email || "",
          name: raw.name || "",
          phone: raw.phone || "",
          major: raw.major || "",
          graduationDate: raw.graduating_year
            ? String(raw.graduating_year)
            : raw.graduationDate || "",
          status: raw.member_status || raw.status || "Not Specified",
          about: raw.about || "",
          internship: raw.internship || "Not Specified",
          photoUrl: raw.profile_photo_url || raw.photoUrl || "",
          hours:
            raw.total_hours !== undefined
              ? String(raw.total_hours)
              : raw.hours || "0",
          developmentHours: raw.development_hours?.toString() ?? "0",
          professionalHours: raw.professional_hours?.toString() ?? "0",
          serviceHours: raw.service_hours?.toString() ?? "0",
          socialHours: raw.social_hours?.toString() ?? "0",
          links: Array.isArray(raw.links) ? raw.links : [],
          rank: raw.rank || raw.role || "Not Provided",
          role: raw.role || "general-member",
          event_attendance: raw.event_attendance || [],
        };
        setMemberDetails((prev) => ({ ...prev, [key]: fresh }));
      } catch (e) {
        console.error("Error fetching member details:", e);
        showToast("Failed to fetch member details", "error");
      }
    },
    [session, showToast]
  );

  const setCached = useCallback((email: string, data: MemberDetail) => {
    setMemberDetails((prev) => ({
      ...prev,
      [email.trim().toLowerCase()]: data,
    }));
  }, []);

  return { memberDetails, setMemberDetails: setCached, fetchOrGet };
}
