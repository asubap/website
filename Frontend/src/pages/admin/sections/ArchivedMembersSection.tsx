import ArchivedMembersList from "../../../components/admin/ArchivedMembersList";

interface ArchivedMembersSectionProps {
  onMemberRestored: () => void;
  onRefreshRequested: (fn: () => void) => void;
}

export function ArchivedMembersSection({
  onMemberRestored,
  onRefreshRequested,
}: ArchivedMembersSectionProps) {
  return (
    <div className="order-7 md:order-7">
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-semibold">Archived Members</h2>
      </div>
      <ArchivedMembersList
        onMemberRestored={onMemberRestored}
        onRefreshRequested={onRefreshRequested}
      />
    </div>
  );
}
