import { useEffect, type RefObject } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutsideClick: () => void,
): void {
  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      onOutsideClick();
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [ref, onOutsideClick]);
}
