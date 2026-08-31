"use client";

import { useEffect,useRef,useState } from "react";
import { connectViewerWebRTC,cleanupViewerWebRTC } from "./viewer/viewerWebRTC";
import { enableViewerSound,muteViewerVideo } from "./viewer/viewerMedia";
import type { ViewerProps } from "./viewer/viewerTypes";

export default function Viewer({ liveId }: ViewerProps) {
  const videoRef=useRef<HTMLVideoElement|null>(null);
  const peerRef=useRef<RTCPeerConnection|null>(null);
  const remoteStreamRef=useRef<MediaStream|null>(null);
  const playbackPromiseRef=useRef<Promise<void>|null>(null);
  const cancelledRef=useRef(false);
  const mountedRef=useRef(true);
  const retryTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const connectingRef=useRef(false);
  const [connecting,setConnecting]=useState(true);
  const [connected,setConnected]=useState(false);
  const [error,setError]=useState("");
  const [hasVideo,setHasVideo]=useState(false);
  const [muted,setMuted]=useState(true);
  const [isOffline,setIsOffline]=useState(false);

  useEffect(()=>{
    mountedRef.current=true;
    cancelledRef.current=false;
    void connectViewerWebRTC({
      liveId,
      videoRef,
      peerRef,
      remoteStreamRef,
      playbackPromiseRef,
      cancelledRef,
      mountedRef,
      retryTimerRef,
      connectingRef,
      setConnecting,
      setConnected,
      setError,
      setHasVideo,
      setIsOffline,
    });
    return()=>{
      cancelledRef.current=true;
      mountedRef.current=false;
      cleanupViewerWebRTC({peerRef,remoteStreamRef,retryTimerRef,videoRef});
    };
  },[liveId]);

async function handleSound(){
  await enableViewerSound({
    videoRef,
    remoteStreamRef,
    setHasVideo,
    setConnected,
    setConnecting,
    setError,
  });
  setMuted(false);
}

  function handleMute(){
    muteViewerVideo({videoRef,setMuted});
  }

  return(
    <section className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 text-white shadow-2xl transition-all duration-300 hover:border-zinc-700/50">
      <video ref={videoRef} autoPlay playsInline muted={muted} controls={false} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"/>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 via-black/40 to-transparent"/>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/45 to-transparent"/>
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 select-none">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100 drop-shadow-sm sm:text-base">StreetGo Live Camera</h2>
          <p className="mt-0.5 text-xs font-medium text-zinc-400 opacity-90">Live video feed</p>
        </div>
        <div className={`relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-colors duration-300 ${connected?"border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]":isOffline?"border border-rose-500/20 bg-rose-500/10 text-rose-400":"animate-pulse border border-zinc-500/20 bg-zinc-500/10 text-zinc-400"}`}>
          {connected&&<span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400"/>}
          {connected&&<span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>}
          {connected?"LIVE":isOffline?"OFFLINE":connecting?"CONNECTING":"WAITING"}
        </div>
      </div>
      {!hasVideo&&(
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-25 ${isOffline?"bg-rose-400":"bg-indigo-400"}`}/>
            <span className={`relative inline-flex h-3 w-3 rounded-full ${isOffline?"bg-rose-500":"bg-indigo-500"}`}/>
          </div>
          <p className="mt-3 text-xs font-medium tracking-wide text-zinc-400">{isOffline?"Waiting for stream connection...":"Establishing StreetGO Secure Link..."}</p>
        </div>
      )}
      {error&&!isOffline&&!connected&&(
        <div className="absolute bottom-16 left-5 right-5 z-20 max-w-md animate-in rounded-xl border border-rose-500/20 bg-rose-950/40 p-3.5 backdrop-blur-md fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-xs font-medium leading-relaxed text-rose-300">{error}</p>
        </div>
      )}
      {hasVideo&&(
        <div className="absolute bottom-5 left-5 z-20">
          {muted?(
            <button type="button" onClick={handleSound} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 shadow-lg transition-all hover:bg-zinc-100 active:scale-95"><span>🔊</span>Enable Sound</button>
          ):(
            <button type="button" onClick={handleMute} className="flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-black/60 px-4 py-2 text-xs font-semibold text-zinc-200 shadow-lg backdrop-blur-md transition-all hover:bg-black/80 hover:text-white active:scale-95"><span>🔇</span>Mute Stream</button>
          )}
        </div>
      )}
      <div className="absolute bottom-5 right-5 z-20 hidden items-center gap-4 text-[10px] font-medium tracking-wider text-zinc-400/90 drop-shadow-sm select-none sm:flex">
        <div className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-zinc-500"/><span>RTC: <span className={connected?"text-zinc-200":"text-zinc-500"}>{connected?"SECURE":"IDLE"}</span></span></div>
        <div className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-zinc-500"/><span>VIDEO: <span className={hasVideo?"text-zinc-200":"text-zinc-500"}>{hasVideo?"DECODING":"STALLED"}</span></span></div>
      </div>
    </section>
  );
}