import React, { createContext, useContext, useEffect, useState } from 'react';
import { CHARACTERS } from '../data/characters';
import { CharacterId } from '../types/game';

export type PortraitStyleMode = 'origami' | 'gem';

export const PortraitStyleContext = createContext<{
  style: PortraitStyleMode;
  toggleStyle: () => void;
}>({
  style: 'origami',
  toggleStyle: () => {},
});

export function usePortraitStyle() {
  return useContext(PortraitStyleContext);
}

interface CharacterPortraitProps {
  characterId: CharacterId;
  forcePlaceholder?: boolean;
  className?: string;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  characterId,
  forcePlaceholder = false,
  className = '',
}) => {
  const profile = CHARACTERS[characterId];
  const { style } = usePortraitStyle();
  const [imgFailed, setImgFailed] = useState(false);

  const resolvedUrl =
    style === 'origami' && profile.origamiPortraitUrl
      ? profile.origamiPortraitUrl
      : profile.portraitUrl;

  useEffect(() => {
    setImgFailed(false);
  }, [characterId, forcePlaceholder, resolvedUrl]);

  const showImage = Boolean(resolvedUrl) && !forcePlaceholder && !imgFailed;

  return (
    <div
      className={`relative overflow-hidden select-none flex items-center justify-center ${className}`}
      style={{ backgroundColor: profile.bgHex }}
    >
      {showImage ? (
        <img
          src={resolvedUrl}
          alt={profile.name}
          draggable={false}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        /* Reigns-style Geometric Polygon Placeholder */
        <div className="@container relative w-full h-full flex flex-col items-center justify-center p-[6%] overflow-hidden">
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
          >
            <polygon
              points="100,14 176,58 158,162 42,162 24,58"
              fill={profile.accentHex}
              fillOpacity="0.18"
              stroke={profile.accentHex}
              strokeWidth="2"
            />
            <polygon
              points="100,34 152,78 132,148 68,148 48,78"
              fill={profile.accentHex}
              fillOpacity="0.28"
            />
            <line
              x1="0"
              y1="172"
              x2="200"
              y2="172"
              stroke={profile.accentHex}
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
          </svg>

          <div
            className="relative z-10 w-[42%] max-w-24 aspect-square rotate-45 flex items-center justify-center border shadow-lg"
            style={{
              borderColor: profile.accentHex,
              backgroundColor: `${profile.bgHex}dd`,
              boxShadow: `0 0 0 4px ${profile.bgHex}, 0 0 0 5px ${profile.accentHex}55, 0 0 24px ${profile.accentHex}33`,
            }}
          >
            <span
              className="-rotate-45 font-display font-black leading-none"
              style={{ color: profile.accentHex, fontSize: 'clamp(12px, 9cqw, 40px)' }}
            >
              {profile.name.replace(/[（(].*$/, '').slice(0, 1)}
            </span>
          </div>

          <div className="relative z-10 mt-5 text-center">
            <div
              className="text-[9px] font-mono uppercase tracking-[0.3em] px-2 py-0.5"
              style={{ color: `${profile.accentHex}cc` }}
            >
              {profile.id.replace('_easter', '')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
