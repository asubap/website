/**
 * Member Archive/Restore Service
 * Handles API calls for archiving and restoring members
 */

export interface ArchiveResponse {
  success: boolean;
  message: string;
}

export interface ArchivedMember {
  email: string;
  name: string;
  deleted_at: string;
  role: string;
  rank?: string;
  major?: string;
  graduating_year?: number;
  photoUrl?: string;
}

/**
 * Archive a member (soft delete)
 * @param email - Member's email address
 * @param token - JWT authentication token
 */
export const archiveMember = async (
  email: string,
  token: string
): Promise<ArchiveResponse> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/member-info/${email}/archive`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "Failed to archive member",
    }));
    throw new Error(errorData.error || "Failed to archive member");
  }

  return await response.json();
};

/**
 * Restore an archived member
 * @param email - Member's email address
 * @param token - JWT authentication token
 */
export const restoreMember = async (
  email: string,
  token: string
): Promise<ArchiveResponse> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/member-info/${email}/restore`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "Failed to restore member",
    }));
    throw new Error(errorData.error || "Failed to restore member");
  }

  return await response.json();
};

/**
 * Get all archived members
 * @param token - JWT authentication token
 */
export const getArchivedMembers = async (
  token: string
): Promise<ArchivedMember[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/member-info/archived`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "Failed to get archived members",
    }));
    throw new Error(errorData.error || "Failed to get archived members");
  }

  return await response.json();
};
