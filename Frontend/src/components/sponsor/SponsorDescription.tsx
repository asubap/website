interface SponsorDescriptionProps {
    profileUrl: string;
    name: string;
    objective: string[];
    description: string;
}

const SponsorDescription: React.FC<SponsorDescriptionProps> = ({ profileUrl, name, objective, description }) => {
    const handleEditProfile = () => {
        // Handle edit profile logic here
    }

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <div className="flex items-center gap-8">
                <img src={profileUrl} alt="Sponsor Logo" className="w-24 h-24 border-bapred" />
                <h1 className="text-4xl font-bold">{name}</h1>
            </div>
            <p><span className="font-bold">{objective[0]}:</span> {objective[1]}</p>
            <p><span className="font-bold">About:<br/></span>{description}</p>
            <div className="w-full flex justify-end">    
                <button onClick={handleEditProfile} className="px-4 py-2 rounded bg-bapred text-white hover:bg-bapreddark transition-colors">Edit Profile</button>
            </div>
        </div>
    )
}

export default SponsorDescription;