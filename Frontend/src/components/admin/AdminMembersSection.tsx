import React, { FormEvent, RefObject } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import EmailList from "./EmailList";
import { MemberDetail } from "../../types"; // Assuming MemberDetail is the correct type for member objects

interface AdminMembersSectionProps {
  members: Array<{ email: string; name?: string; role?: string }>; // Changed to array of objects
  loadingMembers: boolean;
  memberInputError?: boolean; // Made optional as it might not be used if add form is elsewhere
  memberFormRef?: RefObject<HTMLFormElement | null>; // Made optional
  handleAddMember?: (e: FormEvent<HTMLFormElement>) => void; // Made optional
  handleInputFocus?: () => void; // Made optional
  handleDeleteMember: (email: string) => void; // Keep this, EmailList uses it
  // Add props needed by EmailList for editing, if this section handles it:
  onEditMember?: (email: string) => void;
  onSaveMember?: (updatedData: MemberDetail) => void;
  memberDetails?: { [key: string]: MemberDetail };
}

const AdminMembersSection: React.FC<AdminMembersSectionProps> = ({
  members,
  loadingMembers,
  memberInputError,
  memberFormRef,
  handleAddMember,
  handleInputFocus,
  handleDeleteMember,
  onEditMember,
  onSaveMember,
  memberDetails,
}) => (
  <div>
    <h2 className="text-2xl font-semibold mb-2">General Members</h2>
    <form
      className="flex gap-4 justify-between items-center"
      onSubmit={handleAddMember}
      ref={memberFormRef}
    >
      <input
        type="text"
        placeholder="Enter member email.."
        className={`w-3/4 px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-bapred transition-colors ${
          memberInputError ? "border-red-500 bg-red-50" : "border-gray-300"
        }`}
        name="email"
        onFocus={handleInputFocus}
      />
      <button className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors whitespace-nowrap">
        + <span className="hidden md:inline">Add </span>Member
      </button>
    </form>
    {loadingMembers ? (
      <LoadingSpinner text="Loading members..." size="md" />
    ) : (
      <EmailList
        emails={members}
        onDelete={handleDeleteMember}
        userType="admin"
        onEdit={onEditMember}
        onSave={onSaveMember}
        memberDetails={memberDetails}
      />
    )}
  </div>
);

export default AdminMembersSection;
