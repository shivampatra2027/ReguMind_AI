import { useNavigate } from 'react-router-dom';

const GoogleAuthButton = () => {
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    // Demo user for offline hackathon mode
    const demoUser = {
      name: 'Demo User',
      email: 'demo@regumind.ai',
      role: 'Compliance Officer',
    };

    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('user', JSON.stringify(demoUser));

    navigate('/dashboard');
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        onClick={handleDemoLogin}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
      >
        Continue to Dashboard
      </button>

      <p className="text-sm text-slate-500">
        Demo mode (Offline Hackathon)
      </p>
    </div>
  );
};

export default GoogleAuthButton;