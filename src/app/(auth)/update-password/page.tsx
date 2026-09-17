"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Your password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Unable to update password:", error);

      setErrorMessage(
        "The password could not be updated. The reset link may have expired. Please request a new one.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">
          Password updated
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Your Euloges password has been changed successfully.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex rounded-lg bg-[#2F2F2F] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 className="text-center text-2xl font-semibold text-gray-800">
        Create a new password
      </h1>

      <p className="mt-2 text-center text-sm leading-6 text-gray-500">
        Choose a new password for your Euloges account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-600">
            New password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A9B8E]"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">
            Confirm new password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A9B8E]"
          />
        </div>

        {errorMessage && (
          <p className="text-sm leading-6 text-red-600">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#2F2F2F] py-2.5 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Need another reset link?{" "}
        <Link
          href="/forgot-password"
          className="font-medium text-gray-900 hover:underline"
        >
          Request one
        </Link>
      </p>
    </div>
  );
}
