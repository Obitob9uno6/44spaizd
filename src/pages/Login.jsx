import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';
import GoogleSignIn from '@/components/GoogleSignIn';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-4 border border-border p-8 bg-background"
      >
        <div className="text-center mb-8">
          <p className="text-[9px] tracking-[0.4em] text-muted-foreground mb-4">SPAIZD</p>
          <h1 className="text-2xl font-bold tracking-tight">SIGN IN</h1>
          <p className="text-[11px] text-muted-foreground tracking-wider mt-2">
            ACCESS YOUR ACCOUNT
          </p>
        </div>

        <div className="space-y-4">
          <GoogleSignIn />
        </div>

        <p className="text-[9px] text-muted-foreground text-center mt-8 leading-relaxed">
          By signing in you agree to our{' '}
          <a href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
