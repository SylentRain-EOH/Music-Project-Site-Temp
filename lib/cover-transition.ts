export type CoverRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type CoverTransition = {
  slug: string;
  rect: CoverRect;
};

const STORAGE_KEY = "soul-searching-cover-transition";

export function saveCoverTransition(transition: CoverTransition) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(transition));
}

export function takeCoverTransition(): CoverTransition | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(STORAGE_KEY);
  try {
    return JSON.parse(raw) as CoverTransition;
  } catch {
    return null;
  }
}

export function flipFromRect(
  element: HTMLElement,
  from: CoverRect,
  duration = 450
) {
  const final = element.getBoundingClientRect();
  const dx = from.left - final.left;
  const dy = from.top - final.top;
  const scaleX = from.width / final.width;
  const scaleY = from.height / final.height;
  element.style.transition = "none";
  element.style.transformOrigin = "top left";
  element.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
  element.getBoundingClientRect();
  element.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
  element.style.transform = "";
}
