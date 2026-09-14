import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-semibold text-gray-800 text-center">
        Create your Euloges account
      </h1>

      <p className="text-sm text-gray-500 text-center mt-2">
        Begin preserving a life and its memories.
      </p>

      <button
        type="button"
        className="w-full mt-6 flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt=""
          className="w-5 h-5"
        />

        <span className="text-sm font-medium text-gray-700">
          Sign up with Google
        </span>
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Full name</label>

          <input
            type="text"
            placeholder="Your full name"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A9B8E]"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Email address
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A9B8E]"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Password</label>

          <input
            type="password"
            placeholder="Create a password"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A9B8E]"
          />
        </div>

        <button
          type="button"
          className="w-full bg-[#2F2F2F] text-white py-2.5 rounded-lg hover:opacity-90"
        >
          Create account
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-gray-900 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
