interface IconProps {
  size?: number
  color?: string
  className?: string
}

const s = (size = 24, extra = '') => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  className: extra,
})

export const IconSearch = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
)
export const IconUser = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
export const IconCart = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
)
export const IconHeart = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
)
export const IconMenu = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
)
export const IconX = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)
export const IconChevronDown = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><polyline points="6 9 12 15 18 9"/></svg>
)
export const IconChevronRight = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><polyline points="9 18 15 12 9 6"/></svg>
)
export const IconChevronLeft = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><polyline points="15 18 9 12 15 6"/></svg>
)
export const IconTruck = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
)
export const IconRefresh = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
)
export const IconLock = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
)
export const IconGift = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
)
export const IconDollar = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
)
export const IconBarChart = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
)
export const IconPackage = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
)
export const IconUsers = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
)
export const IconGrid = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
)
export const IconTag = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
)
export const IconStar = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
)
export const IconFilter = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
)
export const IconArrowRight = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
)
export const IconTrash = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
)
export const IconEdit = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
)
export const IconEye = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
)
export const IconAlertTriangle = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
)
export const IconCreditCard = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
)
export const IconShield = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
)
export const IconMapPin = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
)
export const IconMail = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
)
export const IconPhone = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16l.19.92z"/></svg>
)
export const IconInstagram = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
)
export const IconTikTok = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.83 1.54V6.79a4.85 4.85 0 0 1-1.06-.1z"/>
  </svg>
)
export const IconFacebook = ({ size, className }: IconProps) => (
  <svg {...s(size, className)}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
)

// ──── Category icons (filled, colored) ────────────────────────────
interface CatIconProps { size?: number }

export const IconWoman = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="8" r="5" fill="#f9a8d4" stroke="#ec4899" strokeWidth="1.5"/>
    <path d="M8 30c0-6 3-10 8-10s8 4 8 10" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.5"/>
    <path d="M10 18l6 4 6-4" stroke="#ec4899" strokeWidth="1.5"/>
  </svg>
)
export const IconMan = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="8" r="5" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5"/>
    <rect x="9" y="18" width="14" height="12" rx="2" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
    <line x1="16" y1="18" x2="16" y2="30" stroke="#3b82f6" strokeWidth="1.5"/>
  </svg>
)
export const IconKid = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="9" r="6" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1.5"/>
    <path d="M9 30c0-5 3-9 7-9s7 4 7 9" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5"/>
    <path d="M10 14l2 2M22 14l-2 2" stroke="#22c55e" strokeWidth="1.5"/>
  </svg>
)
export const IconShoe = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M4 22c0 0 4-2 8-2s6 2 10 2h4v3H4v-3z" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5"/>
    <path d="M4 22v-6c0-2 1-4 4-5l4-1 4-2 4 2v6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5"/>
  </svg>
)
export const IconSmartphone = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="9" y="3" width="14" height="26" rx="3" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5"/>
    <line x1="14" y1="25" x2="18" y2="25" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="12" y="7" width="8" height="14" rx="1" fill="#c7d2fe"/>
  </svg>
)
export const IconCar = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M5 16l3-7h16l3 7" fill="#fed7aa" stroke="#f97316" strokeWidth="1.5"/>
    <rect x="3" y="16" width="26" height="8" rx="2" fill="#ffedd5" stroke="#f97316" strokeWidth="1.5"/>
    <circle cx="9" cy="24" r="3" fill="#f97316"/>
    <circle cx="23" cy="24" r="3" fill="#f97316"/>
    <rect x="11" y="10" width="10" height="6" rx="1" fill="#fed7aa"/>
  </svg>
)
export const IconToy = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="10" fill="#fde68a" stroke="#eab308" strokeWidth="1.5"/>
    <path d="M11 14c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5-1 2.5-2.5 2.5" stroke="#eab308" strokeWidth="1.5"/>
    <path d="M16 16c0-1.5 1-2.5 2.5-2.5S21 14.5 21 16s-1 2.5-2.5 2.5" stroke="#eab308" strokeWidth="1.5"/>
    <path d="M12 20h8" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
export const IconJewelry = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <polygon points="16,4 20,12 28,13 22,19 24,27 16,23 8,27 10,19 4,13 12,12" fill="#f5d0fe" stroke="#a855f7" strokeWidth="1.5"/>
    <circle cx="16" cy="16" r="4" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1.5"/>
  </svg>
)
export const IconLipstick = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="12" y="14" width="8" height="14" rx="1" fill="#fecdd3" stroke="#f43f5e" strokeWidth="1.5"/>
    <path d="M12 14V10l4-6 4 6v4" fill="#fed7d7" stroke="#f43f5e" strokeWidth="1.5"/>
    <ellipse cx="16" cy="8" rx="4" ry="2" fill="#f43f5e"/>
  </svg>
)
export const IconBaby = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="12" r="7" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5"/>
    <path d="M9 18c0 5 3 9 7 9s7-4 7-9" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5"/>
    <path d="M13 11c0 1-1 2-2 2M19 11c0 1 1 2 2 2" stroke="#10b981" strokeWidth="1.5"/>
    <path d="M13 15c.5 1 1.5 2 3 2s2.5-1 3-2" stroke="#10b981" strokeWidth="1.5"/>
  </svg>
)
export const IconBag = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M4 10h24l-2 18H6L4 10z" fill="#cffafe" stroke="#06b6d4" strokeWidth="1.5"/>
    <path d="M11 10V8a5 5 0 0 1 10 0v2" stroke="#06b6d4" strokeWidth="1.5"/>
    <line x1="10" y1="17" x2="22" y2="17" stroke="#06b6d4" strokeWidth="1.5"/>
  </svg>
)
export const IconJacket = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M4 8l5-3 3 5-2 2v16H6V12L4 8z" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5"/>
    <path d="M28 8l-5-3-3 5 2 2v16h4V12l2-4z" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5"/>
    <path d="M12 10l-3 0v18m11-18l3 0v18" stroke="#ca8a04" strokeWidth="1.5"/>
    <path d="M12 10c0 3 1 5 4 5s4-2 4-5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5"/>
  </svg>
)
export const IconSport = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="11" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5"/>
    <path d="M8 8c2 2 4 6 8 8s6 2 8 0" stroke="#16a34a" strokeWidth="1.5"/>
    <path d="M8 24c2-2 4-6 8-8s6-2 8 0" stroke="#16a34a" strokeWidth="1.5"/>
  </svg>
)
export const IconHanger = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 6a3 3 0 0 1 3 3h0a3 3 0 0 1-3 3" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 12L4 22h24L16 12z" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5"/>
    <circle cx="16" cy="5" r="2" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="1.5"/>
  </svg>
)
export const IconUnderwear = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M5 8h22l-4 12H11L7 8z" fill="#fce7f3" stroke="#db2777" strokeWidth="1.5"/>
    <path d="M11 8c0 4-3 8-6 8M21 8c0 4 3 8 6 8" stroke="#db2777" strokeWidth="1.5"/>
  </svg>
)
export const IconDress = ({ size = 32 }: CatIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 4l-5 8h10L16 4z" fill="#fbcfe8" stroke="#ec4899" strokeWidth="1.5"/>
    <path d="M11 12L6 28h20L21 12" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.5"/>
    <line x1="11" y1="12" x2="21" y2="12" stroke="#ec4899" strokeWidth="1.5"/>
  </svg>
)
