import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  frameId?: number;
  onClick?: () => void;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  className = '',
  frameId,
  onClick,
  referrerPolicy = 'no-referrer',
}) => {
  const hasFrame = frameId !== undefined && frameId >= 1 && frameId <= 40;

  // Configuration for the spritesheet
  // Configuration: 5 columns and 8 rows for 40 frames total.
  // Each frame must be equally sized.
  const COLUMNS = 5;
  const ROWS = 8;

  let bgX = 0;
  let bgY = 0;

  if (hasFrame) {
    const index = frameId - 1;
    const col = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);

    // Calculate background position in percentage
    bgX = (col / (COLUMNS - 1)) * 100;
    bgY = (row / (ROWS - 1)) * 100;
  }

  return (
    <div
      className={`relative inline-block shrink-0 ${className} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        referrerPolicy={referrerPolicy}
        className="w-full h-full rounded-full object-cover relative z-0"
      />
      {hasFrame && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            // Scale up slightly to overlap the image perfectly (e.g. 1.2 or 1.25 depending on the frame design)
            transform: 'scale(1.25)',
            backgroundImage: `url('/assets/frames_spritesheet.png')`,
            backgroundSize: `${COLUMNS * 100}% ${ROWS * 100}%`,
            backgroundPosition: `${bgX}% ${bgY}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};
