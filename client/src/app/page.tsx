"use client";

import { useMutation } from "@tanstack/react-query";
import { useIsAuth } from "~/hooks/useIsAuth";

export default function HomePage() {
  useIsAuth();
  const { mutate: logout } = useMutation({
    mutationFn: () => {
      return fetch("http://localhost:8080/logout", { method: "POST" }).then(
        (response) => response.json(),
      );
    },
  });

  return (
    <main className="">
      <a
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        href={`${
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
        }/logout`}
      >
        Logout
      </a>
    </main>
  );
}
