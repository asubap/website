import { useState } from "react";
import { Member, Sponsor } from "../../types";
import NetworkProfileModal from "./NetworkProfileModal";
import SponsorProfileModal from "./SponsorProfileModal";
import { Briefcase, GraduationCap, Link as LinkIcon, Mail, Timer, Clock, Info, User } from 'lucide-react';

interface NetworkListProps {
  entities: (Member | Sponsor)[];
}

// Format role names to be more readable
const formatRoleName = (role: string | null | undefined): string => {
  if (!role) return 'Not Provided';
  if (role === 'general-member') return 'General Member';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const NetworkList: React.FC<NetworkListProps> = ({ entities }) => {
  const [selectedNetworkEntity, setSelectedNetworkEntity] = useState<Member | Sponsor | null>(null);

  const openNetworkProfile = (entity: Member | Sponsor) => {
    setSelectedNetworkEntity(entity);
  };

  const closeNetworkProfile = () => {
    setSelectedNetworkEntity(null);
  };

  const handleSponsorClick = (sponsor: Sponsor) => {
    setSelectedNetworkEntity(sponsor);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.map((entity) => (
          <div
            key={entity.id || entity.name}
            className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => entity.type === 'member' ? openNetworkProfile(entity) : handleSponsorClick(entity)}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 border">
                  {entity.photoUrl ? (
                    <img
                      src={entity.photoUrl}
                      alt={`${entity.name}'s profile/logo`}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-red-700 text-white text-xl font-bold">
                      {entity.name.substring(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{entity.name}</h3>
                  {entity.type === 'member' && (
                    <p className="text-sm text-gray-600">{entity.major || 'Not Provided'}</p>
                  )}
                  {entity.type === 'sponsor' && (
                    <p className="text-sm text-blue-600 font-medium">Sponsor</p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {entity.type === 'member' && (
                  <>
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">{entity.email || 'Not Provided'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">Total Hours: {entity.hours ?? '0'}</span>
                    </div>
                    {entity.links && entity.links.length > 0 ? (
                      <div className="flex items-center text-sm">
                        <LinkIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <a 
                          href={entity.links[0].startsWith('http') ? entity.links[0] : `https://${entity.links[0]}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {entity.links[0]}
                        </a>
                      </div>
                    ) : null}
                    <div className="flex items-center text-sm">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">Major: {entity.major || 'Not Provided'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Info className="w-4 h-4 mr-2 text-gray-500" />
                      <p className="text-sm text-gray-700 italic line-clamp-2" title={entity.about || ''}>
                        {entity.about || 'No description provided.'}
                      </p>
                    </div>
                    <div className="flex items-center text-sm">
                      <GraduationCap className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">
                        Graduating: {entity.graduationDate || 'Not Provided'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">Role: {formatRoleName(entity.role)}</span>
                    </div>
                  </>
                )}
                
                {entity.type === 'sponsor' && (
                  <>
                    <div className="flex items-center text-sm">
                      <Info className="w-4 h-4 mr-2 text-gray-500" />
                      <p className="text-sm text-gray-700 italic line-clamp-2" title={entity.about || ''}>
                        {entity.about || 'No description provided.'}
                      </p>
                    </div>
                    {entity.links && entity.links.length > 0 ? (
                      <div className="flex items-center text-sm">
                        <LinkIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <a 
                          href={entity.links[0].startsWith('http') ? entity.links[0] : `https://${entity.links[0]}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {entity.links[0]}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm">
                        <LinkIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-500 italic">No links provided</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-4">
                <button
                  className="w-full bg-red-700 text-white py-2 rounded hover:bg-red-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (entity.type === 'member') {
                        openNetworkProfile(entity);
                    } else {
                        handleSponsorClick(entity);
                    }
                  }}
                >
                  {entity.type === 'member' ? 'View Profile' : 'View Sponsor'} 
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedNetworkEntity && selectedNetworkEntity.type === 'member' && (
        <NetworkProfileModal
          isOpen={true}
          onClose={closeNetworkProfile}
          member={selectedNetworkEntity as Member}
        />
      )}
      
      {selectedNetworkEntity && selectedNetworkEntity.type === 'sponsor' && (
        <SponsorProfileModal
          isOpen={true}
          onClose={closeNetworkProfile}
          sponsor={selectedNetworkEntity as Sponsor}
        />
      )}
    </div>
  );
};

export default NetworkList;
