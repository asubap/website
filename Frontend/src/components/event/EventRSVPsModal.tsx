import Modal from "../ui/Modal";
import { User } from 'lucide-react';

interface EventRSVPsModalProps {
  rsvps: {name: string, email: string}[];
  event_name: string;
  isOpen: boolean;
  onClose: () => void;
}

const EventRSVPsModal: React.FC<EventRSVPsModalProps> = ({
  rsvps,
  event_name,
  isOpen,
  onClose,
}) => {
  const profileContent = (
    <div className="p-2 space-y-6">      
      <div className="">
        <h4 className="text-lg font-semibold mb-2 flex items-center">
          <User className="w-5 h-5 mr-2 text-gray-500" /> RSVPs
        </h4>
        {rsvps.map((rsvp, index) => (
          <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-200 lg:last:border-b-0">
            <p className="text-md text-gray-700 min-w-[250px]">{rsvp.name}</p>
            <p className="text-md text-gray-700 min-w-[250px]">{rsvp.email}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`RSVPs for ${event_name}`}
      size="lg"
      showFooter={true}
      cancelText="Close"
      preventOutsideClick={false}
    >
      {profileContent}
    </Modal>
  );
};

export default EventRSVPsModal; 