// Minimal inline SVG icon set (no icon-library dependency).
// All icons inherit `currentColor` and accept a className.

function base(path, viewBox = '0 0 24 24') {
  return function Icon({ className = 'h-5 w-5', strokeWidth = 1.8, ...props }) {
    return (
      <svg
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {path}
      </svg>
    )
  }
}

export const HomeIcon = base(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-6h6v6" />
  </>
)
export const ListIcon = base(
  <>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </>
)
export const BookIcon = base(
  <>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
    <path d="M4 19a2 2 0 0 1 2-2h13" />
  </>
)
export const ChartIcon = base(
  <>
    <path d="M3 3v18h18" />
    <path d="M7 14l3-4 3 3 4-6" />
  </>
)
export const WalletIcon = base(
  <>
    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M16 12h3" />
    <path d="M3 9h13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3" />
  </>
)
export const CheckSquareIcon = base(
  <>
    <path d="M9 11l3 3 8-8" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </>
)
export const SunIcon = base(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>
)
export const MoonIcon = base(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />)
export const LockIcon = base(
  <>
    <rect x="4.5" y="11" width="15" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </>
)
export const PlusIcon = base(<path d="M12 5v14M5 12h14" />)
export const TrashIcon = base(
  <>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </>
)
export const EditIcon = base(
  <>
    <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17z" />
    <path d="M13.5 6.5l3 3" />
  </>
)
export const UploadIcon = base(
  <>
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M5 20h14" />
  </>
)
export const XIcon = base(<path d="M6 6l12 12M18 6L6 18" />)
export const SparkIcon = base(
  <>
    <path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8z" />
    <path d="M19 14l.8 2 .2.8" />
  </>
)
export const AlertIcon = base(
  <>
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
  </>
)
export const FlameIcon = base(
  <path d="M12 3s4 3.5 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5.5-2.5S6 11 6 14a6 6 0 0 0 12 0c0-5-6-11-6-11z" />
)
export const TrophyIcon = base(
  <>
    <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
    <path d="M8 5H5a2 2 0 0 0 0 4h1.5M16 5h3a2 2 0 0 1 0 4h-1.5" />
    <path d="M10 13.5V16h4v-2.5M9 20h6M10 16h4l.5 4h-5z" />
  </>
)
export const TargetIcon = base(
  <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.5" />
  </>
)
export const ImageIcon = base(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="9" r="1.5" />
    <path d="M21 16l-5-5L5 20" />
  </>
)
