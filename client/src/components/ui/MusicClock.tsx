"use client";

import { useMusic } from "@/providers/ContentProvider";
import { safeEmitSecretEvent } from "@/services/secretEventBus";
import { useMusicStore } from "@/store/useMusicStore";
import { useEffect, useState, type CSSProperties } from "react";
import Photo from "./Photo";

const formatTime = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function MusicClock() {
  const { songs, moods } = useMusic();
  const [selectedMoodIndex, setSelectedMoodIndex] = useState(0);

  const activeMoodId = useMusicStore((s) => s.activeMoodId);
  const worldMoodActivated = useMusicStore((s) => s.worldMoodActivated);
  const worldMoodEffectsEnabled = useMusicStore(
    (s) => s.worldMoodEffectsEnabled,
  );
  const selectMoodInStore = useMusicStore((s) => s.selectMood);
  const setWorldMoodActivated = useMusicStore((s) => s.setWorldMoodActivated);
  const setWorldMoodEffectsEnabled = useMusicStore(
    (s) => s.setWorldMoodEffectsEnabled,
  );
  const resetWorldMood = useMusicStore((s) => s.resetWorldMood);

  const isPlaying = useMusicStore((s) => s.isPlaying);
  const currentTime = useMusicStore((s) => s.currentTime);
  const duration = useMusicStore((s) => s.duration);
  const volume = useMusicStore((s) => s.volume);
  const isLoading = useMusicStore((s) => s.isLoading);
  const isBuffering = useMusicStore((s) => s.isBuffering);
  const hasError = useMusicStore((s) => s.hasError);
  const errorMessage = useMusicStore((s) => s.errorMessage);
  const playlist = useMusicStore((s) => s.playlist);
  const currentIndex = useMusicStore((s) => s.currentIndex);

  const play = useMusicStore((s) => s.play);
  const togglePlay = useMusicStore((s) => s.togglePlay);
  const seek = useMusicStore((s) => s.seek);
  const setVolume = useMusicStore((s) => s.setVolume);
  const nextTrack = useMusicStore((s) => s.nextTrack);
  const prevTrack = useMusicStore((s) => s.prevTrack);
  const setPlaylistInStore = useMusicStore((s) => s.setPlaylist);
  const setCurrentIndexInStore = useMusicStore((s) => s.setCurrentIndex);

  // Sync initial mood from store if set
  useEffect(() => {
    if (activeMoodId) {
      const idx = moods.findIndex(
        (m) => String(m._id) === String(activeMoodId),
      );
      if (idx !== -1 && idx !== selectedMoodIndex) {
        setSelectedMoodIndex(idx);
      }
    }
  }, [activeMoodId, moods]);

  // Current mood palette
  const activeMood = moods[selectedMoodIndex] ||
    moods[0] || {
      name: "Calm",
      paperColor: "#d7ddc5",
      inkColor: "#354537",
      songIds: [],
    };

  // Helper to resolve a mood's songs
  const getMoodPlaylist = (mood: typeof activeMood) => {
    const resolved = mood.songIds?.length
      ? mood.songIds
          .map((id) =>
            songs.find(
              (s) =>
                String(s._id) === String(id) ||
                String((s as any).id) === String(id),
            ),
          )
          .filter((s): s is (typeof songs)[0] => Boolean(s))
      : [];
    return resolved.length > 0 ? resolved : songs;
  };

  // Ensure playlist is initialized in store
  useEffect(() => {
    if (playlist.length === 0 && songs.length > 0) {
      const initial = getMoodPlaylist(activeMood);
      setPlaylistInStore(initial, 0);
    }
  }, [songs, playlist.length]);

  const handleSelectMood = (index: number) => {
    setSelectedMoodIndex(index);
    const m = moods[index];
    if (m) {
      if (m._id) {
        selectMoodInStore(String(m._id));
      }
      const newPlaylist = getMoodPlaylist(m);
      setPlaylistInStore(newPlaylist, 0);

      // Fire user-initiated mood selection event
      safeEmitSecretEvent({
        type: "MOOD_SELECTED",
        targetType: "CLOCK",
        metadata: { moodId: String(m._id || m.slug || index) },
      });
    }
  };

  const currentTrack = playlist[currentIndex] || songs[0];

  return (
    <div
      className="music-clock"
      style={
        {
          "--mood-paper": activeMood.paperColor || "#d7ddc5",
          "--mood-ink": activeMood.inkColor || "#354537",
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
        <div className={`clock-record ${isPlaying ? "is-playing" : ""}`}>
          {currentTrack?.cover && <Photo image={currentTrack.cover} />}
          <div className="record-rings" />
          <div className="record-label">
            <span>little world</span>
            <i>{currentTrack?.title || "Music"}</i>
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
              key={m._id || m.name || i}
              aria-pressed={i === selectedMoodIndex}
              onClick={() => handleSelectMood(i)}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="music-atmosphere-bar">
          <label className="music-atmosphere-toggle">
            <input
              type="checkbox"
              checked={worldMoodEffectsEnabled && worldMoodActivated}
              onChange={(e) => {
                const checked = e.target.checked;
                setWorldMoodEffectsEnabled(checked);
                if (checked) {
                  setWorldMoodActivated(true);
                  if (activeMood?._id) {
                    selectMoodInStore(String(activeMood._id));
                  }
                }
              }}
            />
            <span>Color Island with {activeMood.name} atmosphere</span>
          </label>
          {worldMoodActivated && worldMoodEffectsEnabled && (
            <button
              type="button"
              className="music-atmosphere-reset"
              onClick={() => resetWorldMood()}
              title="Return world to pure time-of-day without stopping music"
            >
              Reset Island
            </button>
          )}
        </div>

        {currentTrack && (
          <div
            key={currentTrack._id || (currentTrack as any).id}
            className="now-playing"
          >
            <p className="section-kicker">
              {isLoading
                ? "LOADING TRACK..."
                : isBuffering
                  ? "BUFFERING..."
                  : "NOW IN YOUR ORBIT"}
            </p>
            <h3>{currentTrack.title}</h3>
            <p>{currentTrack.artist || "Shaivi"}</p>
          </div>
        )}

        {hasError && errorMessage && (
          <div
            style={{
              background: "rgba(180, 80, 80, 0.15)",
              border: "1px solid rgba(180, 80, 80, 0.3)",
              borderRadius: "4px",
              padding: "6px 10px",
              fontSize: "0.8rem",
              color: "#8a2b2b",
              textAlign: "center",
            }}
          >
            {errorMessage}
          </div>
        )}

        <div className="player-buttons">
          <button onClick={prevTrack} aria-label="Previous track">
            ↤
          </button>
          <button
            className="play-circle"
            aria-label={isPlaying ? "Pause" : "Play"}
            aria-pressed={isPlaying}
            onClick={() => void togglePlay()}
          >
            {isPlaying ? "Ⅱ" : "▶"}
          </button>
          <button onClick={nextTrack} aria-label="Next track">
            ↦
          </button>
        </div>

        <input
          className="music-progress"
          type="range"
          min={0}
          max={duration || currentTrack?.duration || 100}
          value={currentTime}
          aria-label="Track progress"
          onChange={(e) => seek(Number(e.target.value))}
        />

        <div className="music-time">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || currentTrack?.duration || 0)}</span>
        </div>

        <label className="volume-control">
          Volume{" "}
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            aria-label="Master volume"
            onChange={(e) => setVolume(Number(e.target.value))}
          />
          <span>{volume}%</span>
        </label>

        <div className="mood-tracklist">
          {playlist.map((track, i) => (
            <button
              key={track._id || (track as any).id || i}
              aria-pressed={i === currentIndex}
              onClick={() => {
                if (i === currentIndex) {
                  void togglePlay();
                } else {
                  setCurrentIndexInStore(i);
                  play();
                }
              }}
            >
              <small>
                {i === currentIndex && isPlaying ? "♫" : `0${i + 1}`}
              </small>
              <span>{track.title}</span>
              <small>{formatTime(track.duration)}</small>
            </button>
          ))}
        </div>

        <p className="demo-note">
          {currentTrack?.audio?.url
            ? "Live audio playback enabled."
            : "Preview mode. Upload an MP3/AAC audio file in Admin to hear real tracks."}
        </p>
      </div>
    </div>
  );
}
