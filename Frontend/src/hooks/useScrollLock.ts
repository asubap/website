import { useEffect } from "react";

let scrollLockCount = 0;
let previousOverflow: string | null = null;

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (active) {
      scrollLockCount++;
      if (scrollLockCount === 1) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
    }
    return () => {
      if (active) {
        scrollLockCount = Math.max(0, scrollLockCount - 1);
        if (scrollLockCount === 0) {
          document.body.style.overflow = previousOverflow || "";
          previousOverflow = null;
        }
      }
    };
  }, [active]);
}