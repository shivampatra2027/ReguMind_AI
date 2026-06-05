const WorkflowStepper = ({ currentStep }) => {
  const steps = ["Upload", "Analysis", "Risk", "Audit"];

  return (
    <div className="mb-8 flex items-center justify-center gap-4">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
              index <= currentStep
                ? "bg-cyan-500 text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {index + 1}
          </div>

          <span
            className={`ml-2 font-medium ${
              index <= currentStep
                ? "text-cyan-600"
                : "text-slate-500"
            }`}
          >
            {step}
          </span>

          {index !== steps.length - 1 && (
            <div className="mx-4 h-1 w-12 bg-slate-300"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WorkflowStepper;