import React from 'react';

interface PublicEventCardProps {
  title: string;
  description: string | null;
}

export const PublicEventCard: React.FC<PublicEventCardProps> = ({ title, description }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold mb-2 text-[#8C1D40]">{title}</h3>
      <p className="text-gray-600 text-sm">
        {description || 'No description available'}
      </p>
    </div>
  );
}; 