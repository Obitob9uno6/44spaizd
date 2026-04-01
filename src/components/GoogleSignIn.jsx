import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignIn({ onSuccess, buttonText = 'Continue with Google' }) {
  const { loginWithToken } = useAuth();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const loadGoogleScript = () => {
      if (window.google?.accounts) {
        initGoogle();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    };

    const initGoogle = () => {
      if (!window.google?.accounts || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        use_fedcm_for_prompt: false,
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'square',
        width: containerRef.current.offsetWidth || 320,
      });
    };

    loadGoogleScript();
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (!res.ok) throw new Error('Authentication failed');
      const data = await res.json();
      loginWithToken(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      onSuccess?.(data.user);
    } catch (err) {
      toast.error('Sign in failed. Please try again.');
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="w-full border border-dashed border-border py-3 text-center text-[10px] text-muted-foreground tracking-wider">
        GOOGLE SIGN-IN NOT CONFIGURED
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
