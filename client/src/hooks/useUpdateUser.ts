import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (userInfo) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/user/${userInfo.id}`,
        {
          method: "PATCH",
          credentials: "include",
          body: JSON.stringify(userInfo),
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      //   TODO: Add toast notification
      alert("User updated successfully!");
    },
  });

  return mutation;
}
