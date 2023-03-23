import { createTRPCRouter } from "~/server/api/trpc";
import { guestbookRouter } from "~/server/api/routers/guestbook";
import { stripeRouter } from "./routers/stripe";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  guestbook: guestbookRouter,
  stripe: stripeRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
