import GoogleAuthButton from '../components/GoogleAuthButton.jsx';
import { HiOutlineShieldCheck } from "react-icons/hi";

const Login = () => (
  <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-10">
    <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-10 backdrop-blur-xl shadow-2xl">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-500 shadow-2xl">
  <HiOutlineShieldCheck className="text-6xl text-white drop-shadow-lg" />
</div>

        <h1 className="text-4xl font-bold text-white">
          ReguMind AI
        </h1>

        <p className="mt-3 text-slate-300">
          AI-Powered Regulatory Compliance Platform
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">
            AI Analysis
          </span>

          <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">
            Risk Scoring
          </span>

          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300">
            Audit Reports
          </span>

          <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-300">
            Compliance
          </span>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <GoogleAuthButton />

        
      </div>

      <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
        RBI • SEBI • Compliance • Audit Intelligence
      </div>
    </section>
  </main>
);

export default Login;