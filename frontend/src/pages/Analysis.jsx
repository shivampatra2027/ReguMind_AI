import WorkflowStepper from "../components/WorkflowStepper";
import { useNavigate } from "react-router-dom";
const Analysis = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 p-8">
      <div className="fixed inset-0 -z-10 overflow-hidden">
  <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"></div>
  <div className="absolute top-40 right-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"></div>
  <div className="absolute bottom-20 left-1/2 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl"></div>
</div>
      <div className="mx-auto max-w-6xl">
         <WorkflowStepper currentStep={1} />

        <h1 className="text-4xl font-bold text-slate-900">
          AI Compliance Analysis
        </h1>

        <p className="mt-2 text-slate-600">
          AI-generated compliance insights from uploaded documents.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">

  <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-xl">
    <p className="text-sm uppercase tracking-wider">
      Compliance Score
    </p>

    <h2 className="mt-4 text-5xl font-bold">
      --
    </h2>

    <p className="mt-2 text-blue-100">
      Waiting for analysis
    </p>
  </div>

  <div className="rounded-3xl bg-white/80 backdrop-blur-xl p-6 shadow-xl">
    <p className="text-sm text-slate-500">
      Clauses Reviewed
    </p>

    <h2 className="mt-4 text-5xl font-bold text-slate-900">
      --
    </h2>

    <p className="mt-2 text-slate-500">
      No document analyzed
    </p>
  </div>

  <div className="rounded-3xl bg-white/80 backdrop-blur-xl p-6 shadow-xl">
    <p className="text-sm text-slate-500">
      Analysis Status
    </p>

    <h2 className="mt-4 text-xl font-bold text-cyan-600">
      Pending
    </h2>

    <div className="mt-4 h-2 rounded-full bg-slate-200">
      <div className="h-2 w-1/4 rounded-full bg-cyan-500"></div>
    </div>
  </div>

</div>

        <div className="mt-8 rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-xl">
  <h2 className="text-2xl font-bold text-slate-900">
    AI Compliance Summary
  </h2>

  <p className="mt-5 leading-8 text-slate-600">
    Upload a regulatory PDF to generate AI-powered compliance analysis,
    clause extraction, policy validation and regulatory insights.
  </p>

  <div className="mt-6 rounded-2xl bg-blue-50 p-5">
    <p className="font-medium text-blue-700">
      No document has been analyzed yet.
    </p>
  </div>
</div>

<div className="mt-8 flex justify-end">
  <button
    onClick={() => navigate("/risk")}
    className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
  >
    View Risk Assessment →
  </button>
</div>

</div>
     
      
    </main>
  );
};

export default Analysis;