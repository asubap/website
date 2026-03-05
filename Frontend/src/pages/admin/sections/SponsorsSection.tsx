import { useState } from "react";
import SponsorList from "../../../components/admin/SponsorList";
import AddSponsorModal from "../../../components/admin/AddSponsorModal";
import type { ApiSponsor } from "../adminTypes";

interface SponsorsSectionProps {
  sponsors: string[];
  tiers: string[];
  onDelete: (name: string) => Promise<void>;
  onAdd: (s: ApiSponsor) => Promise<void>;
  onTierChange: (email: string, newTier: string) => Promise<void>;
  onProfileUpdate: (data: {
    companyName: string;
    description: string;
    links: string[];
  }) => Promise<void>;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void;
}

export function SponsorsSection({
  sponsors,
  tiers,
  onDelete,
  onAdd,
  onTierChange,
  onProfileUpdate,
  showConfirm,
}: SponsorsSectionProps) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="order-5 md:order-5">
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-semibold">Sponsors</h2>
      </div>
      <SponsorList
        emails={sponsors}
        tiers={tiers}
        onDelete={onDelete}
        userType="sponsor"
        onTierChangeConfirm={(email, newTier) =>
          showConfirm(
            "Confirm Tier Change",
            `Are you sure you want to change ${email}'s tier to ${newTier}?`,
            () => onTierChange(email, newTier),
            "Confirm Change"
          )
        }
        onProfileUpdateConfirm={onProfileUpdate}
        showConfirmationDialog={showConfirm}
        onCreateNew={() => setAddOpen(true)}
      />
      {addOpen && (
        <AddSponsorModal
          onClose={() => setAddOpen(false)}
          onSponsorAdded={(s) => {
            onAdd(s);
            setAddOpen(false);
          }}
        />
      )}
    </div>
  );
}
