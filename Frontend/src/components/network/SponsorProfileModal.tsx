import { Sponsor } from "../../types";
import Modal from "../ui/Modal";
import { Info, Link as LinkIcon, Mail, Check, Eye } from 'lucide-react';
import { useToast } from "../../context/toast/ToastContext";
import { useState } from "react";
import ResourcePreviewModal from "../ui/ResourcePreviewModal";

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

  const profileContent = (
    <div className="p-2 space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 border">
          {sponsor.photoUrl ? (
            <img
              src={sponsor.photoUrl}
              alt={`${sponsor.name}'s logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-red-700 text-white text-3xl font-bold">
              {sponsor.name?.substring(0, 1).toUpperCase() || ''}
            </div>
          )}
        </div>

        <div className="text-center sm:text-left flex-1">
          <h3 className="text-2xl font-bold">{sponsor.name || 'Name Not Provided'}</h3>
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
          {sponsor.about || 'Not Provided'}
        </p>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold mb-2 flex items-center">
          <LinkIcon className="w-5 h-5 mr-2 text-gray-500" /> Links
        </h4>
        {sponsor.links && sponsor.links.length > 0 ? (
          <div className="flex flex-col">
            {sponsor.links.map((link, index) => (
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
        {sponsor.resources && sponsor.resources.length > 0 ? (
          <div className="space-y-2">
            {sponsor.resources.map((resource, index) => (
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
        {sponsor.emails && sponsor.emails.length > 0 ? (
          <div className="flex flex-col space-y-1">
            {sponsor.emails.map((email, idx) => (
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