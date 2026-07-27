import { useCallback, useEffect, useState } from "react";

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};

type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
};

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = useCallback(async () => {
    const el = document.documentElement as FsElement;

    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    } catch {
      // iOS Safari não permite fullscreen nativo — segue só com o CSS
    }

    try {
      const orientation = screen.orientation as LockableOrientation | undefined;
      await orientation?.lock?.("landscape");
    } catch { }

    setIsFullscreen(true);
  }, []);

  const exit = useCallback(async () => {
    try {
      const orientation = screen.orientation as LockableOrientation | undefined;
      orientation?.unlock?.();
    } catch {}

    const doc = document as FsDocument;
    try {
      if (doc.fullscreenElement && doc.exitFullscreen) await doc.exitFullscreen();
      else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      }
    } catch {}

    setIsFullscreen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isFullscreen) void exit();
    else void enter();
  }, [isFullscreen, enter, exit]);

  useEffect(() => {
    const syncState = () => {
      const doc = document as FsDocument;
      const active = !!(doc.fullscreenElement || doc.webkitFullscreenElement);
      if (!active) setIsFullscreen(false);
    };

    document.addEventListener("fullscreenchange", syncState);
    document.addEventListener("webkitfullscreenchange", syncState);
    return () => {
      document.removeEventListener("fullscreenchange", syncState);
      document.removeEventListener("webkitfullscreenchange", syncState);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) void exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen, exit]);

  return { isFullscreen, toggle, exit };
}   