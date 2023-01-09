import { useEffect, useState, RefObject, useMemo } from "react";

export const useOnScreen = (ref: RefObject<HTMLElement>) => {
  const [isOnScreen, setIsOnScreen] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIsOnScreen(entry.isIntersecting)
      ),
    []
  );

  useEffect(() => {
    ref.current && observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, observer]);

  return isOnScreen;
};
