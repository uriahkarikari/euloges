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

      router.push("/create-brochure");
      router.refresh();
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

      {/* <button
        type="button"
        className="w-full mt-6 flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt=""
          className="w-5 h-5"
        />

        <span className="text-sm font-medium text-gray-700">
          Sign in with Google
        </span>
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div> */}

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
