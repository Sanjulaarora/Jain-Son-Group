
import { useState, useRef, useEffect } from "react";
import { PlayCircle, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate: (watchedPercentage: number, duration: number) => void;
  onVideoEnded: () => void;
  lastPosition?: number;
  onPlay?: () => void;
  onPause?: () => void;
}

export function VideoPlayer({
  videoUrl,
  onTimeUpdate,
  onVideoEnded,
  lastPosition = 0,
  onPlay,
  onPause
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchedSegments = useRef<boolean[]>([]);
  const lastWatchedPosition = useRef(0);

  // useEffect(() => {
  //   // Set initial position if available
  //   if (videoRef.current && lastPosition) {
  //     videoRef.current.currentTime = lastPosition;
  //   }
  // }, [lastPosition]);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      video.addEventListener("loadedmetadata", () => {
        if (lastPosition) {
          video.currentTime = lastPosition;
        }
      });
    }
  }, [lastPosition]);  

  // const handleTimeUpdate = () => {
  //   if (videoRef.current) {
  //     const currentTime = videoRef.current.currentTime;
  //     const duration = videoRef.current.duration;
  //     if (duration) {
  //       onTimeUpdate(currentTime, duration);
  //     }
  //   }
  // };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const currentTime = Math.floor(video.currentTime);
      const duration = Math.floor(video.duration);

      if (duration) {
        watchedSegments.current[currentTime] = true;
        lastWatchedPosition.current = currentTime;

        // Calculate actual watched percentage
        const watchedCount = watchedSegments.current.filter(Boolean).length;
        const watchedPercentage = (watchedCount / duration) * 100;

        onTimeUpdate(watchedPercentage, duration);
      }
    }
  };

  const handleSeeking = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const currentTime = Math.floor(video.currentTime);

      // Prevent skipping forward
      if (currentTime > lastWatchedPosition.current) {
        video.currentTime = lastWatchedPosition.current;
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        onPlay?.();
      }
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden bg-black">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full max-h-[450px]"
          controls
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => {
            setIsPlaying(true);
            onPlay?.();
          }}
          onPause={() => {
            setIsPlaying(false);
            onPause?.();
          }}
          onEnded={onVideoEnded}
          onSeeking={handleSeeking}
          autoPlay={false}
        />
      ) : (
        <div className="w-full h-80 flex items-center justify-center bg-muted">
          <p>Video not available</p>
        </div>
      )}
      <Button
        variant="outline"
        size="icon"
        className="absolute bottom-4 right-4 rounded-full bg-background/80 hover:bg-background"
        onClick={handlePlayPause}
      >
        {isPlaying ? (
          <PauseCircle className="h-6 w-6" />
        ) : (
          <PlayCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}