import React, { useEffect, useState } from "react";

type VideoPlayerProps = {
  videoListUrl: string; // URL to a plain text file with video URLs, one per line
};

type VideoEntry = {
  id: string;
  duration: number; // in seconds
};

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function parseDuration(durationStr: string): number {
  // Accepts "hh:mm:ss", "mm:ss", or "ss"
  const parts = durationStr.split(":").map(Number).reverse();
  let seconds = 0;
  if (parts[0]) seconds += parts[0];
  if (parts[1]) seconds += parts[1] * 60;
  if (parts[2]) seconds += parts[2] * 3600;
  return seconds;
}

function getYouTubeEmbedUrl(videoId: string, startSeconds?: number): string {
  const startParam = startSeconds ? `&start=${startSeconds}` : "";
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&mute=1&loop=1&playlist=${videoId}${startParam}`;
}

function getTimeRemaining(targetDate: Date) {
  // Considera o horário de Brasília (UTC-3)
  const now = new Date();
  const nowInBrasilia = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
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

const COUNTDOWN_TARGET = new Date("2025-06-05T00:00:00-00:00");

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoListUrl }) => {
  const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([]);
  const [randomIdx, setRandomIdx] = useState<number | null>(null);
  const [randomStart, setRandomStart] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(COUNTDOWN_TARGET));

  // Fetch video list once
  useEffect(() => {
    fetch(videoListUrl)
      .then((res) => res.text())
      .then((text) => {
        const entries: VideoEntry[] = text
          .split("\n")
          .map((line) => {
            const [url, durationStr] = line.trim().split(",");
            const id = extractVideoId(url);
            if (!id) return null;
            const duration = durationStr ? parseDuration(durationStr) : 0;
            return { id, duration };
          })
          .filter((entry): entry is VideoEntry => !!entry && !!entry.id);
        setVideoEntries(entries);
        if (entries.length > 0) {
          const idx = Math.floor(Math.random() * entries.length);
          setRandomIdx(idx);
          const dur = entries[idx].duration;
          console.log(entries);
          console.log(entries[idx].duration);
          console.log(dur);
          setRandomStart(dur > 0 ? Math.floor(Math.random() * dur) : 0);
        }
      });
  }, [videoListUrl]);

  // Change video every 20 seconds
  useEffect(() => {
    if (videoEntries.length === 0) return;
    const interval = setInterval(() => {
      setRandomIdx((prevIdx) => {
        if (videoEntries.length === 1) return 0;
        let nextIdx;
        do {
          nextIdx = Math.floor(Math.random() * videoEntries.length);
        } while (nextIdx === prevIdx);
        // Set random start for the new video
        const dur = videoEntries[nextIdx].duration;
        setRandomStart(dur > 0 ? Math.floor(Math.random() * dur) : 0);
        return nextIdx;
      });
    }, 20000);
    return () => clearInterval(interval);
  }, [videoEntries]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(COUNTDOWN_TARGET));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (videoEntries.length === 0 || randomIdx === null) {
    return (
      <div style={{ color: "#fff", textAlign: "center" }}>
        Carregando vídeo...
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(videoEntries[randomIdx].id, randomStart);

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
        title="YouTube video player"
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
        {timeLeft.days} Dia(s), {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </div>
    </div>
  );
};

export default VideoPlayer;
