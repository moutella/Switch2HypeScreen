import { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import "./App.css";

function App() {
  // Example YouTube URL and overlay text

  return (
    <VideoPlayer videoListUrl="https://raw.githubusercontent.com/moutella/Switch2HypeScreen/refs/heads/main/videolist.txt" />
  );
}

export default App;
