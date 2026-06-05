import WorkflowStepper from "../components/WorkflowStepper";
import { useNavigate } from "react-router-dom";

const RiskScoring = () => {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 p-8">

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"></div>
        <div className="absolute top-40 right-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-6xl">
         <WorkflowStepper currentStep={2} />

        <div className="mb-8">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            AI Risk Engine
          </span>

          <h1 className="mt-4 text-5xl font-bold text-slate-900">
            Risk Scoring Dashboard
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            AI-powered regulatory risk assessment and compliance monitoring.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-3xl bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white shadow-xl">
            <p className="text-sm uppercase tracking-wide">
              High Risk
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              --
            </h2>

            <p className="mt-2 text-red-100">
              No analysis available
            </p>
          </div>

          <div className="rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white shadow-xl">
            <p className="text-sm uppercase tracking-wide">
              Medium Risk
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              --
            </h2>

            <p className="mt-2 text-yellow-100">
              No analysis available
            </p>
          </div>

          <div className="rounded-3xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white shadow-xl">
            <p className="text-sm uppercase tracking-wide">
              Low Risk
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              --
            </h2>

            <p className="mt-2 text-green-100">
              No analysis available
            </p>
          </div>

        </div>

        <div className="mt-8 rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900">
            Overall Risk Score
          </h2>

          <div className="mt-8 flex justify-center">
            <div className="flex h-48 w-48 items-center justify-center rounded-full border-[16px] border-cyan-500 text-5xl font-bold text-cyan-600">
              --
            </div>
          </div>

          <p className="mt-6 text-center text-slate-600">
            Upload and analyze documents to generate AI-based risk scoring.
          </p>
        </div>
<div className="mt-8 flex justify-end">
  <button
    onClick={() => navigate("/audit")}
    className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
  >
    Generate Audit Report →
  </button>
</div>
      </div>
    </main>
  );
};

export default RiskScoring;