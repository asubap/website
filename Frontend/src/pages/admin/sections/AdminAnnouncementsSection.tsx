import { useState } from "react";
import { useAnnouncements } from "../hooks/useAnnouncements";
import { AnnouncementListShort } from "../../../components/announcement/AnnouncementListShort";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import CreateAnnouncementModal from "../../../components/admin/CreateAnnouncementModal";
import EditAnnouncementModal from "../../../components/admin/EditAnnouncementModal";
import ViewAnnouncementModal from "../../../components/admin/ViewAnnouncementModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import type { Announcement } from "../adminTypes";

export function AdminAnnouncementsSection() {
  const {
    announcements,
    loading,
    create,
    update,
    remove,
  } = useAnnouncements();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toEdit, setToEdit] = useState<Announcement | null>(null);
  const [toView, setToView] = useState<Announcement | null>(null);
  const [toDelete, setToDelete] = useState<Announcement | null>(null);

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    await remove(toDelete.id);
    setDeleteOpen(false);
    setToDelete(null);
  };

  return (
    <div className="order-3 md:order-2">
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-semibold">Announcements</h2>
      </div>
      {loading ? (
        <LoadingSpinner text="Loading announcements..." size="md" />
      ) : (
        <AnnouncementListShort
          announcements={announcements}
          onEdit={(a) => {
            setToEdit(a);
            setEditOpen(true);
          }}
          onView={(a) => {
            setToView(a);
            setViewOpen(true);
          }}
          onDelete={(a) => {
            setToDelete(a);
            setDeleteOpen(true);
          }}
          onCreateNew={() => setCreateOpen(true)}
        />
      )}

      {createOpen && (
        <CreateAnnouncementModal
          onClose={() => setCreateOpen(false)}
          onAnnouncementCreated={(a) => {
            create(a);
            setCreateOpen(false);
          }}
        />
      )}
      {editOpen && toEdit && (
        <EditAnnouncementModal
          isOpen={editOpen}
          onClose={() => {
            setEditOpen(false);
            setToEdit(null);
          }}
          announcementToEdit={toEdit}
          onAnnouncementUpdated={(a) => {
            update(a);
            setEditOpen(false);
            setToEdit(null);
          }}
        />
      )}
      {viewOpen && toView && (
        <ViewAnnouncementModal
          isOpen={viewOpen}
          onClose={() => {
            setViewOpen(false);
            setToView(null);
          }}
          announcement={toView}
        />
      )}
      <ConfirmationModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
