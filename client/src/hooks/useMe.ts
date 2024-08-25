import { useQuery } from "@tanstack/react-query";

export function useMe() {
  const { data: me, isLoading } = useQuery({
    retry: false,
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/me`, {
        credentials: "include",
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    },
  });

  return { me, meIsLoading: isLoading };
}
