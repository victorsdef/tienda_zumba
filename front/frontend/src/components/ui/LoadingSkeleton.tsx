type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function Spinner({ size = 'md', className = '', label = 'Cargando' }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-7 w-7 border-[3px]', lg: 'h-12 w-12 border-4' }
  return (
    <span
      className={`inline-block shrink-0 animate-spin rounded-full border-current border-r-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label={label}
    />
  )
}

export function ButtonSpinner({ label = 'Procesando' }: { label?: string }) {
  return <Spinner size="sm" className="mr-2 align-[-2px]" label={label} />
}

export function PageLoader({ message = 'Cargando…' }: { message?: string }) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 px-4 text-[#7d5c48]" role="status">
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#c9ab96]/25" />
        <Spinner size="lg" />
      </div>
      <p className="animate-pulse text-sm font-medium tracking-wide">{message}</p>
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-[3/4] rounded" />
      <div className="p-2 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <ProductSkeleton key={i} />)}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl animate-pulse gap-8 px-4 py-10 md:grid-cols-2" aria-label="Cargando detalle">
      <div className="aspect-[3/4] rounded-2xl bg-gray-200" />
      <div className="space-y-5 py-4">
        <div className="h-4 w-1/4 rounded bg-gray-200" />
        <div className="h-9 w-3/4 rounded bg-gray-200" />
        <div className="h-7 w-1/3 rounded bg-gray-200" />
        <div className="space-y-3 pt-4">
          <div className="h-4 rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-4 w-2/3 rounded bg-gray-200" />
        </div>
        <div className="h-12 w-full rounded-xl bg-gray-200" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white" aria-label="Cargando información">
      <div className="h-12 border-b bg-gray-100" />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 border-b p-4 last:border-0">
          <div className="h-4 rounded bg-gray-200" />
          <div className="h-4 rounded bg-gray-200" />
          <div className="h-4 rounded bg-gray-200" />
          <div className="h-4 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}
