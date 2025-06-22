"use client";

import * as React from "react";
import {
  PauseIcon,
  Volume1,
  Volume2,
  VolumeOff,
  Play,
  StepBack,
  StepForward,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

type AudioPlayerContextType = {
  playbackSpeed: number;
  setPlaybackSpeed: React.Dispatch<React.SetStateAction<number>>;
  timeProgress: number;
  setTimeProgress: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  progressBarRef: React.RefObject<HTMLInputElement | null>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
};

const AudioPlayerContext = React.createContext<AudioPlayerContextType | null>(
  null
);

export const useAudioPlayerContext = (): AudioPlayerContextType => {
  const context = React.useContext(AudioPlayerContext);

  if (context === null) {
    throw new Error(
      "useAudioPlayerContext must be used within an AudioPlayerProvider"
    );
  }

  return context;
};

export const AudioPlayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [playbackSpeed, setPlaybackSpeed] = React.useState<number>(1);
  const [timeProgress, setTimeProgress] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);

  const audioRef = React.useRef<HTMLAudioElement>(
    null
  ) as React.RefObject<HTMLAudioElement>;
  const progressBarRef = React.useRef<HTMLInputElement>(
    null
  ) as React.RefObject<HTMLInputElement>;

  const contextValue = {
    audioRef,
    progressBarRef,
    timeProgress,
    setTimeProgress,
    duration,
    setDuration,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      <div className="flex font-semibold text-white">
        {formatTime(audioRef.current?.duration, "mm")}
      </div>
      {children}
    </AudioPlayerContext.Provider>
  );
};

const AudioPlayerProgressBar = () => {
  const { progressBarRef, audioRef, timeProgress, duration, setTimeProgress } =
    useAudioPlayerContext();

  return (
    <div className="flex w-full items-center justify-center gap-5">
      <span className="sr-only">{formatTime(timeProgress)}</span>
      <input
        ref={progressBarRef}
        type="range"
        min={0}
        step={1}
        max={duration || undefined}
        value={timeProgress}
        onChange={(e) => {
          if (audioRef.current) {
            const newTime = Number(e.target.value);
            audioRef.current.currentTime = newTime;
            setTimeProgress(Math.floor(newTime));
          }
        }}
        className="w-full cursor-pointer appearance-none overflow-hidden outline-none [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-slate-500 [&::-webkit-slider-thumb]:size-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[-1607px_0_0_1600px_#fff]"
      />
      <span className="sr-only">{formatTime(duration)}</span>
    </div>
  );
};

type AudioPlayerControls = {
  src: string;
};

