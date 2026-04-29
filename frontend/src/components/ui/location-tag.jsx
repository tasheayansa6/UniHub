import { useState, useEffect } from "react";

export function LocationTag({
  city = "Haramaya",
  country = "Ethiopia",
  timezone = "EAT",
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-center gap-3 rounded-full border px-4 py-2.5 transition-all duration-500 ease-out"
      style={{
        borderColor: isHovered ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
        background: isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
        boxShadow: isHovered ? "0 0 20px rgba(0,0,0,0.2)" : "none",
      }}
    >
      {/* Live pulse */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      </div>

      {/* Text — slides between location and time */}
      <div className="relative flex items-center overflow-hidden" style={{ height: 20, minWidth: 120 }}>
        <span
          className="absolute text-sm font-medium text-white/80 whitespace-nowrap transition-all duration-500"
          style={{
            transform: isHovered ? "translateY(-100%)" : "translateY(0)",
            opacity: isHovered ? 0 : 1,
          }}
        >
          {city}, {country}
        </span>
        <span
          className="absolute text-sm font-medium text-white/80 whitespace-nowrap transition-all duration-500"
          style={{
            transform: isHovered ? "translateY(0)" : "translateY(100%)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          {currentTime} {timezone}
        </span>
      </div>

      {/* Arrow */}
      <svg
        className="h-3 w-3 flex-shrink-0 transition-all duration-300"
        style={{
          color: "rgba(255,255,255,0.4)",
          transform: isHovered
            ? "translateX(2px) rotate(-45deg)"
            : "translateX(0) rotate(0)",
          opacity: isHovered ? 1 : 0.5,
        }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
        />
      </svg>
    </button>
  );
}
