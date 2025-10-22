"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/signin");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            CHATINN
          </h1>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleSignIn}
            >
              SIGN IN
            </button>
            <button
              className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              onClick={handleSignUp}
            >
              SIGN UP
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

