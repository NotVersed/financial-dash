import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: number
  showText?: boolean
}

export function Logo({ className = '', size = 40, showText = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <Image 
          src="/logo-new.png" 
          alt="Logo" 
          fill
          sizes="(max-width: 768px) 100vw, 48px"
          className={`object-contain ${className}`}
          priority
        />
      </div>
      {showText && (
        <div>
          <h2 className="text-xl font-bold text-slate-800">Randy Stephens</h2>
          <p className="text-xs text-slate-500">Financial Progress Tracker</p>
        </div>
      )}
    </div>
  )
}