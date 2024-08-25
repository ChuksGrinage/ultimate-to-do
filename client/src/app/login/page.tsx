"use client";

import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const nextLocation = searchParams.get("next");

  return (
    <main className="">
      <a
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        href={`${process.env.NEXT_PUBLIC_SERVER_URL}/login/google${nextLocation ? `?next=${nextLocation}` : ""}`}
      >
        Login with Google
      </a>
    </main>
  );
}
