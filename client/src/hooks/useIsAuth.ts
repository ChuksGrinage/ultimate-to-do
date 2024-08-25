import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "./useMe";

export function useIsAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { me, meIsLoading } = useMe();

  useEffect(() => {
    if (!me?.email && !meIsLoading && pathname !== "/login") {
      router.replace(`/login?next=${pathname}`);
    }
  }, [me?.email, router, meIsLoading, pathname]);

  return { meIsLoading, me };
}
