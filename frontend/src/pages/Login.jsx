import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { HiOutlineShieldCheck } from "react-icons/hi";

const Login = () => (
  <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-10">

    <div className="fixed inset-0 overflow-hidden -z-10">

  {/* Aurora Layer */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.3),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(6,182,212,0.3),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.3),transparent_30%)] animate-aurora"></div>

  {/* Moving Blobs */}
  <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-fuchsia-500/30 blur-[150px] animate-blob"></div>

  <div className="absolute top-20 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/30 blur-[150px] animate-blob animation-delay-2000"></div>

  <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-purple-500/30 blur-[150px] animate-blob animation-delay-4000"></div>

</div>
    <section
      className="
        w-full
        max-w-lg
        rounded-[32px]
        border border-white/10
        bg-white/[0.05]
        backdrop-blur-2xl
        p-10
        shadow-[0_0_60px_rgba(59,130,246,0.15)]
      "
    >
      <div className="text-center">

        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-500 shadow-[0_0_60px_rgba(6,182,212,0.6)]">
          <HiOutlineShieldCheck className="text-6xl text-white drop-shadow-lg" />
        </div>

        <h1 className="text-4xl font-bold text-white">
          ReguMind AI
        </h1>

        <p className="mt-4 text-lg font-medium text-cyan-300">
          Transform Regulations Into Intelligence
        </p>

        <p className="mt-3 text-slate-300">
          AI-Powered Regulatory Compliance Platform
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">

          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/15 px-3 py-1 text-xs text-cyan-300">
            AI Analysis
          </span>

          <span className="rounded-full border border-orange-500/20 bg-orange-500/15 px-3 py-1 text-xs text-orange-300">
            Risk Scoring
          </span>

          <span className="rounded-full border border-purple-500/20 bg-purple-500/15 px-3 py-1 text-xs text-purple-300">
            Audit Reports
          </span>

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
            Compliance
          </span>

        </div>

        <p className="mt-6 text-sm leading-7 text-slate-400">
          Upload regulatory documents, extract compliance obligations,
          generate risk assessments and produce audit-ready reports
          using AI.
        </p>

      </div>

      <div className="mt-10 flex flex-col gap-4">

        <p className="text-center text-sm text-slate-400">
          Continue with your organization account
        </p>

        <GoogleAuthButton />

      </div>

      <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
        RBI • SEBI • Compliance • Audit Intelligence
      </div>

    </section>

  </main>
);

export default Login;