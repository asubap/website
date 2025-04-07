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
    const handleEditProfile = () => {
        // Handle edit profile logic here
    }

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <div className="flex items-center gap-8">
                <img src={profileUrl} alt="Sponsor Logo" className="w-24 h-24 border-bapred" />
                <div className="self-stretch text-black my-auto max-md:mt-10">
                <h1 className="text-5xl font-bold max-md:text-[40px] max-md:mr-1">
                  {name}
                </h1>
                <div className="text-2xl font-normal mt-[5px]">
                  {major}
                  <br />
                  {email}
                  <br />
                  {phone}
                </div>
              </div>
                {/* <h1 className="text-4xl font-bold">{name}</h1> */}
            </div>
            <p><span className="font-bold">Hiring:</span> {name}</p>
            <p><span className="font-bold">About:<br/></span>{description}</p>
            <div className="w-full flex justify-end">    
                <button onClick={handleEditProfile} className="px-4 py-2 rounded bg-bapred text-white hover:bg-bapreddark transition-colors">Edit Profile</button>
            </div>
        </div>
    )
}

export default MemberDescription;