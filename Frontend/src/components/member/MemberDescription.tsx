import { useState } from "react";
import EventMember from "./EventMember";
import ProfileEditModal from "./ProfileEditModal";
interface MemberDescriptionProps {
    profileUrl: string;
    name: string;
    major: string;
    email: string;
    phone: string;
    status: string;
    hours: string;
    year: string;
    internship: string;
    
  
    description: string;
}

const MemberDescription: React.FC<MemberDescriptionProps> = ({ profileUrl, name, major, description, email, phone, status, hours, year, internship }) => {
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Initial profile data state
  const [profileData, setProfileData] = useState({
    name: name,
    email: email,
    phone: phone,
    major: major,
    graduationDate: year,
    status: status,
    about: description,
    internship: internship,
    photoUrl: profileUrl,
    hours: hours,
  })
  interface ProfileData {
    name: string;
    email: string;
    phone: string;
    major: string;
    graduationDate: string;
    status: string;
    about: string;
    internship: string;
    photoUrl: string;
    hours: string;
  }

  

  const handleSaveProfile = (newData: ProfileData): void => {

    setProfileData(newData);
  }
    return (
    
      <main className="flex flex-col lg:flex-row flex-1 p-4 sm:p-6 gap-8 lg:gap-12 mt-[150px]">
      {/* Left Column - Profile */}
      <div className="w-full lg:w-1/2">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Welcome back, [Name]!</h2>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 bg-[#d9d9d9] rounded-full flex-shrink-0 mx-auto sm:mx-0 overflow-hidden">
            {profileUrl ? (
              <img
                src={profileData.photoUrl}
                alt="Profile"
                width={144}
                height={144}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">{profileData.name}</h3>
            <p className="text-[#202020]">{profileData.major}</p>
            <p className="text-[#555555]">{profileData.email}</p>
            <p className="text-[#555555]">{profileData.phone}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6">
          <div>
            <span className="font-bold">Graduating:</span> {profileData.graduationDate}
          </div>
          <div>
            <span className="font-bold">Status:</span> {profileData.status}
          </div>
          <div>
            <span className="font-bold">Hours:</span> {profileData.hours}
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-bold mb-2">About</h4>
          <p className="text-[#202020]">{profileData.about}</p>
        </div>

        <div className="flex justify-center sm:justify-end mb-8 lg:mb-0">
          <button
            className="bg-[#af272f] text-white px-6 py-3 rounded-md hover:bg-[#8f1f26] transition-colors"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Right Column - Events */}
      <EventMember/>
      {/* Edit Profile Modal */}
      <ProfileEditModal
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      profileData={profileData}
      onSave={handleSaveProfile}
    />
    </main>
    
        
       
    )
}

export default MemberDescription;