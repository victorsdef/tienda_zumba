import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getHomeLayout } from '../api/configuracion'
import type { HomeLayout } from '../types/homeBuilder'
import './styles/storefront-theme.scss'

interface Props {
  children: ReactNode
  className?: string
  themeOverride?: HomeLayout['globalTheme']
}

const fallbackTheme: HomeLayout['globalTheme'] = {
  enabled: true,
  primary: '#4a3728',
  secondary: '#7d5c48',
  accent: '#b78b72',
  background: '#faf7f3',
  surface: '#ffffff',
  text: '#2c1a10',
  mutedText: '#7d6c61',
  border: '#e4d9cf',
  buttonText: '#ffffff',
  radius: 12,
  decoration: 'none',
}

export default function StorefrontTheme({ children, className = '', themeOverride }: Props) {
  const { data: raw = '' } = useQuery({
    queryKey: ['home-layout'],
    queryFn: getHomeLayout,
    staleTime: 60_000,
  })

  const theme = useMemo(() => {
    if (themeOverride) return { ...fallbackTheme, ...themeOverride }
    try {
      const layout = JSON.parse(raw) as HomeLayout
      if (!layout.globalTheme?.enabled) return fallbackTheme
      return { ...fallbackTheme, ...layout.globalTheme }
    } catch {
      return fallbackTheme
    }
  }, [raw, themeOverride])

  const style = {
    '--store-primary': theme.primary,
    '--store-secondary': theme.secondary,
    '--store-accent': theme.accent,
    '--store-bg': theme.background,
    '--store-surface': theme.surface,
    '--store-text': theme.text,
    '--store-muted': theme.mutedText,
    '--store-border': theme.border,
    '--store-button-text': theme.buttonText,
    '--store-radius': `${theme.radius}px`,
    '--color-brand-050': theme.surface,
    '--color-brand-100': theme.background,
    '--color-brand-600': theme.primary,
    '--color-brand-800': theme.secondary,
    '--color-border-soft': theme.border,
    '--shadow-soft': `0 12px 32px color-mix(in srgb, ${theme.primary} 18%, transparent)`,
  } as CSSProperties

  return (
    <div className={`storefront-theme ${className}`} data-decoration={theme.decoration} style={style}>
      {children}
    </div>
  )
}
