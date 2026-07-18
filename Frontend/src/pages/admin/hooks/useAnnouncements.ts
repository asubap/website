import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../context/auth/authProvider";
import { useToast } from "../../../context/toast/ToastContext";
import { getToken, authFetch, sortAnnouncements } from "../adminApi";
import type { Announcement } from "../adminTypes";

export function useAnnouncements() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const token = getToken(session);
    if (!token) return;
    setLoading(true);
    try {
      const res = await authFetch(token, "/announcements");
      const data = await res.json();
      setAnnouncements(sortAnnouncements(data));
    } catch (e) {
      console.error("Error fetching announcements:", e);
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

  const create = useCallback(
    (newAnnouncement: Announcement) => {
      setAnnouncements((prev) =>
        sortAnnouncements([...prev, newAnnouncement])
      );
      showToast("Announcement created successfully", "success");
    },
    [showToast]
  );

  const update = useCallback(
    (updated: Announcement) => {
      setAnnouncements((prev) =>
        sortAnnouncements(
          prev.map((a) => (a.id === updated.id ? updated : a))
        )
      );
      showToast("Announcement updated successfully", "success");
    },
    [showToast]
  );

  const remove = useCallback(
    async (announcementId: string) => {
      const token = getToken(session);
      if (!token) return;
      try {
        const res = await authFetch(token, "/announcements/delete-announcement", {
          method: "POST",
          body: JSON.stringify({ announcement_id: announcementId }),
        });
        if (!res.ok) throw new Error("Failed to delete announcement");
        setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
        showToast("Announcement deleted successfully", "success");
      } catch (e) {
        console.error("Error deleting announcement:", e);
        showToast("Failed to delete announcement. Please try again.", "error");
      }
    },
    [session, showToast]
  );

  return {
    announcements,
    setAnnouncements,
    loading,
    refetch,
    create,
    update,
    remove,
  };
}
