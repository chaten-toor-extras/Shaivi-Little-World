"use client";

import type { Song } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export interface MusicPlayerState {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 100
  isLoading: boolean;
  isBuffering: boolean;
  hasError: boolean;
  errorMessage: string | null;
  currentTrack: Song | null;
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  seek: (seconds: number) => void;
  setVolume: (volumePercent: number) => void;
}

export function useMusicPlayer(
  playlist: Song[],
  currentIndex: number,
  onTrackEnded?: () => void,
): MusicPlayerState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onTrackEndedRef = useRef(onTrackEnded);
  onTrackEndedRef.current = onTrackEnded;

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentTrack = playlist[currentIndex] || null;

  // Track playing state in a ref for callbacks and asynchronous handlers
  const playingRef = useRef(playing);
  playingRef.current = playing;

  // Initialize audio element and attach permanent listeners once
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = volume / 100;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (
        audio.duration &&
        !isNaN(audio.duration) &&
        isFinite(audio.duration)
      ) {
        setDuration(Math.round(audio.duration));
      }
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsBuffering(false);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setPlaying(true);
      setIsBuffering(false);
      setIsLoading(false);
    };

    const handlePause = () => {
      setPlaying(false);
    };

    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
      if (onTrackEndedRef.current) {
        onTrackEndedRef.current();
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setIsBuffering(false);
      // Only record error if an actual source was attempted
      if (audio.src) {
        setPlaying(false);
        setHasError(true);
        setErrorMessage("Could not load audio track. Playback unavailable.");
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronize volume smoothly whenever state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(volume / 100, 1));
    }
  }, [volume]);

  // Handle source changes when currentTrack changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const audioUrl = currentTrack?.audio?.url;
    setCurrentTime(0);
    setDuration(currentTrack?.duration || 0);
    setHasError(false);
    setErrorMessage(null);

    if (audioUrl) {
      if (audio.src !== audioUrl) {
        audio.src = audioUrl;
        audio.load();
      }
      if (playingRef.current) {
        audio.play().catch((err: unknown) => {
          if (err instanceof Error && err.name !== "AbortError") {
            setPlaying(false);
          }
        });
      }
    } else {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, [currentTrack?._id, currentTrack?.audio?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simulated playback ticker for preview tracks without audio URLs
  useEffect(() => {
    if (!playing || currentTrack?.audio?.url) return;

    const interval = setInterval(() => {
      setCurrentTime((t) => {
        const trackDur = currentTrack?.duration || 180;
        if (t >= trackDur) {
          if (onTrackEndedRef.current) {
            onTrackEndedRef.current();
          }
          return 0;
        }
        return t + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playing, currentTrack?.audio?.url, currentTrack?.duration]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const audioUrl = currentTrack?.audio?.url;
    if (!audioUrl) {
      // Preview mode / simulated playback
      setPlaying(true);
      return;
    }

    try {
      if (audio.src !== audioUrl) {
        audio.src = audioUrl;
        audio.load();
      }
      setIsLoading(true);
      setHasError(false);
      setErrorMessage(null);
      await audio.play();
      setPlaying(true);
      setIsLoading(false);
    } catch (err: unknown) {
      setPlaying(false);
      setIsLoading(false);
      if (err instanceof Error && err.name !== "AbortError") {
        setHasError(true);
        setErrorMessage("Audio playback was blocked or failed to load.");
      }
    }
  }, [currentTrack?.audio?.url]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setPlaying(false);
  }, []);

  const togglePlay = useCallback(async () => {
    if (playing) {
      pause();
    } else {
      await play();
    }
  }, [playing, pause, play]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (audio && audio.src && !isNaN(audio.duration) && audio.duration > 0) {
      audio.currentTime = Math.max(0, Math.min(seconds, audio.duration));
      setCurrentTime(audio.currentTime);
    } else {
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((volumePercent: number) => {
    const clamped = Math.max(0, Math.min(volumePercent, 100));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped / 100;
    }
  }, []);

  return {
    playing,
    currentTime,
    duration: duration || currentTrack?.duration || 0,
    volume,
    isLoading,
    isBuffering,
    hasError,
    errorMessage,
    currentTrack,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
  };
}
