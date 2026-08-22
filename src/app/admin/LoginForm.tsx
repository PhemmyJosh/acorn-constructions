"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm({
  configured,
  next,
}: {
  configured: boolean;
  /** Where to land after a successful sign-in, e.g. an emailed deep link. */
  next?: string;
}) {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="admin-password"
          className="font-heading text-xs uppercase tracking-[0.2em] text-acorn-charcoal/70"
        >
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={!configured}
          className="rounded-sm border border-acorn-bronze/30 bg-white px-4 py-3 text-sm text-acorn-charcoal outline-none focus:border-acorn-gold disabled:cursor-not-allowed disabled:bg-acorn-stone/60"
        />
      </div>

      {!configured && (
        <p className="text-sm text-acorn-rust">
          ADMIN_PASSWORD is not set. Add it to <code>.env</code> and restart the
          server.
        </p>
      )}

      {state.error && (
        <p role="alert" className="text-sm text-acorn-rust">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !configured}
        className="w-full rounded-sm bg-acorn-gold px-6 py-3 font-heading text-sm uppercase tracking-[0.15em] text-acorn-charcoal transition-colors hover:bg-acorn-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
