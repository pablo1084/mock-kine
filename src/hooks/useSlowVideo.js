import React from 'react';

export const HERO_VIDEO_SPEED = 0.70;

export function useSlowVideo(speed = HERO_VIDEO_SPEED) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.playbackRate = speed;
    }
  }, [speed]);

  return ref;
}
