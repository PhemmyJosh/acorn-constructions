"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [revealed, setRevealed] = useState(false);

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
        {/* Relative so the toggle can be positioned inside the field. */}
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            // The input stays uncontrolled, so React patches this attribute
            // rather than replacing the element, which is what keeps whatever
            // has been typed. Chrome does collapse the caret to the start on a
            // type change, but that is invisible here: clicking back into the
            // field puts the caret where you click, and tabbing back in selects
            // the contents the way it does for any populated input.
            type={revealed ? "text" : "password"}
            required
            autoComplete="current-password"
            disabled={!configured}
            // pr-14 clears the toggle's 44px width plus its inset, so a long
            // password scrolls out of sight rather than under the icon.
            className="w-full rounded-sm border border-acorn-bronze/30 bg-white px-4 py-3 pr-14 text-sm text-acorn-charcoal outline-none focus:border-acorn-gold disabled:cursor-not-allowed disabled:bg-acorn-stone/60"
          />
          <button
            // type="button" is what keeps this from submitting the form: a
            // button inside a form defaults to type="submit".
            type="button"
            onClick={() => setRevealed((current) => !current)}
            disabled={!configured}
            // The accessible name carries the state, so no aria-pressed: with
            // both, a screen reader announces the change twice and the two
            // readings disagree about which state is being described.
            aria-label={revealed ? "Hide password" : "Show password"}
            title={revealed ? "Hide password" : "Show password"}
            // Deliberately tabbable (no tabIndex={-1}): reaching it is the only
            // way a keyboard-only user can check what they typed.
            // h-11 w-11 is a 44px tap target rather than icon-sized, matching
            // the lightbox controls.
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm text-acorn-charcoal/55 transition-colors hover:bg-acorn-stone hover:text-acorn-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            {revealed ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        </div>
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
