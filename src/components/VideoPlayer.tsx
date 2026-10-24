"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Loader2 } from "lucide-react";

const DEMO_VIDEO = "https://media.w3.org/2010/05/sintel/trailer.mp4";

function fmt(t: number) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({
  embedUrl,
  videoUrl,
  poster,
  title,
}: {
  embedUrl?: string;
  videoUrl?: string;
  poster?: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const useEmbed = !!embedUrl && !videoUrl;
  const src = videoUrl || DEMO_VIDEO;

  // Native video logic (only when not using embed)
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };
  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Number(e.target.value);
    v.currentTime = t;
    setCurrent(t);
  };
  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    setVolume(val);
    setMuted(val === 0);
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const toggleFullscreen = async () => {
    const c = containerRef.current;
    if (!c) return;
    if (!document.fullscreenElement) { await c.requestFullscreen(); setFullscreen(true); }
    else { await document.exitFullscreen(); setFullscreen(false); }
  };
  const skip = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), duration);
  };
  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => { if (playing) setShowControls(false); }, 2800);
  };

  useEffect(() => {
    if (useEmbed) return;
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrent(v.currentTime);
    const onMeta = () => setDuration(v.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onProgress = () => { if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1)); };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("progress", onProgress);
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("progress", onProgress);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [useEmbed]);

  const progressPct = duration ? (current / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  // ---- Embed mode (actual content from original host) ----
  if (useEmbed) {
    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-[var(--color-border-strong)]"
      >
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-bg-card)] z-10">
            <Loader2 size={28} className="animate-spin text-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-text-dim)]">Loading player…</span>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full"
          frameBorder={0}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="eager"
          onLoad={() => setIframeLoaded(true)}
        />
        {/* Click-absorbing overlay: prevents first-click ad redirects/popups.
            On click we hide it and reload the iframe with autoplay so playback
            starts without further clicks (and without triggering the host's ad gate). */}
        {!started && (
          <button
            onClick={() => setStarted(true)}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors cursor-pointer"
            aria-label="Play"
          >
            <span className="flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-accent)] text-white shadow-2xl hover:scale-110 transition-transform">
              <Play size={34} fill="white" className="ml-1" />
            </span>
          </button>
        )}
        {/* Top title overlay */}
        <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-30">
          <h2 className="font-display font-bold text-white text-lg drop-shadow">{title}</h2>
        </div>
      </div>
    );
  }

  // ---- Native mode ----
  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl ring-1 ring-[var(--color-border-strong)]"
      onMouseMove={scheduleHide}
      onTouchStart={scheduleHide}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      />
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity"
          aria-label="Play"
        >
          <span className="flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-accent)] text-white shadow-2xl hover:scale-110 transition-transform">
            <Play size={34} fill="white" className="ml-1" />
          </span>
        </button>
      )}
      <div
        className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 ${
          showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-12">
          <div className="relative h-1.5 mb-3 group/progress">
            <div className="absolute inset-0 rounded-full bg-white/20" />
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${bufferedPct}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-accent)]" style={{ width: `${progressPct}%` }} />
            <input type="range" min={0} max={duration || 0} step={0.1} value={current} onChange={seek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <button onClick={togglePlay} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors" aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause size={20} /> : <Play size={20} fill="white" />}
              </button>
              <button onClick={() => skip(-10)} className="p-2 rounded-lg hover:bg-white/10 text-white/80 transition-colors" aria-label="Back 10s"><SkipBack size={18} /></button>
              <button onClick={() => skip(10)} className="p-2 rounded-lg hover:bg-white/10 text-white/80 transition-colors" aria-label="Forward 10s"><SkipForward size={18} /></button>
              <div className="flex items-center gap-1.5 ml-2 group/vol">
                <button onClick={toggleMute} className="p-2 rounded-lg hover:bg-white/10 text-white/80 transition-colors" aria-label={muted ? "Unmute" : "Mute"}>
                  {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume} onChange={onVolume} className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-[var(--color-accent)]" />
              </div>
              <span className="text-xs text-white/70 ml-2 font-mono tabular-nums">{fmt(current)} / {fmt(duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-white/10 text-white/80 transition-colors" aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
                {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0"}`}>
        <h2 className="font-display font-bold text-white text-lg drop-shadow">{title}</h2>
      </div>
    </div>
  );
}
