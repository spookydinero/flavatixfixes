{
  "task": "generate_code",
  "component": "auth_section",
  "app_name": "FlavorWheel",
  "description": "Implement a mobile-first login/register section under /auth for the FlavorWheel app using Next.js, TypeScript, and Supabase Auth. Use React Toastify for success/error feedback (e.g., login success, registration confirmation). Follow the workflow from AUDITORIA_AUTH_MODIFIED.md: toggle between login/register, frontend validation with Zod, automatic email confirmation, redirect after login, and switch to login after registration. Ensure a Mexican-inspired design (e.g., #1F5D4C primary color) and no hardcoded secrets.",
  "dependencies": {
    "framework": "next",
    "language": "typescript",
    "auth_provider": "supabase",
    "packages": [
      "@supabase/supabase-js@^2.55.0",
      "next",
      "react",
      "react-toastify@^11.0.5",
      "zod@^3.25.76",
      "react-router-dom@^7.8.0"
    ]
  },
  "supabase_config": {
    "url": "https://kobuclkvlacdwvxmakvq.supabase.co",
    "anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYnVjbGt2bGFjZHd2eG1ha3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTYzOTIsImV4cCI6MjA2ODI3MjM5Mn0.wOq-3WWMLJyq9gKDoifb-7CqXb7kQx5hGcnv3MBCbPw",
    "table": "users",
    "schema": {
      "id": "uuid",
      "username": "text",
      "photo_url": "text",
      "bio": "text",
      "posts_count": "integer",
      "followers_count": "integer",
      "following_count": "integer",
      "preferred_category": "text",
      "last_tasted_at": "timestamp with time zone",
      "email_confirmed": "boolean",
      "tastings_count": "integer",
      "reviews_count": "integer",
      "created_at": "timestamp with time zone",
      "updated_at": "timestamp with time zone"
    }
  },
  "ui_requirements": {
    "layout": "mobile-first",
    "design_system": {
      "colors": {
        "primary": "#1F5D4C",
        "background": "#FEF3E7",
        "text": "#2C1810",
        "button_hover": "#2E7D32"
      },
      "typography": {
        "font_family": "Inter Variable, system-ui, -apple-system, sans-serif",
        "font_size": "16px",
        "heading_size": "clamp(22px, 5vw, 28px)"
      },
      "spacing": {
        "padding": "16px",
        "margin": "12px",
        "button_padding": "12px 20px",
        "button_min_height": "44px"
      }
    },
    "structure": {
      "auth_page": {
        "path": "/auth",
        "fields": {
          "register": [
            {
              "name": "full_name",
              "type": "text",
              "placeholder": "Full Name",
              "required": true
            },
            {
              "name": "email",
              "type": "email",
              "placeholder": "Email",
              "required": true
            },
            {
              "name": "password",
              "type": "password",
              "placeholder": "Password",
              "required": true
            }
          ],
          "login": [
            {
              "name": "email",
              "type": "email",
              "placeholder": "Email",
              "required": true
            },
            {
              "name": "password",
              "type": "password",
              "placeholder": "Password",
              "required": true
            }
          ]
        },
        "button": {
          "text": "{mode === 'login' ? 'Login' : 'Register'}",
          "type": "primary",
          "action": "{mode === 'login' ? 'signInUser' : 'signUpUser'}"
        },
        "toggle": {
          "text": "Switch to {mode === 'login' ? 'Register' : 'Login'}",
          "action": "toggle between register and login modes"
        }
      }
    }
  },
  "code_generation": {
    "file_path": "components/auth/AuthSection.tsx",
    "framework": "next",
    "language": "typescript",
    "imports": [
      "import { useState, useCallback } from 'react';",
      "import { useRouter } from 'next/navigation';",
      "import { createClient } from '@supabase/supabase-js';",
      "import { toast } from 'react-toastify';",
      "import { z } from 'zod';"
    ],
    "supabase_client": {
      "code": "const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');"
    },
    "state_management": {
      "mode": "useState<'login' | 'register'>('login')",
      "form_data": "useState<{ full_name?: string; email: string; password: string }>({})",
      "loading": "useState<boolean>(false)"
    },
    "validation_schemas": {
      "register_schema": "z.object({ full_name: z.string().min(2, 'Name required'), email: z.string().email('Invalid email'), password: z.string().min(8, 'Minimum 8 characters') })",
      "login_schema": "z.object({ email: z.string().email('Invalid email'), password: z.string().min(8, 'Minimum 8 characters') })"
    },
    "functions": {
      "handle_change": {
        "code": "const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n  setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));\n};"
      },
      "handle_submit": {
        "code": "const handleSubmit = useCallback(async (e: React.FormEvent) => {\n  e.preventDefault();\n  if (loading) return;\n  setLoading(true);\n  try {\n    if (mode === 'register') {\n      registerSchema.parse(formData);\n      const { data, error } = await supabase.auth.signUp({\n        email: formData.email,\n        password: formData.password,\n        options: { data: { full_name: formData.full_name } }\n      });\n      if (error) throw error;\n      toast.success('Registration successful! Check your email to confirm.');\n      setMode('login');\n    } else {\n      loginSchema.parse({ email: formData.email, password: formData.password });\n      const { data, error } = await supabase.auth.signInWithPassword({\n        email: formData.email,\n        password: formData.password\n      });\n      if (error) throw error;\n      toast.success('Login successful!');\n      router.push('/dashboard');\n    }\n  } catch (err) {\n    if (err instanceof z.ZodError) {\n      toast.error(err.errors[0].message);\n    } else {\n      toast.error(err.message || 'An error occurred');\n    }\n  } finally {\n    setLoading(false);\n  }\n}, [mode, formData, loading, router]);"
      }
    },
    "render": {
      "jsx": "<div className=\"min-h-screen bg-[#FEF3E7] p-4\">\n  <h1 className=\"text-[#2C1810] text-[clamp(22px,5vw,28px)] font-[Inter Variable] mb-4\">FlavorWheel</h1>\n  {mode === 'login' ? (\n    <form onSubmit={handleSubmit} className=\"space-y-4\">\n      <input\n        type=\"email\"\n        name=\"email\"\n        placeholder=\"Email\"\n        value={formData.email || ''}\n        onChange={handleChange}\n        required\n        className=\"w-full p-3 border-2 border-rgba(0,0,0,0.12) rounded-lg text-base min-h-[44px]\"\n      />\n      <input\n        type=\"password\"\n        name=\"password\"\n        placeholder=\"Password\"\n        value={formData.password || ''}\n        onChange={handleChange}\n        required\n        className=\"w-full p-3 border-2 border-rgba(0,0,0,0.12) rounded-lg text-base min-h-[44px] mt-3\"\n      />\n      <button\n        type=\"submit\"\n        disabled={loading}\n        className=\"w-full bg-[#1F5D4C] text-white p-3 rounded-lg min-h-[44px] font-semibold disabled:opacity-50\"\n      >\n        {loading ? 'Processing...' : 'Login'}\n      </button>\n    </form>\n  ) : (\n    <form onSubmit={handleSubmit} className=\"space-y-4\">\n      <input\n        type=\"text\"\n        name=\"full_name\"\n        placeholder=\"Full Name\"\n        value={formData.full_name || ''}\n        onChange={handleChange}\n        required\n        className=\"w-full p-3 border-2 border-rgba(0,0,0,0.12) rounded-lg text-base min-h-[44px]\"\n      />\n      <input\n        type=\"email\"\n        name=\"email\"\n        placeholder=\"Email\"\n        value={formData.email || ''}\n        onChange={handleChange}\n        required\n        className=\"w-full p-3 border-2 border-rgba(0,0,0,0.12) rounded-lg text-base min-h-[44px] mt-3\"\n      />\n      <input\n        type=\"password\"\n        name=\"password\"\n        placeholder=\"Password\"\n        value={formData.password || ''}\n        onChange={handleChange}\n        required\n        className=\"w-full p-3 border-2 border-rgba(0,0,0,0.12) rounded-lg text-base min-h-[44px] mt-3\"\n      />\n      <button\n        type=\"submit\"\n        disabled={loading}\n        className=\"w-full bg-[#1F5D4C] text-white p-3 rounded-lg min-h-[44px] font-semibold disabled:opacity-50\"\n      >\n        {loading ? 'Processing...' : 'Register'}\n      </button>\n    </form>\n  )}\n  <button\n    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}\n    className=\"w-full mt-4 bg-transparent border border-[#1F5D4C] text-[#1F5D4C] p-3 rounded-lg min-h-[44px] hover:bg-[#2E7D32] hover:text-white\"\n  >\n    Switch to {mode === 'login' ? 'Register' : 'Login'}\n  </button>\n</div>"
    }
  },
  "notes": {
    "supabase_setup": "Ensure the trigger function (handle_new_user) is applied in Supabase. Store NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    "toastify_usage": "Use toast.success/info/error for registration/login feedback as per AUDITORIA_AUTH_MODIFIED.md workflow.",
    "mobile_optimization": "Test on 375x667px (iPhone SE) with touch targets ≥44px.",
    "current_date_time": "2025-09-15 04:13 PM CST"
  }
}