"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

 async function handleGoogleSignIn() {
   setIsSigningIn(true);
   setErrorMessage("");

   try {
     const supabase = createClient();

     const { error } = await supabase.auth.signInWithOAuth({
       provider: "google",
       options: {
         redirectTo: `${window.location.origin}/callback`,
       },
     });

     if (error) {
       throw error;
     }
   } catch (error) {
     console.error("Google sign in failed:", error);

     setErrorMessage(
       error instanceof Error
         ? error.message
         : "Unable to sign in with Google. Please try again.",
     );

     setIsSigningIn(false);
   }
 } 

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage("Enter your email address and password.");
      return;
    }

    setIsSigningIn(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

router.push("/");      router.refresh();
    } catch (error) {
      console.error("Sign in failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-semibold text-gray-800 text-center">
        Welcome back
      </h1>

      <p className="text-sm text-gray-500 text-center mt-2">
        Sign in to manage memorials and preserve memories.
      </p>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSigningIn}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 py-2.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.97-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
          />
        </svg>

        <span className="text-sm font-medium text-gray-700">
          Continue with Google
        </span>
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form className="space-y-4" onSubmit={handleSignIn}>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Email address
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A9B8E]"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A9B8E]"
          />
        </div>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSigningIn}
          className="w-full bg-[#2F2F2F] text-white py-2.5 rounded-lg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningIn ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-gray-900 font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
