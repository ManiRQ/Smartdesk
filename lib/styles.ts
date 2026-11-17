export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export const INPUT_CLASS = `min-h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 ${FOCUS_RING}`;

const BUTTON_BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export const PRIMARY_BUTTON = `${BUTTON_BASE} bg-primary text-primary-foreground hover:opacity-90 ${FOCUS_RING}`;

export const SECONDARY_BUTTON = `${BUTTON_BASE} border border-border bg-card text-foreground hover:bg-muted ${FOCUS_RING}`;

export const DANGER_BUTTON = `${BUTTON_BASE} bg-destructive text-destructive-foreground hover:opacity-90 ${FOCUS_RING}`;

export const GHOST_BUTTON = `${BUTTON_BASE} px-3 hover:bg-muted ${FOCUS_RING}`;

export const DIALOG_CLASS =
  "m-auto w-[calc(100%-2rem)] max-w-2xl rounded-lg border border-border bg-card p-0 text-foreground shadow-lg backdrop:bg-foreground/40";
