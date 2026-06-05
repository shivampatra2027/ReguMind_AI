import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    return {};
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-400 px-4 py-8">
      <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-blue-400/30 blur-3xl"></div>

      <div className="absolute top-40 right-20 h-72 w-72 rounded-full bg-cyan-400/30 blur-3xl"></div>

      <div className="absolute bottom-20 left-1/2 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl"></div>
    </div>
      
      <section className="mx-auto max-w-6xl">

        {/* Hero Section */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold">ReguMind AI</h1>
              <p className="mt-2 text-lg text-blue-50">
                AI-Powered Regulatory Compliance Platform
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-white/20 px-5 py-3 font-medium backdrop-blur-md transition hover:bg-white/30"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-xl p-8 shadow-xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <img
              src={
                user.picture ||
                'https://ui-avatars.com/api/?name=ReguMind+User&background=059669&color=fff'
              }
              alt="User"
              className="h-24 w-24 rounded-full border-4 border-blue-100 object-cover"
            />

            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {user.name || 'ReguMind User'}
              </h2>

              <p className="mt-1 text-slate-600">
                {user.email || 'user@regumind.ai'}
              </p>

              <span className="mt-3 inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                {user.role || 'Compliance Officer'}
              </span>
            </div>
          </div>
        </div>

        {/* Workflow Card */}
        {/* Main Actions */}
<div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">

  {/* Upload PDF */}
  <button
    onClick={() => navigate('/upload')}
    className="rounded-3xl bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 p-10 text-left text-white shadow-xl transition-all duration-300 hover:scale-[1.02]"
  >
    <h2 className="text-3xl font-bold">
      Upload PDF
    </h2>

    <p className="mt-3 text-lg text-blue-50">
      Upload a regulatory document and start AI-powered compliance analysis.
    </p>

    <div className="mt-6">
      <span className="rounded-full bg-white/20 px-4 py-2 text-sm">
        Start Workflow →
      </span>
    </div>
  </button>

  {/* View History */}
  <button
    onClick={() => navigate('/documents')}
    className="rounded-3xl bg-white/80 backdrop-blur-xl p-10 text-left shadow-xl border border-slate-200 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500"
  >
    <h2 className="text-3xl font-bold text-slate-900">
      View History
    </h2>

    <p className="mt-3 text-lg text-slate-600">
      Access previously uploaded documents, analysis results, risk reports and audit reports.
    </p>

    <div className="mt-6">
      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
        Open History →
      </span>
    </div>
  </button>

</div>

      </section>
    </main>
    
  );
};

export default Dashboard;