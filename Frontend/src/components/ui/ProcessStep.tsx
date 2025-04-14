interface ProcessStepProps {
  title: string;
  requirements: string[];
}

export const ProcessStep = ({ title, requirements }: ProcessStepProps) => {
  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg p-6 h-full">
      <h2 className="text-[#AF272F] text-3xl md:text-4xl font-bold text-center mb-6 pb-3 border-b border-gray-100">
        {title}
      </h2>
      <div className="text-gray-700 text-base md:text-lg space-y-4">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-start">
            <span className="text-[#AF272F] font-bold mr-2">•</span>
            <p>{requirement}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
