import type { MemberRank } from '../types';

export const MEMBER_RANK_OPTIONS: { value: MemberRank; label: string }[] = [
  { value: 'pledge', label: 'Pledge' },
  { value: 'returning-candidate', label: 'Returning Candidate' },
  { value: 'inducted', label: 'Inducted' },
  { value: 'alumni', label: 'Alumni' },
];

export function formatMemberRank(rank?: string | null): string {
  if (!rank) return 'Not Provided';
  const normalized = rank.toLowerCase().trim().replace(/\s+/g, '-');
  return MEMBER_RANK_OPTIONS.find(option => option.value === normalized)?.label ?? rank;
}
