import { HONEYPOT_FIELD } from "@/lib/spam";

/**
 * Off-screen decoy input. Bots that fill every field in a form give themselves
 * away; the matching API route silently discards anything that arrives with
 * this field set.
 *
 * Deliberately not `display: none` or `hidden` — some bots skip those on the
 * assumption that they are traps. Moved off-screen instead, with `tabindex=-1`
 * and `aria-hidden` so neither keyboard nor screen-reader users ever reach it,
 * and `autocomplete="off"` so a browser or password manager does not fill it in
 * on a real visitor's behalf.
 */
export default function HoneypotField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
    >
      <label htmlFor={`acorn-${HONEYPOT_FIELD}`}>
        Leave this field empty
      </label>
      <input
        id={`acorn-${HONEYPOT_FIELD}`}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}
