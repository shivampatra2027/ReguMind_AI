import WorkflowStepper from "../components/WorkflowStepper";
import { useNavigate } from "react-router-dom";

const AuditReport = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 p-8">

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"></div>
        <div className="absolute top-40 right-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-6xl">
         <WorkflowStepper currentStep={3} />

        

        <div className="mb-8">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            AI Audit Engine
          </span>

          <h1 className="mt-4 text-5xl font-bold text-slate-900">
            Audit Report
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            AI-generated audit findings, compliance observations and recommendations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-xl">
            <p className="text-sm uppercase tracking-wide">
              Audit Status
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              Pending
            </h2>
          </div>

          <div className="rounded-3xl bg-white/80 backdrop-blur-xl p-6 shadow-xl">
            <p className="text-sm text-slate-500">
              Findings
            </p>

            <h2 className="mt-4 text-5xl font-bold text-slate-900">
              --
            </h2>
          </div>

          <div className="rounded-3xl bg-white/80 backdrop-blur-xl p-6 shadow-xl">
            <p className="text-sm text-slate-500">
              Compliance Level
            </p>

            <h2 className="mt-4 text-3xl font-bold text-green-600">
              Awaiting Report
            </h2>
          </div>

        </div>

        <div className="mt-8 rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900">
            Audit Summary
          </h2>

          <p className="mt-5 leading-8 text-slate-600">
            Upload and analyze regulatory documents to generate a detailed
            audit report containing findings, observations, risk indicators,
            and compliance recommendations.
          </p>

          <div className="mt-6 rounded-2xl bg-blue-50 p-5">
            <p className="font-medium text-blue-700">
              No audit report generated yet.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
          >
            Back to Dashboard →
          </button>
        </div>

      </div>
    </main>
  );
};

export default AuditReport;