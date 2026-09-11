/**
 * The sign-up-then-brief journey a new client walks through. Registration is
 * step 1; the brief wizard renders the rest so the progress bar stays
 * continuous across the two pages.
 */
export const CLIENT_FLOW_STEPS = ["Account", "Need", "Details"] as const;

export const BRIEF_STEPS = ["Need", "Details"] as const;
