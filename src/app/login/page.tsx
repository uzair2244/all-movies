import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Film, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="container-x py-12 flex justify-center">
        <div className="card w-full max-w-md p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent)] text-white mb-3">
              <Film size={22} />
            </span>
            <h1 className="font-display font-extrabold text-xl">Welcome Back!</h1>
            <p className="text-sm text-[var(--color-text-dim)] mt-1">Sign in to your account</p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-dim)] mb-1.5">
                Username or Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input className="field pl-9" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-dim)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input type="password" className="field pl-9" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[var(--color-text-dim)]">
                <input type="checkbox" className="accent-[var(--color-accent)]" />
                Remember me
              </label>
              <a href="#" className="text-[var(--color-accent)] hover:underline">
                Lost your password?
              </a>
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Log In
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
