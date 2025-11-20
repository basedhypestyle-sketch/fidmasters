// src/hooks/useFarcasterContext.ts
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * MiniApp-focused Farcaster hook.
 * Tries to use @farcaster/miniapp-sdk if available. Graceful fallback if not.
 */

let miniAppSdk: any = undefined;
try {
  // dynamic require to avoid bundler crash when package missing
  // (Vite/Rollup may still include it if installed)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  miniAppSdk = require("@farcaster/miniapp-sdk")?.sdk ?? require("@farcaster/miniapp-sdk");
} catch (e) {
  miniAppSdk = undefined;
}

export type FarcasterContext = {
  isAvailable: boolean;
  isInMiniApp: boolean;
  loading: boolean;
  fid?: string | null;
  username?: string | null;
  // actions
  launchMiniApp: (url?: string) => Promise<void>;
  openFrame: (url?: string) => Promise<void>;
  refresh: () => Promise<void>;
};

export default function useFarcasterContext(): FarcasterContext {
  const [loading, setLoading] = useState<boolean>(true);
  const [fid, setFid] = useState<string | null | undefined>(undefined);
  const [username, setUsername] = useState<string | null | undefined>(undefined);
  const [isInMiniApp, setIsInMiniApp] = useState<boolean>(false);

  const isAvailable = Boolean(miniAppSdk);

  const tryGetUser = useCallback(async () => {
    setLoading(true);
    try {
      if (!miniAppSdk) {
        setFid(null);
        setUsername(null);
        setIsInMiniApp(false);
        return;
      }

      // Prefer a common whoami/getUser/getProfile or identity.getCurrent patterns
      // 1) whoami (some SDK versions)
      if (typeof miniAppSdk.whoami === "function") {
        const who = await miniAppSdk.whoami();
        setFid(who?.fid ?? who?.userId ?? null);
        setUsername(who?.username ?? who?.handle ?? who?.displayName ?? null);
        setIsInMiniApp(true);
        return;
      }

      // 2) getUser
      if (typeof miniAppSdk.getUser === "function") {
        const u = await miniAppSdk.getUser();
        setFid(u?.fid ?? u?.id ?? null);
        setUsername(u?.username ?? u?.handle ?? u?.displayName ?? null);
        setIsInMiniApp(true);
        return;
      }

      // 3) getProfile
      if (typeof miniAppSdk.getProfile === "function") {
        const p = await miniAppSdk.getProfile();
        setFid(p?.fid ?? null);
        setUsername(p?.username ?? p?.displayName ?? null);
        setIsInMiniApp(true);
        return;
      }

      // 4) identity.getCurrent
      if (miniAppSdk.identity && typeof miniAppSdk.identity.getCurrent === "function") {
        const cur = await miniAppSdk.identity.getCurrent();
        setFid(cur?.fid ?? null);
        setUsername(cur?.username ?? cur?.handle ?? null);
        setIsInMiniApp(true);
        return;
      }

      // fallback: no user
      setFid(null);
      setUsername(null);
      setIsInMiniApp(Boolean(miniAppSdk));
    } catch (err) {
      // graceful fallback
      // console.debug("miniapp tryGetUser error", err);
      setFid(null);
      setUsername(null);
      setIsInMiniApp(Boolean(miniAppSdk));
    } finally {
      setLoading(false);
    }
  }, []);

  const launchMiniApp = useCallback(async (url?: string) => {
    const target = url ?? (typeof window !== "undefined" ? window.location.origin : "/");
    try {
      if (miniAppSdk && typeof miniAppSdk.launch === "function") {
        await miniAppSdk.launch({ url: target });
        return;
      }
      if (miniAppSdk && typeof miniAppSdk.open === "function") {
        await miniAppSdk.open({ url: target });
        return;
      }
      // fallback
      if (typeof window !== "undefined") window.open(target, "_blank");
    } catch (e) {
      if (typeof window !== "undefined") window.open(target, "_blank");
    }
  }, []);

  const openFrame = useCallback(async (url?: string) => {
    // miniapp SDK may not implement frame; try common patterns then fallback
    const target = url ?? (typeof window !== "undefined" ? window.location.origin : "/");
    try {
      if (miniAppSdk && typeof miniAppSdk.open === "function") {
        await miniAppSdk.open({ url: target });
        return;
      }
      if (miniAppSdk && typeof miniAppSdk.launchFrame === "function") {
        await miniAppSdk.launchFrame({ url: target });
        return;
      }
      if (typeof window !== "undefined") window.open(target, "_blank");
    } catch (e) {
      if (typeof window !== "undefined") window.open(target, "_blank");
    }
  }, []);

  const refresh = useCallback(async () => {
    await tryGetUser();
  }, [tryGetUser]);

  useEffect(() => {
    // on mount get user
    tryGetUser();

    // subscribe to auth/account events if SDK supports event emitter
    let unsub: (() => void) | undefined;
    try {
      if (miniAppSdk && typeof miniAppSdk.on === "function") {
        const handler = async () => {
          await tryGetUser();
        };
        // try common event names
        try { miniAppSdk.on("authChanged", handler); } catch {}
        try { miniAppSdk.on("accountChanged", handler); } catch {}
        try { miniAppSdk.on("connected", handler); } catch {}
        try { miniAppSdk.on("disconnected", handler); } catch {}

        unsub = () => {
          try { miniAppSdk.off?.("authChanged", handler); } catch {}
          try { miniAppSdk.off?.("accountChanged", handler); } catch {}
          try { miniAppSdk.off?.("connected", handler); } catch {}
          try { miniAppSdk.off?.("disconnected", handler); } catch {}
        };
      }
    } catch (e) {
      // ignore
    }

    return () => {
      try { unsub?.(); } catch {}
    };
  }, [tryGetUser]);

  const ret = useMemo<FarcasterContext>(() => {
    return {
      isAvailable,
      isInMiniApp,
      loading,
      fid: fid ?? undefined,
      username: username ?? undefined,
      launchMiniApp,
      openFrame,
      refresh,
    };
  }, [isAvailable, isInMiniApp, loading, fid, username, launchMiniApp, openFrame, refresh]);

  return ret;
        }
