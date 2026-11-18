/**
 * Shared client-side navigation event for jumping to a specific card
 * inside the Fana Experiences (#spaces) horizontal section.
 */

export const EXPERIENCE_JUMP_EVENT = "fana:jump-experience";

export interface ExperienceJumpDetail {
  cardIndex: number;
}

export function navigateToExperienceCard(cardIndex: number): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ExperienceJumpDetail>(EXPERIENCE_JUMP_EVENT, {
      detail: { cardIndex },
    })
  );
}
