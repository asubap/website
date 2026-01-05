import { Sponsor } from "../../types";
import Modal from "../ui/Modal";
import { Info, Link as LinkIcon, Mail, Check, Eye } from 'lucide-react';
import { useToast } from "../../context/toast/ToastContext";
import { useState, useEffect } from "react";
import ResourcePreviewModal from "../ui/ResourcePreviewModal";
import { useAuth } from "../../context/auth/authProvider";
import LoadingSpinner from "../common/LoadingSpinner";

interface SponsorProfileModalProps {
  sponsor: Sponsor;
  isOpen: boolean;
  onClose: () => void;
}

const SponsorProfileModal: React.FC<SponsorProfileModalProps> = ({
  sponsor,
  isOpen,
  onClose,
}) => {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [previewResource, setPreviewResource] = useState<{ name: string; signed_url: string; mime_type?: string } | null>(null);
  const { showToast } = useToast();
  const { session } = useAuth();
  const [fullSponsor, setFullSponsor] = useState<Sponsor | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch full sponsor details when modal opens
  useEffect(() => {
    const fetchFullDetails = async () => {
      // If we already have resources or emails, skip
      if (sponsor.resources && sponsor.resources.length > 0) {
        setFullSponsor(sponsor);
        return;
      }
      if (sponsor.emails && sponsor.emails.length > 0) {
        setFullSponsor(sponsor);
        return;
      }

      setIsLoading(true);
      try {
        const token = session?.access_token;
        if (!token || !sponsor.id) {
          setFullSponsor(sponsor);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsor.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Merge summary data with full data
          const fullData: Sponsor = {
            ...sponsor,
            resources: data.resources?.map((r: any) => ({
              label: r.label || "Resource",
              url: r.url || ""
            })) || [],
            emails: data.emails || data.email_list || [],
          };
          setFullSponsor(fullData);
        } else {
          setFullSponsor(sponsor);
        }
      } catch (error) {
        console.error("Error fetching full sponsor details:", error);
        setFullSponsor(sponsor);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchFullDetails();
    }
  }, [isOpen, sponsor, session]);

  const displaySponsor = fullSponsor || sponsor;

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    showToast("Email copied to clipboard!", "success");
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handlePreviewResource = (resource: { label: string; url: string }) => {
    setPreviewResource({
      name: resource.label,
      signed_url: resource.url,
      mime_type: undefined // We don't have MIME type info from the networking page
    });
  };

  const closePreview = () => {
    setPreviewResource(null);
  };

  const profileContent = isLoading ? (
    <div className="p-8 flex justify-center items-center">
      <LoadingSpinner text="Loading sponsor details..." size="lg" />
    </div>
  ) : (
    <div className="p-2 space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 border">
          {displaySponsor.photoUrl ? (
            <img
              src={displaySponsor.photoUrl}
              alt={`${displaySponsor.name}'s logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-red-700 text-white text-3xl font-bold">
              {displaySponsor.name?.substring(0, 1).toUpperCase() || ''}
            </div>
          )}
        </div>

        <div className="text-center sm:text-left flex-1">
          <h3 className="text-2xl font-bold">{displaySponsor.name || 'Name Not Provided'}</h3>
          <p className="text-md text-blue-600 font-medium mt-1">
            Sponsor
          </p>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold mb-2 flex items-center">
          <Info className="w-5 h-5 mr-2 text-gray-500" /> About
        </h4>
        <p className="text-gray-700 whitespace-pre-wrap">
          {displaySponsor.about || 'Not Provided'}
        </p>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold mb-2 flex items-center">
          <LinkIcon className="w-5 h-5 mr-2 text-gray-500" /> Links
        </h4>
        {displaySponsor.links && displaySponsor.links.length > 0 ? (
          <div className="flex flex-col">
            {displaySponsor.links.map((link, index) => (
              <a 
                key={index}
                href={link.startsWith('http') ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {link}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No links provided</p>
        )}
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold mb-2">Resources</h4>
        {displaySponsor.resources && displaySponsor.resources.length > 0 ? (
          <div className="space-y-2">
            {displaySponsor.resources.map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-700 truncate flex-1">
                  {resource.label}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePreviewResource(resource)}
                    className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
                    title="Preview resource"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No resources provided</p>
        )}
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-gray-500" /> Emails
        </h4>
        {displaySponsor.emails && displaySponsor.emails.length > 0 ? (
          <div className="flex flex-col space-y-1">
            {displaySponsor.emails.map((email, idx) => (
              <button
                key={idx}
                type="button"
                className="truncate text-bapred font-medium hover:underline focus:outline-none text-left flex items-center"
                title="Copy email to clipboard"
                onClick={() => handleCopyEmail(email)}
              >
                {email}
                {copiedEmail === email && (
                  <Check className="w-4 h-4 ml-2 text-green-500" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-gray-500 italic">No emails provided</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Sponsor Details"
        size="lg"
        showFooter={true}
        cancelText="Close"
        preventOutsideClick={false}
      >
        {profileContent}
      </Modal>

      {/* Resource Preview Modal */}
      <ResourcePreviewModal
        isOpen={!!previewResource}
        onClose={closePreview}
        resource={previewResource}
      />
    </>
  );
};

export default SponsorProfileModal; 