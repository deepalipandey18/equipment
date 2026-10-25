import React from 'react';

/**
 * Official STORENT Brand Logo Component
 * Matches the uploaded brand identity:
 * - Yellow: #FCC837
 * - Dark Grey / Slate Charcoal: #34373C
 * - White: #FFFFFF
 *
 * Variants:
 * - 'banner': Full yellow background banner with dark circle, yellow rhino, and dark STORENT wordmark (exact match to uploaded image)
 * - 'default': Transparent background with dark circle, yellow rhino, and dark STORENT wordmark (for light backgrounds / navbar)
 * - 'light': Dark background variant with yellow circle, dark rhino, and crisp white STORENT wordmark (for dark footer / hero)
 * - 'badge-only': Just the circular rhino icon (for favicons, avatars, mobile)
 */
const StorentLogo = ({ variant = 'default', className = 'h-9 w-auto', showSubtitle = false }) => {
  // SVG Rhino Silhouette Path (Facing Left, muscular heavy body, dual horns, sturdy legs)
  const rhinoPath =
    "M 31 52 C 28 50 25 48 21 48 C 22 46 23 43 25 38 C 26 35 25 34 22 36 C 18 39 16 43 14 47 C 12 50 14 53 16 54 C 18 55 20 54 22 53 C 24 57 26 58 29 57 C 29 55 30 52 32 49 C 34 46 37 44 40 43 C 44 42 47 43 50 41 C 53 39 56 38 60 38 C 65 38 69 41 73 44 C 77 47 79 50 80 54 C 81 58 79 62 76 65 C 77 69 77 73 75 76 C 73 78 70 78 68 76 C 66 73 66 70 67 66 C 65 67 62 67 59 66 C 58 70 56 74 53 77 C 51 79 48 78 47 75 C 46 72 47 68 49 64 C 44 64 40 62 37 59 C 35 63 33 67 30 70 C 28 72 25 71 24 68 C 23 65 24 62 26 58 C 24 58 23 57 23 55 C 24 53 28 53 31 52 Z";

  // Detailed refined rhino silhouette facing left
  const detailedRhino = (fillColor) => (
    <path
      d="M 28 56 C 24 55 20 52 16 46 C 18 43 20 38 21 34 C 20 35 18 39 15 42 C 12 45 10 47 8 48 C 10 50 13 52 17 54 C 15 56 14 59 13 61 C 15 61 18 59 20 56 C 22 57 24 58 27 59 C 26 62 25 67 24 72 C 26 73 29 73 31 71 C 32 68 33 64 34 60 C 37 60 40 60 43 61 C 42 64 42 68 43 72 C 45 73 48 72 49 69 C 50 66 50 62 50 59 C 55 58 60 59 65 61 C 65 65 64 69 64 73 C 66 74 69 73 71 70 C 72 67 72 63 71 59 C 74 58 76 56 78 53 C 80 50 81 46 80 43 C 78 40 75 38 71 37 C 66 36 61 36 56 37 C 51 38 47 40 43 40 C 39 40 36 38 33 40 C 31 41 29 45 28 49 C 26 49 24 47 23 44 C 24 42 26 40 28 39 C 27 38 25 39 23 41 C 21 44 20 48 21 51 C 23 53 26 55 28 56 Z"
      fill={fillColor}
    />
  );

  // Exact vector trace of the uploaded Storent Rhino emblem facing left
  const rhinoSvgPath = (fillColor) => (
    <g fill={fillColor}>
      {/* Rhinoceros body contour */}
      <path d="M 28.5 54.2 C 27.2 53.6 25.1 51.8 23.8 50.2 C 22.4 48.6 20.8 45.9 20.2 44.2 C 19.6 42.5 19.1 39.8 19.1 38.2 C 19.1 37.1 18.7 37.2 18.2 38.5 C 17.5 40.2 16.3 42.7 15.5 44.1 C 14.5 45.8 13.0 47.4 12.2 47.7 C 11.5 47.9 11.4 48.3 12.0 48.8 C 12.6 49.3 14.4 50.4 16.0 51.2 C 17.6 52.0 19.0 53.0 19.1 53.4 C 19.2 53.8 18.5 55.1 17.5 56.3 C 16.5 57.5 15.7 58.7 15.7 59.0 C 15.7 59.3 16.5 59.4 17.5 59.2 C 18.8 59.0 20.1 58.2 21.0 57.0 C 21.8 55.9 22.8 55.2 23.6 55.2 C 24.5 55.2 25.8 56.1 26.5 57.2 C 27.2 58.3 27.6 59.8 27.4 60.5 C 27.2 61.2 26.7 63.8 26.3 66.3 C 25.9 68.8 25.4 71.2 25.2 71.7 C 24.8 72.5 25.3 73.0 27.0 73.0 C 28.5 73.0 29.2 72.6 29.8 71.3 C 30.3 70.3 30.9 68.0 31.2 66.2 C 31.5 64.4 32.0 62.5 32.3 62.0 C 32.6 61.5 34.0 61.4 35.5 61.8 C 37.0 62.2 38.5 62.8 38.8 63.2 C 39.1 63.6 39.0 65.6 38.6 67.6 C 38.2 69.6 38.0 71.5 38.2 71.8 C 38.5 72.3 39.3 72.5 40.8 72.5 C 42.5 72.5 43.1 72.2 43.5 71.1 C 43.8 70.3 44.4 67.8 44.8 65.6 C 45.2 63.4 45.8 61.4 46.1 61.1 C 46.4 60.8 48.5 60.6 50.8 60.6 C 53.5 60.6 55.5 60.9 56.2 61.4 C 57.0 62.0 57.2 63.2 57.0 65.2 C 56.8 67.2 56.8 69.4 57.0 70.1 C 57.4 71.4 58.3 72.0 60.2 72.0 C 62.0 72.0 62.8 71.4 63.2 69.8 C 63.5 68.6 64.0 65.5 64.3 62.9 C 64.6 60.3 65.2 58.0 65.6 57.8 C 66.0 57.6 67.0 57.9 67.8 58.5 C 68.6 59.1 69.3 61.2 69.4 63.2 C 69.5 65.2 69.8 67.3 70.1 67.9 C 70.6 69.1 71.5 69.5 73.2 69.5 C 75.0 69.5 75.8 68.9 76.0 67.5 C 76.2 66.3 76.2 64.4 76.0 63.3 C 75.8 62.2 76.1 60.8 76.7 60.2 C 77.3 59.6 77.8 58.2 77.8 57.1 C 77.8 56.0 78.4 54.4 79.1 53.6 C 79.8 52.8 80.4 51.5 80.4 50.7 C 80.4 49.9 80.0 48.5 79.5 47.6 C 79.0 46.7 78.5 45.3 78.4 44.5 C 78.3 43.7 77.7 42.5 77.1 41.8 C 76.5 41.1 75.1 40.0 74.0 39.4 C 72.9 38.8 70.5 38.0 68.7 37.6 C 66.9 37.2 63.5 37.0 61.1 37.2 C 58.7 37.4 55.4 37.9 53.8 38.3 C 52.2 38.7 49.8 39.1 48.5 39.2 C 47.2 39.3 45.3 39.6 44.2 39.9 C 43.1 40.2 41.0 40.4 39.5 40.3 C 38.0 40.2 36.3 39.8 35.7 39.4 C 35.1 39.0 34.0 38.8 33.2 38.9 C 32.4 39.0 31.4 39.6 31.0 40.2 C 30.6 40.8 30.2 42.0 30.1 42.9 C 30.0 43.8 29.5 45.0 29.0 45.6 C 28.5 46.2 27.6 46.9 27.0 47.1 C 26.4 47.3 25.5 47.1 25.0 46.7 C 24.5 46.3 24.1 45.2 24.1 44.2 C 24.1 43.2 24.6 42.0 25.2 41.5 C 25.8 41.0 26.2 40.0 26.1 39.3 C 26.0 38.6 25.4 38.5 24.8 39.1 C 24.2 39.7 23.2 41.2 22.6 42.4 C 22.0 43.6 21.6 45.4 21.7 46.4 C 21.8 47.4 22.3 48.7 22.8 49.3 C 23.3 49.9 24.5 50.9 25.5 51.5 C 26.5 52.1 27.8 53.1 28.4 53.7 C 29.0 54.3 29.2 54.5 28.5 54.2 Z" />
    </g>
  );

  // Variant 1: "banner" - Exact reproduction of user's uploaded image (Yellow rectangle + Dark Circle with Yellow Rhino + Dark STORENT text)
  if (variant === 'banner') {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <svg
          viewBox="0 0 450 140"
          className="h-full w-auto max-h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Yellow Banner Background */}
          <rect width="450" height="140" fill="#FCC837" rx="8" />

          {/* Dark Charcoal Circle */}
          <circle cx="82" cy="70" r="48" fill="#34373C" />

          {/* Yellow Rhino Facing Left Inside Circle */}
          <g transform="translate(37, 25) scale(0.95)">
            {rhinoSvgPath('#FCC837')}
          </g>

          {/* Dark Charcoal STORENT Wordmark */}
          <text
            x="150"
            y="88"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="68"
            letterSpacing="3"
            fill="#34373C"
          >
            STORENT
          </text>
        </svg>
      </div>
    );
  }

  // Variant 2: "badge-only" - Circular emblem only
  if (variant === 'badge-only') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="48" fill="#34373C" />
          <g transform="translate(5, 5) scale(0.95)">
            {rhinoSvgPath('#FCC837')}
          </g>
        </svg>
      </div>
    );
  }

  // Variant 3: "light" - For Dark Grey / Dark Slate backgrounds (Footer, dark headers)
  if (variant === 'light') {
    return (
      <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
        <svg
          viewBox="0 0 380 95"
          className="h-full w-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Yellow Emblem Circle */}
          <circle cx="48" cy="48" r="44" fill="#FCC837" />

          {/* Dark Charcoal Rhino */}
          <g transform="translate(3, 3) scale(0.95)">
            {rhinoSvgPath('#34373C')}
          </g>

          {/* Pure White STORENT Wordmark */}
          <text
            x="110"
            y="65"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="54"
            letterSpacing="2.5"
            fill="#FFFFFF"
          >
            STORENT
          </text>
        </svg>
        {showSubtitle && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#FCC837] border-l border-slate-700 pl-2.5 hidden sm:inline">
            Heavy Machinery Rental
          </span>
        )}
      </div>
    );
  }

  // Variant 4: "default" - Standard transparent logo for light background (Navbar, Modals, Forms)
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 380 95"
        className="h-full w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dark Charcoal Circle */}
        <circle cx="48" cy="48" r="44" fill="#34373C" />

        {/* Yellow Rhino Facing Left */}
        <g transform="translate(3, 3) scale(0.95)">
          {rhinoSvgPath('#FCC837')}
        </g>

        {/* Dark Charcoal STORENT Wordmark */}
        <text
          x="110"
          y="65"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="54"
          letterSpacing="2.5"
          fill="#34373C"
        >
          STORENT
        </text>
      </svg>
      {showSubtitle && (
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 border-l border-slate-300 pl-2.5 ml-2.5 hidden sm:inline">
          Heavy Machinery Rental
        </span>
      )}
    </div>
  );
};

export default StorentLogo;

