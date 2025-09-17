import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  full_name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters')
});

const AuthSection = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState<{ full_name?: string; email: string; password: string }>({ email: '', password: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !mounted) return;
    setLoading(true);
    
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      if (mode === 'register') {
        registerSchema.parse(formData);
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.full_name } }
        });
        if (error) throw error;
        toast.success('Registration successful! Check your email to confirm.');
        setMode('login');
      } else {
        loginSchema.parse({ email: formData.email, password: formData.password });
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
        toast.success('Login successful!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [mode, formData, loading, mounted, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background-app p-4 flex items-center justify-center">
        <div className="text-text-primary text-body font-body">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-app p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-text-primary text-h1 font-heading font-bold mb-2">
            FlavorWheel
          </h1>
          <p className="text-text-secondary text-small font-body">
            Discover your perfect coffee profile
          </p>
        </div>
        
        <div className="card p-6">
          {/* Mode Toggle */}
          <div className="flex mb-6 bg-background-muted rounded-button p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 px-4 rounded-button font-body font-semibold transition-all duration-200 min-h-[44px] ${
                mode === 'login'
                  ? 'bg-primary text-text-inverse shadow-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-surface'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 px-4 rounded-button font-body font-semibold transition-all duration-200 min-h-[44px] ${
                mode === 'register'
                  ? 'bg-primary text-text-inverse shadow-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-surface'
              }`}
            >
              Register
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-2">
                <label htmlFor="full_name" className="block text-small font-body font-medium text-text-primary">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border-2 border-border-default rounded-input text-body font-body min-h-[44px] bg-background-surface text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-small font-body font-medium text-text-primary">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-3 border-2 border-border-default rounded-input text-body font-body min-h-[44px] bg-background-surface text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-small font-body font-medium text-text-primary">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-3 border-2 border-border-default rounded-input text-body font-body min-h-[44px] bg-background-surface text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              {mode === 'register' && (
                <p className="text-caption text-text-muted font-body mt-1">
                  Minimum 8 characters required
                </p>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-primary"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In to FlavorWheel' : 'Create Your Account'
                )}
              </button>
            </div>
          </form>
          
          {/* Additional Info */}
          <div className="mt-6 pt-4 border-t border-border-subtle">
            <p className="text-center text-caption text-text-muted font-body">
              {mode === 'login' 
                ? 'New to FlavorWheel? Switch to Register above' 
                : 'Already have an account? Switch to Login above'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSection;