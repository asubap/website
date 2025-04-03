interface SponsorOptionProps {
    header: string;
    description: string;
    buttonText: string;
    onClick: () => void;
}

const SponsorOption: React.FC<SponsorOptionProps> = ({ header, description, buttonText, onClick }) => {
    return (
        <div className="flex flex-col w-full h-full gap-8">
            <h1 className="text-4xl font-bold">{header}</h1>
            <p>{description}</p>
            <div className="w-full flex justify-end">    
                <button onClick={onClick} className="px-4 py-2 rounded bg-bapred text-white hover:bg-bapreddark transition-colors">{buttonText}</button>
            </div>
        </div>
    )
}

export default SponsorOption;