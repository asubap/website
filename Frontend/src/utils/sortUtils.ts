import { useState, useCallback, useMemo } from "react";
import { MemberDetail, Sponsor } from "../types";

/**
 * Consolidated sorting utilities
 * Contains: pure functions, field configurations, and custom hook
 */

export type SortDirection = 'asc' | 'desc';

// ============================================================================
// PURE SORT FUNCTIONS
// ============================================================================

/**
 * Generic string comparator
 * Uses localeCompare for proper alphabetical sorting (case-insensitive)
 */
export const sortByString = (
  a: string,
  b: string,
  direction: SortDirection
): number => {
  const compareResult = a.localeCompare(b, undefined, { sensitivity: 'base' });
  return direction === 'asc' ? compareResult : -compareResult;
};

/**
 * Generic number comparator
 */
export const sortByNumber = (
  a: number,
  b: number,
  direction: SortDirection
): number => {
  const compareResult = a - b;
  return direction === 'asc' ? compareResult : -compareResult;
};

/**
 * Get numeric value for sponsor tier
 * Higher tiers get higher values
 */
export const getTierValue = (tier: string | undefined): number => {
  if (!tier) return 0;
  const lowerTier = tier.toLowerCase();

  switch (lowerTier) {
    case 'platinum':
      return 4;
    case 'gold':
      return 3;
    case 'silver':
      return 2;
    case 'bronze':
      return 1;
    default:
      return 0;
  }
};

/**
 * Sort by sponsor tier (Platinum > Gold > Silver > Bronze)
 */
export const sortByTier = (
  a: string | undefined,
  b: string | undefined,
  direction: SortDirection
): number => {
  const aValue = getTierValue(a);
  const bValue = getTierValue(b);
  return sortByNumber(aValue, bValue, direction);
};

/**
 * Get numeric value for member rank
 * Current > Pledge > Alumni
 */
export const getRankValue = (rank: string): number => {
  const lowerRank = rank.toLowerCase();

  switch (lowerRank) {
    case 'current':
    case 'inducted':
      return 3;
    case 'pledge':
      return 2;
    case 'alumni':
      return 1;
    default:
      return 0;
  }
};

/**
 * Sort by member rank (Current > Pledge > Alumni)
 */
export const sortByRank = (
  a: string,
  b: string,
  direction: SortDirection
): number => {
  const aValue = getRankValue(a);
  const bValue = getRankValue(b);
  return sortByNumber(aValue, bValue, direction);
};

// ============================================================================
// FIELD CONFIGURATIONS
// ============================================================================

/**
 * Member sort field mappings
 * Eliminates the need for large switch statements
 */
export const memberSortFields: Record<
  string,
  (a: MemberDetail, b: MemberDetail, direction: SortDirection) => number
> = {
  name: (a, b, dir) => sortByString(a.name, b.name, dir),
  graduation: (a, b, dir) => sortByString(a.graduationDate, b.graduationDate, dir),
  major: (a, b, dir) => sortByString(a.major, b.major, dir),
  rank: (a, b, dir) => sortByRank(a.rank, b.rank, dir),
  status: (a, b, dir) => sortByString(a.status, b.status, dir),
  hours: (a, b, dir) => sortByNumber(parseFloat(a.hours) || 0, parseFloat(b.hours) || 0, dir),
  email: (a, b, dir) => sortByString(a.email, b.email, dir),
};

/**
 * Sponsor sort field mappings
 */
export const sponsorSortFields: Record<
  string,
  (a: Sponsor, b: Sponsor, direction: SortDirection) => number
> = {
  name: (a, b, dir) => sortByString(a.name, b.name, dir),
  tier: (a, b, dir) => sortByTier(a.tier, b.tier, dir),
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Generic sorting hook that works with any data type
 * Eliminates code duplication across pages
 *
 * @param data - Array of items to sort
 * @param defaultSort - Default sort option (e.g., "name-asc")
 * @param sortFields - Configuration object mapping field names to sort functions
 * @returns Object with sortBy state, sorted data, and change handler
 */
export function useSort<T>(
  data: T[],
  defaultSort: string,
  sortFields: Record<string, (a: T, b: T, direction: SortDirection) => number>
) {
  const [sortBy, setSortBy] = useState<string>(defaultSort);

  // Apply sorting based on current sort option
  const sortedData = useMemo(() => {
    const [field, direction] = sortBy.split('-') as [string, SortDirection];
    const sortFn = sortFields[field];

    if (!sortFn) {
      console.warn(`Sort field "${field}" not found in configuration`);
      return data;
    }

    return [...data].sort((a, b) => sortFn(a, b, direction));
  }, [data, sortBy, sortFields]);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
  }, []);

  return {
    sortBy,
    sortedData,
    handleSortChange,
  };
}
