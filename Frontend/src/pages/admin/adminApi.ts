import type { Announcement } from "../../types";

const BASE = import.meta.env.VITE_BACKEND_URL;

export const getToken = (session: { access_token?: string } | null) =>
  session?.access_token ?? null;

export const authFetch = (
  token: string,
  path: string,
  options: RequestInit = {}
) =>
  fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  });

export const sortAnnouncements = (list: Announcement[]) =>
  [...list].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
