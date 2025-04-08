import { useState } from "react";
import { Member } from "../../types";
import MemberProfileModal from "./MemberProfileModal";

interface MemberListProps {
  members: Member[];
}

const MemberList: React.FC<MemberListProps> = ({ members }) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const openMemberProfile = (member: Member) => {
    setSelectedMember(member);
  };

  const closeMemberProfile = () => {
    setSelectedMember(null);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => openMemberProfile(member)}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={`${member.name}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-red-700 text-white text-xl font-bold">
                      {member.name.substring(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.major}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 mr-2 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                  <span className="text-gray-700">{member.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 mr-2 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.63 48.63 0 0 1 12 20.904a48.63 48.63 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Graduating: {member.graduationDate}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 mr-2 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <span className="text-gray-700">Status: {member.status}</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="w-full bg-red-700 text-white py-2 rounded hover:bg-red-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    openMemberProfile(member);
                  }}
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          isOpen={!!selectedMember}
          onClose={closeMemberProfile}
        />
      )}
    </div>
  );
};

export default MemberList;
