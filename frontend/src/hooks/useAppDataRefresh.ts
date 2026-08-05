import { useEffect, useState } from "react";
import { subscribeToAppDataChanges } from "@/lib/app-events";

export function useAppDataRefresh(intervalMs = 10_000) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1);
    const unsubscribe = subscribeToAppDataChanges(refresh);

    const onFocus = () => refresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const timer = intervalMs > 0 ? window.setInterval(refresh, intervalMs) : undefined;

    return () => {
      unsubscribe();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (timer) window.clearInterval(timer);
    };
  }, [intervalMs]);

  return version;
}
