
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { VideoMetadata } from '../types';
import { PlayIcon, PauseIcon, VolumeUpIcon, VolumeOffIcon, FullscreenIcon, ExitFullscreenIcon, CogIcon } from './icons/Icons';

interface VideoPlayerProps {
  file: File;
  onMetadataLoad: (metadata: Partial<VideoMetadata>) => void;
  onError: (error: string) => void;
}

const formatTime = (timeInSeconds: number) => {
  const flooredTime = Math.floor(timeInSeconds);
  const minutes = Math.floor(flooredTime / 60);
  const seconds = flooredTime % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ file, onMetadataLoad, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const videoSrc = URL.createObjectURL(file);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      onMetadataLoad({
        duration: video.duration,
        resolution: `${video.videoWidth}x${video.videoHeight}`,
      });
    };
    
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleErrorEvent = () => onError("Unsupported format or corrupted file.");
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleErrorEvent);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleErrorEvent);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      URL.revokeObjectURL(videoSrc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, onError, onMetadataLoad]);

  const togglePlayPause = useCallback(() => {
    if (videoRef.current?.paused) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if(videoRef.current) videoRef.current.volume = newVolume;
    if (newVolume > 0) setIsMuted(false);
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted && video.volume === 0) {
      video.volume = 1;
      setVolume(1);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };
  
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const changePlaybackRate = (rate: number) => {
    if(videoRef.current) videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setIsSettingsOpen(false);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const activeEl = document.activeElement;
        if (activeEl && ['INPUT', 'BUTTON'].includes(activeEl.tagName)) return;

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowUp':
                e.preventDefault();
                if(videoRef.current) {
                    const newVolume = Math.min(videoRef.current.volume + 0.1, 1);
                    videoRef.current.volume = newVolume;
                    setVolume(newVolume);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if(videoRef.current) {
                    const newVolume = Math.max(videoRef.current.volume - 0.1, 0);
                    videoRef.current.volume = newVolume;
                    setVolume(newVolume);
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if(videoRef.current) videoRef.current.currentTime -= 5;
                break;
            case 'ArrowRight':
                e.preventDefault();
                if(videoRef.current) videoRef.current.currentTime += 5;
                break;
            case 'KeyF':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'KeyM':
                e.preventDefault();
                toggleMute();
                break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, toggleMute]);

  const hideControls = () => {
    if (videoRef.current?.paused) return;
    setAreControlsVisible(false);
  }

  const handleMouseMove = () => {
    setAreControlsVisible(true);
    if(controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(hideControls, 3000);
  }
  
  return (
    <div
      ref={playerContainerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group video-player-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={hideControls}
      onClick={togglePlayPause}
    >
      <video ref={videoRef} src={videoSrc} className="w-full h-full" autoPlay/>

      <div 
        className={`absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 ${areControlsVisible ? 'bg-opacity-40' : ''}`}
        onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) togglePlayPause() }}
      >
        <div 
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-transform duration-300 ${areControlsVisible ? 'translate-y-0' : 'translate-y-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
            {/* Progress Bar */}
            <div ref={progressRef} onClick={handleSeek} className="w-full h-2 bg-white/20 rounded-full cursor-pointer group/progress mb-2">
                <div className="h-full bg-indigo-500 rounded-full group-hover/progress:h-3 transition-all" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            </div>

            <div className="flex items-center justify-between text-white">
                {/* Left Controls */}
                <div className="flex items-center gap-4">
                    <button onClick={togglePlayPause} className="hover:scale-110 transition-transform">
                        {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7" />}
                    </button>
                    <div className="flex items-center group/volume gap-2">
                        <button onClick={toggleMute}>
                            {isMuted || volume === 0 ? <VolumeOffIcon className="w-6 h-6"/> : <VolumeUpIcon className="w-6 h-6"/>}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-0 group-hover/volume:w-24 h-1 accent-indigo-500 transition-all duration-300"
                        />
                    </div>
                     <div className="text-sm font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-4 relative">
                    <button onClick={() => setIsSettingsOpen(o => !o)} className="hover:scale-110 transition-transform">
                        <CogIcon className="w-6 h-6"/>
                    </button>
                    {isSettingsOpen && (
                        <div className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg p-2 flex flex-col items-center gap-1">
                            <span className="text-xs mb-1">Speed</span>
                            {[0.5, 1, 1.5, 2].map(rate => (
                                <button key={rate} onClick={() => changePlaybackRate(rate)} className={`px-2 py-1 text-sm rounded ${playbackRate === rate ? 'bg-indigo-500' : ''}`}>
                                    {rate}x
                                </button>
                            ))}
                        </div>
                    )}
                    <button onClick={toggleFullscreen} className="hover:scale-110 transition-transform">
                        <FullscreenIcon className="w-6 h-6 fullscreen-icon" />
                        <ExitFullscreenIcon className="w-6 h-6 exit-fullscreen-icon" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
