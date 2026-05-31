import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/authService';

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
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        if (!data.success || !data.user) {
          throw new Error('Profile request failed.');
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">ReguMind AI</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">Dashboard</h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <img
              src={user.picture || 'https://ui-avatars.com/api/?name=ReguMind+User&background=059669&color=fff'}
              alt={user.name || 'User'}
              className="h-20 w-20 rounded-full border border-slate-200 object-cover"
            />

            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-slate-950">{user.name || 'ReguMind User'}</h2>
              <p className="mt-1 truncate text-sm text-slate-600">{user.email || 'No email available'}</p>
              <p className="mt-3 inline-flex rounded-md bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                {user.role || 'compliance_officer'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