const AudioPlayerControls = ({ src }: AudioPlayerControls) => {
  const {
    audioRef,
    setDuration,
    duration,
    setTimeProgress,
    progressBarRef,
    isPlaying,
    setIsPlaying,
  } = useAudioPlayerContext();

  const playAnimationRef = React.useRef<number | null>(null);

  const updateProgress = React.useCallback(() => {
    if (audioRef.current && progressBarRef.current && duration) {
      const currentTime = audioRef.current.currentTime;
      setTimeProgress(Math.floor(currentTime));

      progressBarRef.current.value = currentTime.toString();
      progressBarRef.current.style.setProperty(
        "--range-progress",
        `${(currentTime / duration) * 100}%`
      );
    }
  }, [duration, setTimeProgress, audioRef, progressBarRef]);

  const startAnimation = React.useCallback(() => {
    if (audioRef.current && progressBarRef.current && duration) {
      const animate = () => {
        updateProgress();
        playAnimationRef.current = requestAnimationFrame(animate);
      };
      playAnimationRef.current = requestAnimationFrame(animate);
    }
  }, [updateProgress, duration, audioRef, progressBarRef]);

  React.useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
      startAnimation();
    } else {
      audioRef.current?.pause();
      if (playAnimationRef.current !== null) {
        cancelAnimationFrame(playAnimationRef.current);
        playAnimationRef.current = null;
      }
      updateProgress(); // Ensure progress is updated immediately when paused
    }

    return () => {
      if (playAnimationRef.current !== null) {
        cancelAnimationFrame(playAnimationRef.current);
      }
    };
  }, [isPlaying, startAnimation, updateProgress, audioRef]);

  React.useEffect(() => {
    const seconds = audioRef.current?.duration;
    if (seconds !== undefined) {
      setDuration(seconds);
      if (progressBarRef.current) {
        progressBarRef.current.max = seconds.toString();
      }
    }
  }, [audioRef, progressBarRef, setDuration]);

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 15;
      updateProgress();
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 15;
      updateProgress();
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} />
      <div className="flex items-center gap-5">
        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-label={isPlaying ? "Pause" : "Play"}
          tabIndex={-1}
        >
          {isPlaying ? (
            <div className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-tr from-yellow-500 from-0% to-yellow-400 to-100% shadow-sm shadow-yellow-300/50 transition-all delay-150 duration-150 hover:shadow-3xl hover:shadow-yellow-600/20">
              <PauseIcon size={30} className="fill-white stroke-white p-1" />
            </div>
          ) : (
            <div className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-tr from-yellow-500 from-0% to-yellow-400 to-100% shadow-sm shadow-yellow-300/50 transition-all delay-150 duration-150 hover:shadow-3xl hover:shadow-yellow-600/20">
              <Play className="ml-1 p-1" />
            </div>
          )}
        </button>
        <button
          onClick={skipBackward}
          className="flex items-center justify-center"
          aria-label={"Reverse"}
        >
          <StepBack className="h-2 w-6 stroke-white" />
        </button>
        <button
          onClick={skipForward}
          className="flex items-center justify-center"
          aria-label={"Forward"}
        >
          <StepForward className="h-2 w-6 -scale-90 stroke-white" />
        </button>
      </div>
    </>
  );
};

const AudioPlayerVolumeControl = () => {
  const [volume, setVolume] = React.useState<number>(60);
  const [muteVolume, setMuteVolume] = React.useState(false);
  const { audioRef } = useAudioPlayerContext();

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = muteVolume;
    }
  }, [volume, audioRef, muteVolume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <div>
      <div className="flex items-center gap-5">
        <button
          onClick={() => setMuteVolume((prev) => !prev)}
          aria-label={muteVolume ? "Mute" : "Unmute"}
        >
          {muteVolume || volume < 5 ? (
            <VolumeOff size={25} className="stroke-white" />
          ) : volume < 40 ? (
            <Volume1 size={25} className="stroke-white" />
          ) : (
            <Volume2 size={25} className="stroke-white" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={handleVolumeChange}
          className="cursor-pointer [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-darkGray-50 [&::-webkit-slider-thumb]:-mt-1.5"
          style={{
            background: `linear-gradient(to right, #f50 ${volume}%, #ccc ${volume}%)`,
          }}
        />
      </div>
    </div>
  );
};

const AudioPlayerSpeedControl = () => {
  const { audioRef, playbackSpeed, setPlaybackSpeed } = useAudioPlayerContext();

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [audioRef, playbackSpeed]);

  return (
    <>
      <button
        type="button"
        onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
        className="flex h-11 w-10 items-center justify-center rounded-md border-2 px-2 py-3 font-body text-md font-semibold text-white md:rounded-lg xl:rounded-[10px]"
        aria-label={"Playback speed"}
      >
        {playbackSpeed > 1 ? "2x" : "1x"}
      </button>
    </>
  );
};

type AudioPlayerProps = {
  src: string;
  title: string;
  volumeControl?: boolean;
  speedControl?: boolean;
};

const AudioPlayer = ({
  src,
  volumeControl,
  speedControl,
}: AudioPlayerProps) => {
  return (
    <AudioPlayerProvider>
      <div className="flex w-full items-center gap-5">
        <AudioPlayerControls src={src} />
        <AudioPlayerProgressBar />
        {volumeControl && <AudioPlayerVolumeControl />}
        {speedControl && <AudioPlayerSpeedControl />}
      </div>
    </AudioPlayerProvider>
  );
};

export default AudioPlayer;
