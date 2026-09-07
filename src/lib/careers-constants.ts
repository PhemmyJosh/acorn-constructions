/**
 * Careers values shared by the application form and the API route.
 *
 * Kept out of `src/data/careers.ts` on purpose: that module imports lucide
 * icons for the "why work with us" cards, and the API route has no business
 * pulling React components into the server bundle just to validate a checkbox
 * list. Same reasoning as `content-constants.ts`.
 */

/**
 * The areas an applicant can tick under "Areas of Expertise".
 *
 * These replaced a longer list of individual sub-skills (Wall Building, Roof
 * Cuts, Concrete Forming and so on) grouped under the same three headings.
 * Applications submitted before that change still hold those granular values,
 * so anything that *reads* stored data must tolerate values outside this list.
 * Only inbound submissions are constrained to it.
 */
export const EXPERTISE_AREAS = [
  "Framing",
  "Foundations",
  "Post Frame",
] as const;

export type ExpertiseArea = (typeof EXPERTISE_AREAS)[number];

/** True when a submitted value is one of the three current areas. */
export function isExpertiseArea(value: string): value is ExpertiseArea {
  return (EXPERTISE_AREAS as readonly string[]).includes(value);
}
