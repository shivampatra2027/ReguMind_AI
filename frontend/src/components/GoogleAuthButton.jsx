import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLogin } from '../services/authService';

const GoogleAuthButton = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google login failed. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const data = await googleLogin(credentialResponse.credential);

      if (!data.success || !data.token || !data.user) {
        throw new Error('Invalid authentication response.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (apiError) {
      setError(apiError.response?.data?.message || apiError.message || 'Unable to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className={isLoading ? 'pointer-events-none opacity-60' : ''}>
        <GoogleLogin onSuccess={handleSuccess} onError={() => setError('Google login failed. Please try again.')} />
      </div>

      {error ? (
        <p className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default GoogleAuthButton;
