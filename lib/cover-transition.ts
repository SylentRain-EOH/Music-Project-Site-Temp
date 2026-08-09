// 跨页面封面过渡工具：切换页面前把封面位置写入 sessionStorage，
// 目标页面挂载后通过 FLIP 动画让封面从原位置飞入。
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
const NAV_DIRECTION_KEY = "album-nav-direction";

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

export function hasCoverTransition(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) !== null;
}

export function saveNavDirection(direction: "left" | "right") {
  sessionStorage.setItem(NAV_DIRECTION_KEY, direction);
}

export function takeNavDirection(): "left" | "right" | null {
  const value = sessionStorage.getItem(NAV_DIRECTION_KEY);
  sessionStorage.removeItem(NAV_DIRECTION_KEY);
  return value === "left" || value === "right" ? value : null;
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
