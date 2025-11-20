import { useCallback, useEffect, useMemo, useState } from "react";
let miniAppSdk: any = undefined;
try { miniAppSdk = require("@farcaster/miniapp-sdk")?.sdk ?? require("@farcaster/miniapp-sdk"); } catch(e){ miniAppSdk = undefined; }

export default function useFarcasterContext(){
  const [loading,setLoading]=useState(true);
  const [fid,setFid]=useState(undefined);
  const [username,setUsername]=useState(undefined);
  const [isInMiniApp,setIsInMiniApp]=useState(false);
  const isAvailable = Boolean(miniAppSdk);

  const tryGetUser = useCallback(async ()=>{
    setLoading(true);
    try{
      if(!miniAppSdk){ setFid(null); setUsername(null); setIsInMiniApp(false); return; }
      if(typeof miniAppSdk.whoami==='function'){ const who=await miniAppSdk.whoami(); setFid(who?.fid ?? null); setUsername(who?.username ?? who?.handle ?? null); setIsInMiniApp(true); return; }
      if(typeof miniAppSdk.getUser==='function'){ const u=await miniAppSdk.getUser(); setFid(u?.fid ?? null); setUsername(u?.username ?? u?.handle ?? null); setIsInMiniApp(true); return; }
      if(typeof miniAppSdk.getProfile==='function'){ const p=await miniAppSdk.getProfile(); setFid(p?.fid ?? null); setUsername(p?.username ?? p?.displayName ?? null); setIsInMiniApp(true); return; }
      if(miniAppSdk.identity && typeof miniAppSdk.identity.getCurrent==='function'){ const cur=await miniAppSdk.identity.getCurrent(); setFid(cur?.fid ?? null); setUsername(cur?.username ?? cur?.handle ?? null); setIsInMiniApp(true); return; }
      setFid(null); setUsername(null); setIsInMiniApp(Boolean(miniAppSdk));
    }catch(e){ setFid(null); setUsername(null); setIsInMiniApp(Boolean(miniAppSdk)); } finally { setLoading(false); }
  },[]);

  const launchMiniApp = useCallback(async (url)=>{ const target = url ?? (typeof window !== "undefined" ? window.location.origin : "/"); try{ if(miniAppSdk && typeof miniAppSdk.launch==='function'){ await miniAppSdk.launch({url:target}); return; } if(miniAppSdk && typeof miniAppSdk.open==='function'){ await miniAppSdk.open({url:target}); return; } if(typeof window!=='undefined') window.open(target,'_blank'); }catch(e){ if(typeof window!=='undefined') window.open(target,'_blank'); } },[]);

  const openFrame = useCallback(async (url)=>{ const target = url ?? (typeof window !== "undefined" ? window.location.origin : "/"); try{ if(miniAppSdk && typeof miniAppSdk.open==='function'){ await miniAppSdk.open({url:target}); return; } if(miniAppSdk && typeof miniAppSdk.launchFrame==='function'){ await miniAppSdk.launchFrame({url:target}); return; } if(typeof window!=='undefined') window.open(target,'_blank'); }catch(e){ if(typeof window!=='undefined') window.open(target,'_blank'); } },[]);

  useEffect(()=>{ tryGetUser(); let unsub; try{ if(miniAppSdk && typeof miniAppSdk.on==='function'){ const h=async()=>{ await tryGetUser(); }; try{ miniAppSdk.on('authChanged',h); }catch{} try{ miniAppSdk.on('accountChanged',h); }catch{} try{ miniAppSdk.on('connected',h); }catch{} try{ miniAppSdk.on('disconnected',h); }catch{} unsub = ()=>{ try{ miniAppSdk.off?.('authChanged',h);}catch{} try{ miniAppSdk.off?.('accountChanged',h);}catch{} try{ miniAppSdk.off?.('connected',h);}catch{} try{ miniAppSdk.off?.('disconnected',h);}catch{} } } }catch(e){} return ()=>{ try{ unsub?.(); }catch{} } },[tryGetUser]);

  return useMemo(()=>({ isAvailable, isInMiniApp, loading, fid, username, launchMiniApp, openFrame, refresh: tryGetUser }),[isAvailable,isInMiniApp,loading,fid,username,launchMiniApp,openFrame,tryGetUser]);
}
