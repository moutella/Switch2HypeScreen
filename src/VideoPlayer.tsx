import React, { useEffect, useState, useRef } from "react";

type VideoPlayerProps = {
  videoListUrl: string;
};

type VideoEntry = {
  filename: string;
  duration: number; // in seconds
};

function parseDuration(durationStr: string): number {
  const parts = durationStr.split(":").map(Number).reverse();
  let seconds = 0;
  if (parts[0]) seconds += parts[0];
  if (parts[1]) seconds += parts[1] * 60;
  if (parts[2]) seconds += parts[2] * 3600;
  return seconds;
}

function getTimeRemaining(targetDate: Date) {
  const now = new Date();
  const nowInBrasilia = now;
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

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoListUrl }) => {
  const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([]);
  const [randomIdx, setRandomIdx] = useState<number | null>(null);
  const [randomStart, setRandomStart] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(COUNTDOWN_TARGET));
  const [wipe, setWipe] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch video list once
  useEffect(() => {
    fetch(videoListUrl)
      .then((res) => res.text())
      .then((text) => {
        const entries: VideoEntry[] = text
          .split("\n")
          .map((line) => {
            const [filename, durationStr] = line.trim().split(",");
            if (!filename) return null;
            const duration = durationStr ? parseDuration(durationStr) : 0;
            return { filename: filename.trim(), duration };
          })
          .filter((entry): entry is VideoEntry => !!entry && !!entry.filename);
        setVideoEntries(entries);
        if (entries.length > 0) {
          const idx = Math.floor(Math.random() * entries.length);
          setRandomIdx(idx);
          const dur = entries[idx].duration;
          setRandomStart(Math.floor(Math.random() * (dur - 8)));
        }
      });
  }, [videoListUrl]);

  // Change video after its duration (if < 5min, no random start; if >= 5min, random start)
  useEffect(() => {
    if (videoEntries.length === 0 || randomIdx === null) return;
    const current = videoEntries[randomIdx];
    let timeoutId: ReturnType<typeof setTimeout>;

    let waitTime =
      current.duration < 300
        ? current.duration
        : current.duration - randomStart;
    waitTime = 2;

    let wipeDuration = 200;

    timeoutId = setTimeout(() => {
      setWipe(true); // Start wipe effect
      setTimeout(() => {
        setRandomIdx((prevIdx) => {
          if (videoEntries.length === 1) return 0;
          let nextIdx;
          do {
            nextIdx = Math.floor(Math.random() * videoEntries.length);
          } while (nextIdx === prevIdx);
          const dur = videoEntries[nextIdx].duration;
          setRandomStart(dur >= 300 ? Math.floor(Math.random() * dur) : 0);
          return nextIdx;
        });
        setTimeout(() => setWipe(false), wipeDuration); // End wipe after animation
      }, wipeDuration); // Duration of wipe animation in ms
    }, waitTime * 1000);

    return () => clearTimeout(timeoutId);
  }, [videoEntries, randomIdx, randomStart]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(COUNTDOWN_TARGET));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Seek to random start when video changes
  useEffect(() => {
    if (
      videoRef.current &&
      randomIdx !== null &&
      videoEntries[randomIdx] &&
      randomStart > 0
    ) {
      videoRef.current.currentTime = randomStart;
      videoRef.current.play();
    }
  }, [randomIdx, randomStart, videoEntries]);

  if (videoEntries.length === 0 || randomIdx === null) {
    return (
      <div style={{ color: "#fff", textAlign: "center" }}>
        Carregando vídeo...
      </div>
    );
  }

  const currentVideo = videoEntries[randomIdx];

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#000",
      }}
    >
      <video
        ref={videoRef}
        src={`/Switch2HypeScreen/videos/${currentVideo.filename}`}
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          display: "block",
        }}
        autoPlay
        muted
        controls={false}
      />
      {/* Screen wipe effect */}
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: wipe
            ? `url("/Switch2HypeScreen/background.jpg") center center / cover no-repeat #000`
            : `url("/Switch2HypeScreen/background.jpg") center center / cover no-repeat #000`,
          zIndex: 10,
          transition:
            "transform 0.3s cubic-bezier(.77,0,.18,1), background .3s",
          transform: wipe ? "translateX(0)" : "translateX(-100vw)",
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
          fontSize: "8rem",
          fontWeight: "bold",
          letterSpacing: "1px",
          pointerEvents: "none",
          textShadow: "2px 2px 8px #000, 0px 0px 4px #000",
          zIndex: 20,
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
