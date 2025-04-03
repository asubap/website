interface ProcessStepProps {
  title: string;
  requirements: string[];
}

export const ProcessStep = ({ title, requirements }: ProcessStepProps) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-[#AF272F] text-[54px] font-bold text-center mb-5">
        {title}
      </h2>
      <div className="text-black text-[28px] max-w-[468px] text-center">
        {requirements.map((requirement, index) => (
          <div key={index} className="mb-5 last:mb-0">
            {requirement}
          </div>
        ))}
      </div>
    </div>
  );
};
