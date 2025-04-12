const EmailList = ({ emails, onDelete }: { emails: string[], onDelete: (email: string) => void }) => {
    return (
        <div className="w-full h-full flex flex-col py-2 gap-2 overflow-y-auto">
            {emails.map((email) => (
                <div key={email} className="w-full border border-bapgray rounded-md px-4 py-2 flex justify-between items-center">
                    <span>{email}</span>
                    <button 
                        onClick={() => onDelete(email)} 
                        className="text-bapred hover:text-bapreddark font-bold"
                        aria-label={`Delete ${email}`}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default EmailList;
