"use client";

export default function HomePage() {
  return (
    <main className="">
      <a
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        href={`${process.env.NEXT_PUBLIC_SERVER_URL}/logout`}
      >
        Logout
      </a>
    </main>
  );
}
