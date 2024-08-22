"use client";

import { useIsAuth } from "~/hooks/useIsAuth";

export default function AccountPage() {
  useIsAuth();

  return <main className="">Account Page</main>;
}
