import { useState } from "react";
import EmailList from "../../../components/admin/EmailList";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import AddUserModal from "../../../components/admin/AddUserModal";

interface AdminUsersSectionProps {
  emails: string[];
  loading: boolean;
  onDelete: (email: string) => Promise<void>;
  onAdd: (emails: string[], onDone?: () => void) => void;
}

export function AdminUsersSection({
  emails,
  loading,
  onDelete,
  onAdd,
}: AdminUsersSectionProps) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="order-4 md:order-4">
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-semibold">Admin Users</h2>
      </div>
      {loading ? (
        <LoadingSpinner text="Loading admins..." size="md" />
      ) : (
        <EmailList
          emails={emails.map((email) => ({ email }))}
          onDelete={onDelete}
          userType="admin"
          clickable={false}
          onCreateNew={() => setAddOpen(true)}
        />
      )}
      {addOpen && (
        <AddUserModal
          role="e-board"
          title="Add Admin"
          label="Email Addresses"
          buttonText="Add Admin"
          onClose={() => setAddOpen(false)}
          onUserAdded={(newAdmins) =>
            onAdd(newAdmins, () => setAddOpen(false))
          }
        />
      )}
    </div>
  );
}
