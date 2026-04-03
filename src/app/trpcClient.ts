import { trpc } from "@/lib/trpc";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { useAuthStore } from "@/store/authStore";

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers: () => {
        const token = useAuthStore.getState().token;
        return {
          Authorization: token ? `Bearer ${token}` : "",
        };
      },
    }),
  ],
});
