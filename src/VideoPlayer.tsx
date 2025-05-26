import React, { useEffect, useState } from "react";

type VideoPlayerProps = {
  youtubeUrl: string; // Can be a playlist URL now
  overlayText: string; // Not used anymore, but kept for compatibility
};

function getYouTubeEmbedUrl(
  url: string,
  randomIndex?: number,
  startSeconds?: number
): string {
  // Extract playlist ID and (optionally) video IDs from the URL
  const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  let startParam = startSeconds ? `&start=${startSeconds}` : "";
  if (playlistMatch) {
    let base = `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}&autoplay=1&rel=0&mute=1&loop=1${startParam}`;
    if (typeof randomIndex === "number") {
      base += `&index=${randomIndex}`;
    }
    return base;
  }
  // Fallback to single video
  const videoMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return videoMatch
    ? `https://www.youtube.com/embed/${videoMatch[1]}?autoplay=1&rel=0&mute=1&loop=1&playlist=${videoMatch[1]}${startParam}`
    : "";
}

function getTimeRemaining(targetDate: Date) {
  // Considera o horário de Brasília (UTC-3)
  const now = new Date();
  // Ajusta o horário atual para UTC-3
  const nowInBrasilia = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000 - 3 * 60 * 60000
  );
  const diff = targetDate.getTime() - nowInBrasilia.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

const COUNTDOWN_TARGET = new Date("2025-06-05T00:00:00-03:00");

const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeUrl }) => {
  // We'll pick a random index for the playlist only once on mount
  const [randomIndex] = useState(() => Math.floor(Math.random() * 13)); // Default: up to 13 videos
  const [randomStart] = useState(() => Math.floor(Math.random() * 600)); // 0 to 299 seconds (0 to 5 min)
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl, randomIndex, randomStart);
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(COUNTDOWN_TARGET));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(COUNTDOWN_TARGET));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <iframe
        src={embedUrl}
        title="YouTube playlist player"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen={false}
        style={{
          width: "100vw",
          height: "100vh",
          border: "none",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "100vw",
          color: "#fff",
          textAlign: "center",
          padding: "24px 0",
          fontSize: "5rem",
          fontWeight: "bold",
          letterSpacing: "1px",
          pointerEvents: "none",
          textShadow: "2px 2px 8px #000, 0px 0px 4px #000",
        }}
      >
        {timeLeft.days} Dia(s), {timeLeft.hours}:{timeLeft.minutes}:
        {timeLeft.seconds}
      </div>
    </div>
  );
};

export default VideoPlayer;
