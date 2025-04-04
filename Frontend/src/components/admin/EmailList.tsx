const EmailList = ({ emails }: { emails: string[] }) => {
    return (
        <div className="w-full h-full flex flex-col py-2 gap-2 overflow-y-auto">
            {emails.map((email) => (
                <div key={email} className="w-full border border-bapgray rounded-md px-4 py-2">
                    {email}
                </div>
            ))}
        </div>
    );
};

export default EmailList;
