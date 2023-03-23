import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";
import Link from "next/link";

const Home = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main>Loading...</main>;
  }

  return (
    <main className="flex flex-col items-center">
      <h1 className="pt-4 text-3xl">Guestbook</h1>
      <div className="pt-10">
        {session ? (
          <>
            {" "}
            <p className="mb-4 text-center">Hi {session.user?.name}</p>
            <div className="flex flex-col gap-4">
              <button
                className="mx-auto block rounded-md bg-neutral-800 py-3 px-6 text-center hover:bg-neutral-700"
                onClick={() => {
                  signOut().catch(console.log);
                }}
              >
                Sign out
              </button>
              <Link
                className="mx-auto block rounded-md bg-neutral-800 py-3 px-6 text-center hover:bg-neutral-700"
                href="/dashboard"
              >
                Go to dashboard
              </Link>
            </div>
            <div className="pt-10">
              <GuestbookForm />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {" "}
            <button
              type="button"
              className="mx-auto block rounded-md bg-neutral-800 py-3 px-6 text-center hover:bg-neutral-700"
              onClick={() => {
                signIn("discord").catch(console.log);
              }}
            >
              Sign in with Discord
            </button>
            <button
              type="button"
              className="mx-auto block rounded-md bg-neutral-800 py-3 px-6  text-center hover:bg-neutral-700"
              onClick={() => {
                signIn("github").catch(console.log);
              }}
            >
              Sign in with Github
            </button>
          </div>
        )}
        <div className="pt-10">
          <GuestbookEntries />
        </div>
      </div>
    </main>
  );
};

const GuestbookEntries = () => {
  const { data: guestbookEntries, isLoading } = api.guestbook.getAll.useQuery();
  console.log(guestbookEntries);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4">
      {guestbookEntries?.map((entry, index) => {
        return (
          <div key={index}>
            <p>{entry.message}</p>
            <span>- {entry.name}</span>
          </div>
        );
      })}
    </div>
  );
};

const GuestbookForm = () => {
  const [message, setMessage] = useState("");
  const { data: session, status } = useSession();
  const utils = api.useContext();

  // optimistic update
  const postMessage = api.guestbook.postMessage.useMutation({
    onMutate: async (newEntry) => {
      // Cancel any outgoing refetches
      await utils.guestbook.getAll.cancel();
      utils.guestbook.getAll.setData(undefined, (prevEntries) => {
        if (!prevEntries) {
          return [newEntry];
        }
        return [newEntry, ...prevEntries];
      });
    },
    // Always refetch after error or success
    onSettled: async () => {
      await utils.guestbook.getAll.invalidate();
    },
  });

  if (status !== "authenticated") return null;

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        postMessage.mutate({
          name: session.user?.name as string,
          message,
        });
        setMessage("");
      }}
    >
      <input
        type="text"
        className="rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 focus:outline-none"
        placeholder="Your message..."
        minLength={2}
        maxLength={100}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button
        type="submit"
        className="rounded-md border-2 border-zinc-800 p-2 focus:outline-none"
      >
        Submit
      </button>
    </form>
  );
};

export default Home;
