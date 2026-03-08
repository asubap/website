import { useState } from "react";
import EmailList from "../../../components/admin/EmailList";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import AddUserModal from "../../../components/admin/AddUserModal";
import type { MemberDetail, MemberSummary } from "../adminTypes";

interface MembersSectionProps {
  members: MemberSummary[];
  loading: boolean;
  memberDetails: Record<string, MemberDetail>;
  onArchive: (email: string) => Promise<void>;
  onEditFetch: (email: string) => Promise<void>;
  onSaveMember: (data: MemberDetail) => Promise<void>;
  onAdd: (emails: string[], onDone?: () => void) => void;
  refreshArchived?: (() => void) | null;
}

export function MembersSection({
  members,
  loading,
  memberDetails,
  onArchive,
  onEditFetch,
  onSaveMember,
  onAdd,
  refreshArchived,
}: MembersSectionProps) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="order-6 md:order-6">
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-semibold">General Members</h2>
      </div>
      {loading ? (
        <LoadingSpinner text="Loading members..." size="md" />
      ) : (
        <EmailList
          emails={members}
          onDelete={onArchive}
          userType="member"
          onEdit={onEditFetch}
          onSave={onSaveMember}
          memberDetails={memberDetails}
          onCreateNew={() => setAddOpen(true)}
          showRankFilter={true}
          useArchiveForDelete={true}
          onArchiveSuccess={refreshArchived ?? undefined}
        />
      )}
      {addOpen && (
        <AddUserModal
          role="general-member"
          title="Add General Member"
          label="Email Addresses"
          buttonText="Add Member"
          onClose={() => setAddOpen(false)}
          onUserAdded={(newMembers) =>
            onAdd(newMembers, () => setAddOpen(false))
          }
        />
      )}
    </div>
  );
}
