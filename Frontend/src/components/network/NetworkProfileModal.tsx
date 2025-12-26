import React, { useState, useEffect } from "react";
import { MemberDetail } from "../../types";
import Modal from "../ui/Modal";
import {
  Briefcase,
  Clock,
  GraduationCap,
  Info,
  Link as LinkIcon,
  Mail,
  Award,
  Target,
} from "lucide-react";
import { useToast } from "../../context/toast/ToastContext";
import { useAuth } from "../../context/auth/authProvider";
import LoadingSpinner from "../common/LoadingSpinner";

interface NetworkProfileModalProps {
  member: MemberDetail;
  isOpen: boolean;
  onClose: () => void;
}

const NetworkProfileModal: React.FC<NetworkProfileModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const { session } = useAuth();
  const [fullMember, setFullMember] = useState<MemberDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch full member details when modal opens
  useEffect(() => {
    const fetchFullDetails = async () => {
      // If we already have detailed hours data, skip
      if (member.developmentHours && member.developmentHours !== "0") {
        setFullMember(member);
        return;
      }

      setIsLoading(true);
      try {
        const token = session?.access_token;
        if (!token) {
          setFullMember(member);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/member-info/${encodeURIComponent(member.email)}`,
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
          const fullData: MemberDetail = {
            ...member,
            phone: data.phone || "Not Provided",
            internship: data.internship || "Not Specified",
            developmentHours: data.development_hours?.toString() ?? "0",
            professionalHours: data.professional_hours?.toString() ?? "0",
            serviceHours: data.service_hours?.toString() ?? "0",
            socialHours: data.social_hours?.toString() ?? "0",
            links: Array.isArray(data.links) ? data.links : (member.links || []),
            event_attendance: data.event_attendance || [],
          };
          setFullMember(fullData);
        } else {
          setFullMember(member);
        }
      } catch (error) {
        console.error("Error fetching full member details:", error);
        setFullMember(member);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchFullDetails();
    }
  }, [isOpen, member, session]);

  const displayMember = fullMember || member;

  const profileContent = isLoading ? (
    <div className="p-8 flex justify-center items-center">
      <LoadingSpinner text="Loading member details..." size="lg" />
    </div>
  ) : (
    <div className="p-2 space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 border">
          {displayMember.photoUrl ? (
            <img
              src={displayMember.photoUrl}
              alt={`${displayMember.name}'s profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-red-700 text-white text-3xl font-bold">
              {displayMember.name?.substring(0, 1).toUpperCase() || ""}
            </div>
          )}
        </div>

        <div className="text-center sm:text-left flex-1">
          <h3 className="text-2xl font-bold">
            {displayMember.name || "Name Not Provided"}
          </h3>
          {displayMember.major && displayMember.major !== "Not Provided" && (
            <p className="text-lg text-gray-600 flex items-center justify-center sm:justify-start">
              <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
              {displayMember.major}
            </p>
          )}
          {/* <p className="text-md text-gray-500 flex items-center justify-center sm:justify-start mt-1">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            {formatRoleName(displayMember.role)}
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
