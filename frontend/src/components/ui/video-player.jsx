import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (seconds) => {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
};

// ─── Custom Slider ─────────────────────────────────────────────────────────────

const CustomSlider = ({ value, onChange, className }) => {
  return (
    <motion.div
      className={cn(
        "relative w-full h-1 bg-white/20 rounded-full cursor-pointer group",
        className
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.min(Math.max((x / rect.width) * 100, 0), 100);
        onChange(pct);
      }}
    >
      <motion.div
        className="absolute top-0 left-0 h-full bg-white rounded-full"
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      {/* Thumb dot */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        style={{ left: `calc(${value}% - 6px)` }}
      />
    </motion.div>
  );
};

// ─── Video Player ──────────────────────────────────────────────────────────────

const VideoPlayer = ({ src, className }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value) => {
    if (!videoRef.current) return;
    const newVolume = value / 100;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isFinite(pct) ? pct : 0);
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (value) => {
    if (!videoRef.current?.duration) return;
    const time = (value / 100) * videoRef.current.duration;
    if (isFinite(time)) {
      videoRef.current.currentTime = time;
      setProgress(value);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted) {
      setVolume(0);
    } else {
      setVolume(1);
      videoRef.current.volume = 1;
    }
  };

  const setSpeed = (speed) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const VolumeIcon = isMuted ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  return (
    <motion.div
      className={cn(
        "relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-black/60 shadow-2xl backdrop-blur-sm",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full block"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        src={src}
        onClick={togglePlay}
      />

      {/* Big play button overlay when paused */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
              <Play className="h-7 w-7 text-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 mx-3 mb-3 px-4 py-3 bg-black/70 backdrop-blur-md rounded-2xl border border-white/10"
            initial={{ y: 16, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 16, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Progress row */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/70 text-xs tabular-nums w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <CustomSlider value={progress} onChange={handleSeek} className="flex-1" />
              <span className="text-white/70 text-xs tabular-nums w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              {/* Left: play + volume */}
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  {isPlaying
                    ? <Pause className="h-4 w-4" />
                    : <Play className="h-4 w-4 ml-0.5" />
                  }
                </motion.button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMute}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
                  >
                    <VolumeIcon className="h-4 w-4" />
                  </motion.button>
                  <div className="w-20">
                    <CustomSlider value={isMuted ? 0 : volume * 100} onChange={handleVolumeChange} />
                  </div>
                </div>
              </div>

              {/* Right: speed */}
              <div className="flex items-center gap-1">
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <motion.button
                    key={speed}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSpeed(speed)}
                    className={cn(
                      "px-2 py-1 rounded-lg text-xs font-semibold transition-colors",
                      playbackSpeed === speed
                        ? "bg-white text-black"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {speed}x
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoPlayer;
