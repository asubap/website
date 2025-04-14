import React from "react";
import LoadingSpinner from "../common/LoadingSpinner";

interface SponsorDescriptionProps {
  profileUrl: string;
  name: string;
  description: string;
  links?: string[];
  onEditClick?: () => void;
  isProfileUpdating: boolean;
}

const SponsorDescription: React.FC<SponsorDescriptionProps> = ({
  profileUrl,
  name,
  description,
  links = [],
  onEditClick,
  isProfileUpdating,
}) => {
  return (
    <div className="flex flex-col w-full h-full gap-8">
      <div className="flex items-center gap-8">
        <div className="relative w-32 h-32 flex items-center justify-center border rounded-md shadow-sm overflow-hidden">
          {isProfileUpdating ? (
            <LoadingSpinner text="" size="md" />
          ) : (
            <img
              src={profileUrl || "/placeholder-logo.png"}
              alt={`${name} Logo`}
              className="max-w-full max-h-full object-contain p-2"
            />
          )}
        </div>
        <h1 className="text-4xl font-bold">{name}</h1>
      </div>
      <p>
        <span className="font-bold">
          About:
          <br />
        </span>
        {description}
      </p>

      {links.length > 0 && (
        <div>
          <h3 className="font-bold mb-2">Links:</h3>
          <ul className="flex flex-col gap-2">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="w-full flex justify-end">
        <button
          onClick={onEditClick}
          className="px-4 py-2 rounded bg-bapred text-white hover:bg-bapreddark transition-colors"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default SponsorDescription;
