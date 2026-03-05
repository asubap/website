import { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { getNavLinks } from "../../components/nav/NavLink";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAuth } from "../../context/auth/authProvider";
import { useToast } from "../../context/toast/ToastContext";
import { archiveMember } from "../../services/memberArchiveService";
import ResourceManagement from "../../components/admin/ResourceManagement";
import EboardManagement from "../../components/admin/EboardManagement";

import { useUsersSummary } from "./hooks/useUsersSummary";
import { useSponsors } from "./hooks/useSponsors";
import { useConfirmDialog } from "./hooks/useConfirmDialog";
import { useMemberDetails } from "./hooks/useMemberDetails";
import { authFetch, getToken } from "./adminApi";

import { AdminAnnouncementsSection } from "./sections/AdminAnnouncementsSection";
import { AdminUsersSection } from "./sections/AdminUsersSection";
import { SponsorsSection } from "./sections/SponsorsSection";
import { MembersSection } from "./sections/MembersSection";
import { ArchivedMembersSection } from "./sections/ArchivedMembersSection";
import { AlumniMembersSection } from "./sections/AlumniMembersSection";

const Admin = () => {
  const { role, session, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirmDialog();

  const {
    adminEmails,
    setAdminEmails,
    members,
    setMembers,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useUsersSummary();

  const {
    sponsors,
    setSponsors,
    tiers,
    addSponsor,
    deleteSponsor,
    updateTier,
    updateProfile,
  } = useSponsors();

  const { memberDetails, setMemberDetails, fetchOrGet } = useMemberDetails();
  const [refreshArchivedMembers, setRefreshArchivedMembers] = useState<
    (() => void) | null
  >(null);

  const handleDeleteUser = async (email: string) => {
    const token = getToken(session);
    if (!token) return;
    try {
      await authFetch(token, "/users/delete-user", {
        method: "POST",
        body: JSON.stringify({ user_email: email }),
      });
      setAdminEmails((p) => p.filter((e) => e !== email));
      setMembers((p) => p.filter((m) => m.email !== email));
      setSponsors((p) => p.filter((e) => e !== email));
    } catch (e) {
      console.error("Error deleting user:", e);
    }
  };

  const handleArchiveMember = async (email: string) => {
    const token = getToken(session);
    if (!token) return;
    try {
      await archiveMember(email, token);
      setMembers((p) => p.filter((m) => m.email !== email));
    } catch (e) {
      console.error("Error archiving member:", e);
      throw e;
    }
  };

  const handleAddAdmins = (newAdmins: string[], onDone?: () => void) => {
    confirm.show(
      "Confirm Add Admins",
      `Are you sure you want to add ${newAdmins.length} new admin(s)?`,
      () => {
        setAdminEmails((p) => [...p, ...newAdmins]);
        showToast(`${newAdmins.length} admin(s) added successfully`, "success");
        onDone?.();
      },
      "Confirm Add"
    );
  };

  const handleAddMembers = (newMembers: string[], onDone?: () => void) => {
    confirm.show(
      "Confirm Add Members",
      `Are you sure you want to add ${newMembers.length} new member(s)?`,
      () => {
        setMembers((p) => [
          ...p,
          ...newMembers.map((email) => ({ email, name: undefined })),
        ]);
        showToast(`${newMembers.length} member(s) added successfully`, "success");
        refetchUsers();
        onDone?.();
      },
      "Confirm Add"
    );
  };

  const handleSaveMember = async (data: import("../../types").MemberDetail) => {
    setMemberDetails(data.email, data);
    showToast("Member details updated successfully", "success");
    await refetchUsers();
  };

  return (
    <div className="flex flex-col min-h-screen font-outfit">
      <Navbar
        links={getNavLinks(isAuthenticated)}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        isLogged={isAuthenticated}
        role={role}
      />

      <div className="flex flex-col flex-grow p-8 pt-32 px-8 sm:px-16 lg:px-24">
        <main className="order-1 md:order-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-bapred mb-6 text-center">
            Admin Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
            <AdminAnnouncementsSection />

            <AdminUsersSection
              emails={adminEmails}
              loading={usersLoading}
              onDelete={handleDeleteUser}
              onAdd={handleAddAdmins}
            />

            <SponsorsSection
              sponsors={sponsors}
              tiers={tiers}
              onDelete={deleteSponsor}
              onAdd={addSponsor}
              onTierChange={updateTier}
              onProfileUpdate={updateProfile}
              showConfirm={confirm.show}
            />

            <MembersSection
              members={members}
              loading={usersLoading}
              memberDetails={memberDetails}
              onArchive={handleArchiveMember}
              onEditFetch={fetchOrGet}
              onSaveMember={handleSaveMember}
              onAdd={handleAddMembers}
              refreshArchived={refreshArchivedMembers}
            />

            <ArchivedMembersSection
              onMemberRestored={refetchUsers}
              onRefreshRequested={(fn) => setRefreshArchivedMembers(() => fn)}
            />

            <AlumniMembersSection />

            <div className="order-9 md:order-9 col-span-1 md:col-span-2 pb-8">
              <ResourceManagement />
            </div>
            <div className="order-10 md:order-10 col-span-1 md:col-span-2 pb-8">
              <EboardManagement />
            </div>
          </div>
        </main>
      </div>

      <Footer backgroundColor="#AF272F" />

      <ConfirmDialog
        isOpen={confirm.info.isOpen}
        onClose={confirm.close}
        onConfirm={confirm.info.onConfirm}
        title={confirm.info.title}
        message={confirm.info.message}
        confirmText={confirm.info.confirmText ?? "Confirm"}
        cancelText={confirm.info.cancelText ?? "Cancel"}
      />
    </div>
  );
};

export default Admin;
