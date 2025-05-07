import React, { FormEvent, RefObject } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import EmailList from "./EmailList";

interface AdminMembersSectionProps {
  members: string[];
  loadingMembers: boolean;
  memberInputError: boolean;
  memberFormRef: RefObject<HTMLFormElement | null>;
  handleAddMember: (e: FormEvent<HTMLFormElement>) => void;
  handleInputFocus: () => void;
  handleDeleteMember: (email: string) => void;
}

const AdminMembersSection: React.FC<AdminMembersSectionProps> = ({
  members,
  loadingMembers,
  memberInputError,
  memberFormRef,
  handleAddMember,
  handleInputFocus,
  handleDeleteMember,
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
      />
    )}
  </div>
);

export default AdminMembersSection;
