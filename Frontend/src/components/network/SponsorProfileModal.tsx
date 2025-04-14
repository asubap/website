import { Sponsor } from "../../types";
import Modal from "../ui/Modal";
import { Info, Link as LinkIcon } from 'lucide-react';

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
          <ul className="list-disc list-inside">
            {sponsor.resources.map((resource, index) => (
              <li key={index} className="text-gray-700">{resource}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No resources provided</p>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sponsor Details"
      size="lg"
      showFooter={true}
      cancelText="Close"
      preventOutsideClick={false}
      hasUnsavedChanges={false}
    >
      {profileContent}
    </Modal>
  );
};

export default SponsorProfileModal; 