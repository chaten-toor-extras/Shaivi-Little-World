"use client";

import { useMusic } from "@/providers/ContentProvider";
import { useMusicStore } from "@/store/useMusicStore";
import { useEffect, useRef } from "react";

/**
 * GlobalAudioPlayer is a persistent headless controller mounted in Experience.
 * It manages the single HTMLAudioElement for the entire application, ensuring
 * that audio playback continues uninterrupted across 3D navigation and overlay modals.
 */
export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { songs } = useMusic();

  const playlist = useMusicStore((s) => s.playlist);
  const currentIndex = useMusicStore((s) => s.currentIndex);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const volume = useMusicStore((s) => s.volume);
  const seekTarget = useMusicStore((s) => s.seekTarget);
  const clearSeekTarget = useMusicStore((s) => s.clearSeekTarget);
  const nextTrack = useMusicStore((s) => s.nextTrack);
  const setTime = useMusicStore((s) => s.setTime);
  const setPlaybackStatus = useMusicStore((s) => s.setPlaybackStatus);
  const setIsPlaying = useMusicStore((s) => s.setIsPlaying);

  const currentTrack = playlist[currentIndex] || null;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Initialize playlist from CMS songs if not yet set
  useEffect(() => {
    if (playlist.length === 0 && songs && songs.length > 0) {
      useMusicStore.getState().setPlaylist(songs, 0);
    }
  }, [songs, playlist.length]);

  // Create persistent HTMLAudioElement once
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = Math.max(0, Math.min(volume / 100, 1));
    audioRef.current = audio;

    const handleLoadStart = () => {
      setPlaybackStatus({
        isLoading: true,
        isBuffering: false,
        hasError: false,
        errorMessage: null,
      });
    };

    const handleLoadedMetadata = () => {
      if (
        audio.duration &&
        !isNaN(audio.duration) &&
        isFinite(audio.duration)
      ) {
        setTime(audio.currentTime, Math.round(audio.duration));
      }
      setPlaybackStatus({ isLoading: false });
    };

    const handleCanPlay = () => {
      setPlaybackStatus({ isLoading: false, isBuffering: false });
    };

    const handleWaiting = () => {
      setPlaybackStatus({ isBuffering: true });
    };

    const handlePlaying = () => {
      setIsPlaying(true);
      setPlaybackStatus({ isBuffering: false, isLoading: false });
    };

    const handlePause = () => {
      // Audio paused
    };

    const handleTimeUpdate = () => {
      setTime(
        audio.currentTime,
        audio.duration && !isNaN(audio.duration)
          ? Math.round(audio.duration)
          : undefined,
      );
    };

    const handleEnded = () => {
      nextTrack();
    };

    const handleError = () => {
      setPlaybackStatus({ isLoading: false, isBuffering: false });
      if (audio.src && audio.src !== window.location.href) {
        setIsPlaying(false);
        setPlaybackStatus({
          hasError: true,
          errorMessage: "Audio playback unavailable or file failed to load.",
        });
      }
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle source changes when current track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const audioUrl = currentTrack?.audio?.url;
    setTime(0, currentTrack?.duration || 180);
    setPlaybackStatus({ hasError: false, errorMessage: null });

    if (audioUrl) {
      if (audio.src !== audioUrl) {
        audio.src = audioUrl;
        audio.load();
      }
      if (isPlayingRef.current) {
        audio.play().catch((err: unknown) => {
          if (err instanceof Error && err.name !== "AbortError") {
            setIsPlaying(false);
            setPlaybackStatus({
              hasError: true,
              errorMessage: "Playback blocked by browser policy or file error.",
            });
          }
        });
      }
    } else {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, [currentTrack?._id, currentTrack?.audio?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle play / pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const audioUrl = currentTrack?.audio?.url;
    if (isPlaying) {
      if (audioUrl) {
        if (audio.src !== audioUrl) {
          audio.src = audioUrl;
          audio.load();
        }
        audio.play().catch((err: unknown) => {
          if (err instanceof Error && err.name !== "AbortError") {
            setIsPlaying(false);
            setPlaybackStatus({
              hasError: true,
              errorMessage: "Audio playback was blocked or failed to start.",
            });
          }
        });
      }
    } else {
      if (audio.src) {
        audio.pause();
      }
    }
  }, [isPlaying, currentTrack?.audio?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simulated playback ticker for demo / preview tracks without audio URLs
  useEffect(() => {
    if (!isPlaying || currentTrack?.audio?.url) return;

    const interval = setInterval(() => {
      const state = useMusicStore.getState();
      const trackDur = currentTrack?.duration || 180;
      if (state.currentTime >= trackDur) {
        nextTrack();
      } else {
        setTime(state.currentTime + 1, trackDur);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    currentTrack?.audio?.url,
    currentTrack?.duration,
    nextTrack,
    setTime,
  ]);

  // Volume synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(volume / 100, 1));
    }
  }, [volume]);

  // Seek synchronization
  useEffect(() => {
    if (seekTarget === null) return;
    const audio = audioRef.current;
    if (audio && audio.src && !isNaN(audio.duration) && audio.duration > 0) {
      audio.currentTime = Math.max(0, Math.min(seekTarget, audio.duration));
    }
    clearSeekTarget();
  }, [seekTarget, clearSeekTarget]);

  return null;
}
