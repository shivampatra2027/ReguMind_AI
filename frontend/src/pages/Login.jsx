import GoogleAuthButton from '../components/GoogleAuthButton.jsx';

const Login = () => (
  <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4 py-10">
    <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-emerald-600 text-xl font-bold text-white">
          R
        </div>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">ReguMind AI</h1>
        <p className="mt-2 text-sm text-slate-600">AI-Powered Regulatory Compliance Platform</p>
      </div>

      <GoogleAuthButton />
    </section>
  </main>
);

export default Login;
