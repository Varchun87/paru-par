import { memo } from 'react';
import { festival } from '../content';
import { useMutedFloatingVideo } from '../hooks';
import { backgroundImage } from './LazyBackground';

export const FloatingVideo = memo(function FloatingVideo() {
  const { isPlaying, play, videoRef } = useMutedFloatingVideo();

  return (
    <button className={`floating-video ${isPlaying ? 'is-playing' : ''}`} type="button" aria-label="Как это было в 2025 году" onClick={() => play(festival.assets.video)}>
      <span className="floating-video-preview" style={{ backgroundImage: backgroundImage('/media/photo/DSC03020_resized (2).jpg', 640) }}>
        <video ref={videoRef} muted playsInline preload="none" />
        <i>▶</i>
      </span>
      <strong>
        Как это было
        <br />в 2025 году
      </strong>
    </button>
  );
});
