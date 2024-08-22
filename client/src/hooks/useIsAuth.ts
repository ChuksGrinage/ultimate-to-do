import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function useIsAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8080/me", {
        credentials: "include",
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    },
  });

  useEffect(() => {
    if (!me?.email && !isLoading) {
      router.replace(`/login?next=${pathname}`);
    }
  }, [me?.email, router, isLoading]);
}
