import { memo, useState } from 'react';
import { festival } from '../content';
import { useMutedFloatingVideo } from '../hooks';
import { backgroundImage } from './LazyBackground';

export const FloatingVideo = memo(function FloatingVideo() {
  const { isPlaying, play, videoRef } = useMutedFloatingVideo();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className={`floating-video ${isPlaying ? 'is-playing' : ''}`}>
      <button className="floating-video-close" type="button" aria-label="Закрыть видео" onClick={() => setIsDismissed(true)}>×</button>
      <button className="floating-video-button" type="button" aria-label="Как это было в 2025 году" onClick={() => play(festival.assets.video)}>
        <span className="floating-video-preview" style={{ backgroundImage: backgroundImage('/media/photo/DSC03020_resized (2).jpg', 640) }}>
          <video ref={videoRef} muted playsInline preload="none" />
          <i>▶</i>
        </span>
        <strong>
          Как это было
          <br />в 2025 году
        </strong>
      </button>
    </div>
  );
});
