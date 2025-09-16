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
      <div className="min-h-screen bg-[#FEF3E7] p-4 flex items-center justify-center">
        <div className="text-[#2C1810] text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEF3E7] p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-[#2C1810] text-[clamp(22px,5vw,28px)] font-[Inter Variable] mb-8 text-center">
          FlavorWheel
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-[#1F5D4C] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-[#1F5D4C] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-base min-h-[44px] focus:border-[#1F5D4C] focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base min-h-[44px] focus:border-[#1F5D4C] focus:outline-none transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base min-h-[44px] focus:border-[#1F5D4C] focus:outline-none transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F5D4C] text-white p-3 rounded-lg min-h-[44px] font-semibold hover:bg-[#164A3C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthSection;