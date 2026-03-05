import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../context/auth/authProvider";
import { useToast } from "../../../context/toast/ToastContext";
import { getToken, authFetch } from "../adminApi";
import type { ApiSponsor, SponsorUpdateData } from "../adminTypes";

export function useSponsors() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [tiers, setTiers] = useState<string[]>([]);

  const refetch = useCallback(async () => {
    const token = getToken(session);
    if (!token) return;
    try {
      const res = await authFetch(token, "/sponsors/");
      if (!res.ok) return;
      const data = await res.json();
      setSponsors(data.map((s: ApiSponsor) => s.company_name));
      setTiers(data.map((s: ApiSponsor) => s.tier));
    } catch (e) {
      console.error("Error fetching sponsors:", e);
      showToast("Failed to refresh sponsor data", "error");
    }
  }, [session, showToast]);

  useEffect(() => {
    if (!session) return;
    refetch();
  }, [session, refetch]);

  const addSponsor = useCallback(
    async (newSponsor: ApiSponsor) => {
      const token = getToken(session);
      if (!token) return;
      try {
        await refetch();
      } catch {
        setSponsors((p) => [...p, newSponsor.company_name]);
        setTiers((p) => [...p, newSponsor.tier]);
      }
      showToast("Sponsor added successfully", "success");
    },
    [session, showToast, refetch]
  );

  const deleteSponsor = useCallback(
    async (sponsorName: string) => {
      const token = getToken(session);
      if (!token) return;
      try {
        await authFetch(token, "/sponsors/delete-sponsor", {
          method: "POST",
          body: JSON.stringify({ sponsor_name: sponsorName }),
        });
        setSponsors((p) => p.filter((e) => e !== sponsorName));
        showToast("Sponsor deleted successfully", "success");
      } catch (e) {
        console.error("Error deleting sponsor:", e);
      }
    },
    [session, showToast]
  );

  const updateTier = useCallback(
    async (sponsorName: string, newTier: string) => {
      const token = getToken(session);
      if (!token) {
        showToast("Authentication error. Please log in again.", "error");
        return;
      }
      try {
        const res = await authFetch(token, "/sponsors/change-sponsor-tier", {
          method: "POST",
          body: JSON.stringify({ sponsor_name: sponsorName, tier: newTier }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to change tier");
        }
        showToast("Sponsor tier updated successfully", "success");
        await refetch();
      } catch (e) {
        console.error("Error updating sponsor tier:", e);
        showToast(
          e instanceof Error ? e.message : "Failed to update sponsor tier.",
          "error"
        );
      }
    },
    [session, showToast, refetch]
  );

  const updateProfile = useCallback(
    async (data: SponsorUpdateData) => {
      const token = getToken(session);
      if (!token) {
        showToast("Authentication error. Please log in again.", "error");
        return;
      }
      try {
        const res = await authFetch(
          token,
          `/sponsors/${data.companyName}/details`,
          {
            method: "POST",
            body: JSON.stringify({
              about: data.description,
              links: data.links,
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to update sponsor details");
        }
        showToast("Sponsor details updated successfully", "success");
        await refetch();
      } catch (e) {
        console.error("Error updating sponsor details:", e);
        showToast(
          e instanceof Error ? e.message : "Failed to update sponsor details.",
          "error"
        );
      }
    },
    [session, showToast, refetch]
  );

  return {
    sponsors,
    tiers,
    setSponsors,
    setTiers,
    refetch,
    addSponsor,
    deleteSponsor,
    updateTier,
    updateProfile,
  };
}
