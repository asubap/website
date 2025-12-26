/**
 * Permission utility for checking feature access based on user rank and role
 */

export type PermissionFeature =
  | 'event-rsvp'
  | 'event-checkin'
  | 'announcements'
  | 'slack-access';

/**
 * Check if a user can access a specific feature based on their rank
 * @param rank - User's member rank (pledge, inducted, alumni)
 * @param feature - The feature to check access for
 * @returns true if user can access the feature, false otherwise
 */
export const canAccessFeature = (
  rank: string | undefined,
  feature: PermissionFeature
): boolean => {
  // Normalize rank to lowercase for comparison
  const normalizedRank = rank?.toLowerCase();

  // Alumni restrictions: rank="alumni" blocks certain features
  if (normalizedRank === "alumni") {
    const alumniBlockedFeatures: PermissionFeature[] = [
      'event-rsvp',
      'event-checkin',
      'announcements',
      'slack-access',
    ];
    return !alumniBlockedFeatures.includes(feature);
  }

  // Default allow for non-alumni members
  return true;
};

/**
 * Check if a user has alumni rank
 * @param rank - User's member rank
 * @returns true if user is alumni, false otherwise
 */
export const isAlumni = (rank: string | undefined): boolean => {
  return rank?.toLowerCase() === "alumni";
};
