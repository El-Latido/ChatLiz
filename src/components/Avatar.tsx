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
            // Agrandar un poco para que funcione como borde exterior
            transform: 'scale(1.35)'
          }}
        >
          <img 
            src={`/frames/${frameId}.png`} 
            alt={`Frame ${frameId}`}
            className="w-full h-full object-contain"
            style={{
              // Este CSS corta un agujero redondo en el centro exacto del avatar.
              // Usamos closest-side para que se base en el radio del contenedor.
              WebkitMaskImage: 'radial-gradient(circle closest-side, transparent 74%, black 75%)',
              maskImage: 'radial-gradient(circle closest-side, transparent 74%, black 75%)'
            }}
            onError={(e) => {
              // Si la imagen no está disponible aún, ocultarla
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};
