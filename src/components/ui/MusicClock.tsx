"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { songs, moods } from "@/data/songs";
import Photo from "./Photo";
const time = (n: number) =>
  `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
export default function MusicClock() {
  const [mood, setMood] = useState(0),
    [position, setPosition] = useState(0),
    [playing, setPlaying] = useState(false),
    [progress, setProgress] = useState(0),
    [volume, setVolume] = useState(35);
  const palette = moods[mood],
    track = songs[palette.order[position]];
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (progress + 1 >= track.duration) {
        setPlaying(false);
        setProgress(0);
      } else setProgress(progress + 1);
    }, 1000);
    const hidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      clearTimeout(t);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [playing, progress, track.duration]);
  const next = (n: number) => {
    setPosition((position + n + songs.length) % songs.length);
    setProgress(0);
  };
  return (
    <div
      className="music-clock"
      style={
        {
          "--mood-paper": palette.color,
          "--mood-ink": palette.ink,
        } as CSSProperties
      }
    >
      <div className="music-intro">
        <p className="section-kicker">NO HURRY. YOU HAVE TIME.</p>
        <h2>
          A mood for
          <br />
          <i>this moment.</i>
        </h2>
        <div className={`clock-record ${playing ? "is-playing" : ""}`}>
          <Photo image={track.cover} />
          <div className="record-rings" />
          <div className="record-label">
            <span>little world</span>
            <i>{track.title}</i>
            <b>●</b>
          </div>
          <div className="clock-hand" />
        </div>
        <p className="music-margin-note">
          a little soundtrack
          <br />
          for your daydreams.
        </p>
      </div>
      <div className="mood-player">
        <div className="mood-chips" aria-label="Choose a mood">
          {moods.map((m, i) => (
            <button
              key={m.name}
              aria-pressed={i === mood}
              onClick={() => {
                setMood(i);
                setPosition(0);
                setProgress(0);
              }}
            >
              {m.name}
            </button>
          ))}
        </div>
        <div key={track.id} className="now-playing">
          <p className="section-kicker">NOW IN YOUR ORBIT</p>
          <h3>{track.title}</h3>
          <p>{track.artist} / An imaginary recording</p>
        </div>
        <div className="player-buttons">
          <button onClick={() => next(-1)} aria-label="Previous track">
            ↤
          </button>
          <button
            className="play-circle"
            aria-label={playing ? "Pause demo" : "Play demo"}
            aria-pressed={playing}
            onClick={() => setPlaying(!playing)}
          >
            {playing ? "Ⅱ" : "▶"}
          </button>
          <button onClick={() => next(1)} aria-label="Next track">
            ↦
          </button>
        </div>
        <input
          className="music-progress"
          type="range"
          min={0}
          max={track.duration}
          value={progress}
          aria-label="Track progress"
          onChange={(e) => setProgress(Number(e.target.value))}
        />
        <div className="music-time">
          <span>{time(progress)}</span>
          <span>{time(track.duration)}</span>
        </div>
        <label className="volume-control">
          Demo volume{" "}
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            aria-label="Demo volume (visual only)"
            onChange={(e) => setVolume(Number(e.target.value))}
          />
          <span>{volume}%</span>
        </label>
        <div className="mood-tracklist">
          {palette.order.map((n, i) => (
            <button
              key={songs[n].id}
              aria-pressed={i === position}
              onClick={() => {
                setPosition(i);
                setProgress(0);
              }}
            >
              <small>{i === position && playing ? "♫" : `0${i + 1}`}</small>
              <span>{songs[n].title}</span>
              <small>{time(songs[n].duration)}</small>
            </button>
          ))}
        </div>
        <p className="demo-note">
          Visual-only player. Demo tracks and volume; no music is streamed.
        </p>
      </div>
    </div>
  );
}
