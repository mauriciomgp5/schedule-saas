import { cn } from '@/utils/cn'

interface HeroProps {
  title: React.ReactNode
  subtitle?: string
  description?: string
  backgroundImage?: string
  backgroundColor?: string
  logo?: string
  businessName?: string
  children?: React.ReactNode
  badges?: React.ReactNode
  className?: string
  overlay?: boolean
}

export default function Hero({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundColor = '#667eea',
  logo,
  businessName,
  children,
  badges,
  className,
  overlay = true,
}: HeroProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background */}
      {backgroundImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          {overlay && <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />}
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${backgroundColor} 0%, ${adjustColor(backgroundColor, -20)} 100%)`,
            }}
          />
          {overlay && <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40" />}
        </>
      )}

      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          {/* Logo and Business Name */}
          {(logo || businessName) && (
            <div className="flex items-center justify-center gap-4 mb-8">
              {logo && (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                  <img src={logo} alt={businessName} className="w-full h-full object-cover" />
                </div>
              )}
              {businessName && (
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {businessName}
                </h1>
              )}
            </div>
          )}

          {/* Badges */}
          {badges && <div className="flex items-center justify-center gap-3 mb-8">{badges}</div>}

          {/* Subtitle */}
          {subtitle && (
            <p className="text-white/90 text-lg md:text-xl font-medium mb-4 drop-shadow-md">
              {subtitle}
            </p>
          )}

          {/* Title */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl">
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed drop-shadow-lg">
              {description}
            </p>
          )}

          {/* Children (CTAs, etc) */}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 md:h-24 fill-current text-gray-50"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
        </svg>
      </div>
    </div>
  )
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const clamp = (val: number) => Math.min(Math.max(val, 0), 255)
  const num = parseInt(color.replace('#', ''), 16)
  const r = clamp((num >> 16) + amount)
  const g = clamp(((num >> 8) & 0x00ff) + amount)
  const b = clamp((num & 0x0000ff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
