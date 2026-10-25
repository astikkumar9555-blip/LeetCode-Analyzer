 // All icons in one place. They use currentColor, so CSS "color" decides their colour.

const base = {
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

const makeIcon = (shape) =>
  function Icon(props) {
    return (
      <svg {...base} {...props}>
        {shape}
      </svg>
    )
  }

/* ---- auth screens ---- */
export const LockIcon = makeIcon(
  <path
    fill="currentColor"
    stroke="none"
    fillRule="evenodd"
    d="M12 1.5a5 5 0 0 0-5 5V10H6a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2h-1V6.5a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0V10H9V6.5z"
  />,
)
export const UserIcon = makeIcon(
  <g fill="currentColor" stroke="none">
    <circle cx="12" cy="8" r="4.2" />
    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
  </g>,
)
export const KeyIcon = makeIcon(
  <>
    <circle cx="8" cy="15" r="4" />
    <path d="M10.8 12.2 20 3M17 6l3 3M14 9l2 2" />
  </>,
)
export const UnlockIcon = makeIcon(
  <>
    <rect x="4" y="11" width="16" height="10" rx="2.5" />
    <path d="M8 11V7a4 4 0 0 1 7.6-1.7" />
  </>,
)
export const MailIcon = makeIcon(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </>,
)
export const EyeIcon = makeIcon(
  <>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </>,
)
export const EyeOffIcon = makeIcon(
  <path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.5C3.7 8.4 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
)
export const PlusIcon = makeIcon(<path d="M12 5v14M5 12h14" />)
export const ArrowLeftIcon = makeIcon(<path d="M19 12H5m6-7-7 7 7 7" />)
export const CheckIcon = makeIcon(<path d="m5 12.5 4.5 4.5L19 7.5" />)
export const AlertIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5m0 3h.01" />
  </>,
)

/* ---- dashboard ---- */
export const ChartIcon = makeIcon(<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />)
export const LayersIcon = makeIcon(
  <>
    <path d="m12 3 9 5-9 5-9-5z" />
    <path d="m3 13 9 5 9-5" />
  </>,
)
export const LogoutIcon = makeIcon(<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" />)
export const FlameIcon = makeIcon(
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
)
export const CodeIcon = makeIcon(<path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />)
export const TargetIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.2" />
  </>,
)
export const RefreshIcon = makeIcon(
  <>
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
    <path d="M21 3v5h-5" />
  </>,
)
export const TrophyIcon = makeIcon(
  <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />,
)
export const CalendarIcon = makeIcon(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </>,
)
export const SparkIcon = makeIcon(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />)
export const ChevronIcon = makeIcon(<path d="m6 9 6 6 6-6" />)
export const ExternalIcon = makeIcon(<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />)
export const TrendIcon = makeIcon(<path d="m3 17 6-6 4 4 8-8M15 7h6v6" />)