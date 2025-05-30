import React, { FormEvent, RefObject } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import EmailList from "./EmailList";

interface AdminUsersSectionProps {
  adminEmails: string[];
  loadingAdmins: boolean;
  adminInputError: boolean;
  adminFormRef: RefObject<HTMLFormElement | null>;
  handleAddAdmin: (e: FormEvent<HTMLFormElement>) => void;
  handleInputFocus: () => void;
  handleDeleteAdmin: (email: string) => void;
}

const AdminUsersSection: React.FC<AdminUsersSectionProps> = ({
  adminEmails,
  loadingAdmins,
  adminInputError,
  adminFormRef,
  handleAddAdmin,
  handleInputFocus,
  handleDeleteAdmin,
}) => (
  <div>
    <h2 className="text-2xl font-semibold mb-2">Admin Users</h2>
    <form
      className="flex gap-4 justify-between items-center"
      onSubmit={handleAddAdmin}
      ref={adminFormRef}
    >
      <input
        type="text"
        placeholder="Enter admin email.."
        className={`w-3/4 px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-bapred transition-colors ${
          adminInputError ? "border-red-500 bg-red-50" : "border-gray-300"
        }`}
        name="email"
        onFocus={handleInputFocus}
      />
      <button className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors whitespace-nowrap">
        + <span className="hidden md:inline">Add </span>Admin
      </button>
    </form>
    {loadingAdmins ? (
      <LoadingSpinner text="Loading admins..." size="md" />
    ) : (
      <EmailList
        emails={adminEmails.map((email) => ({ email }))}
        onDelete={handleDeleteAdmin}
        userType="admin"
      />
    )}
  </div>
);

export default AdminUsersSection;
