import React from "react";
import { MemberDetail } from "../../types";
import Modal from "../ui/Modal";
import {
  Briefcase,
  Clock,
  GraduationCap,
  Info,
  Link as LinkIcon,
  Mail,
  User,
  Award,
  Target,
} from "lucide-react";
import { useToast } from "../../context/toast/ToastContext";

interface NetworkProfileModalProps {
  member: MemberDetail;
  isOpen: boolean;
  onClose: () => void;
}

const formatRoleName = (role: string | null | undefined): string => {
  if (!role) return "Not Provided";
  if (role === "general-member") return "General Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const NetworkProfileModal: React.FC<NetworkProfileModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();

  // No need for modal container logic - it's handled by the Modal component

  const profileContent = (
    <div className="p-2 space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 border">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={`${member.name}'s profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-red-700 text-white text-3xl font-bold">
              {member.name?.substring(0, 1).toUpperCase() || ""}
            </div>
          )}
        </div>

        <div className="text-center sm:text-left flex-1">
          <h3 className="text-2xl font-bold">
            {member.name || "Name Not Provided"}
          </h3>
          {member.major && member.major !== "Not Provided" && (
            <p className="text-lg text-gray-600 flex items-center justify-center sm:justify-start">
              <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
              {member.major}
            </p>
          )}
          {/* <p className="text-md text-gray-500 flex items-center justify-center sm:justify-start mt-1">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            {formatRoleName(member.role)}
          </p> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border-t pt-6">
        <div className="flex items-center">
          <Mail className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
          {member.email ? (
            <button
              type="button"
              className="truncate text-bapred font-medium hover:underline focus:outline-none"
              title="Copy email to clipboard"
              onClick={() => {
                navigator.clipboard.writeText(member.email);
                showToast("Email copied to clipboard!", "success");
              }}
            >
              {member.email}
            </button>
          ) : (
            <span className="truncate text-gray-500">Not Provided</span>
          )}
        </div>

        <div className="flex items-center">
          <GraduationCap className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
          <span>Graduating Year: {member.graduationDate || "Not Provided"}</span>
        </div>

        <div className="flex items-center">
          <Award className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
          <span>Rank: {member.rank || "Not Provided"}</span>
        </div>

        <div className="flex items-center">
          <Target className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
          <span>Status: {member.status || "Not Specified"}</span>
        </div>

        {/* Hours */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-y-2 gap-x-5">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
            <span className="font-bold text-gray-800 whitespace-nowrap">
              Total Hours: {member.hours ?? "0"} hrs
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-y-1 md:gap-y-0 gap-x-5 whitespace-nowrap">
            <span className="text-gray-600">
              Development:{" "}
              <span className="font-medium text-gray-800">
                {member.developmentHours ?? "0"} hrs
              </span>
            </span>
            <span className="text-gray-600">
              Professional:{" "}
              <span className="font-medium text-gray-800">
                {member.professionalHours ?? "0"} hrs
              </span>
            </span>
            <span className="text-gray-600">
              Service:{" "}
              <span className="font-medium text-gray-800">
                {member.serviceHours ?? "0"} hrs
              </span>
            </span>
            <span className="text-gray-600">
              Social:{" "}
              <span className="font-medium text-gray-800">
                {member.socialHours ?? "0"} hrs
              </span>
            </span>
          </div>
        </div>

        {member.links && member.links.length > 0 && (
          <div className="flex items-start">
            <LinkIcon className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              {member.links.map((link: string, index: number) => (
                <a
                  key={index}
                  href={link.startsWith("http") ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {member.about && member.about !== "Not Provided" && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold mb-2 flex items-center">
            <Info className="w-5 h-5 mr-2 text-gray-500" /> About
          </h4>
          <p className="text-gray-700 whitespace-pre-wrap">{member.about}</p>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile Details"
      size="lg"
      showFooter={true}
      cancelText="Close"
      preventOutsideClick={false}
    >
      {profileContent}
    </Modal>
  );
};

export default NetworkProfileModal;
