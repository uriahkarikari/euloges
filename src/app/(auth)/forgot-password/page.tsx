"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Enter your email address.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setErrorMessage("");

    try {
      const supabase = createClient();

const redirectTo = `${window.location.origin}/callback?next=update-password`;
const { error } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo,
        },
      );

      if (error) {
        throw error;
      }

      setMessage(
        "If an account exists for this email address, a password reset link has been sent.",
      );
    } catch (error) {
      console.error("Unable to send password reset email:", error);

      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("rate limit")
      ) {
        setErrorMessage(
          "Too many password reset requests have been made. Please wait a while before trying again.",
        );
      } else {
        setErrorMessage(
          "We could not send the password reset email. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }



  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 className="text-center text-2xl font-semibold text-gray-800">
        Reset your password
      </h1>

      <p className="mt-2 text-center text-sm text-gray-500">
        Enter the email address associated with your Euloges account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-600">
            Email address
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A9B8E]"
          />
        </div>

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        {message && (
          <p className="text-sm leading-6 text-[#5F776E]">{message}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#2F2F2F] py-2.5 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
