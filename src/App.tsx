import { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import "./App.css";

function App() {
  // Example YouTube URL and overlay text
  const youtubeUrl =
    "https://www.youtube.com/playlist?list=PL771bZwgPJ_zCcfiTVgQOJd-uDZdt992R";
  const overlayText = "Welcome to Switch2Hype!";

  return <VideoPlayer youtubeUrl={youtubeUrl} overlayText={overlayText} />;
}

export default App;
