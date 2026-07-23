import React from 'react'

interface ClassicArchLogoProps {
  showSlogan?: boolean
  size?: 'sm' | 'md' | 'lg'
  titleGraveAccent?: boolean
  className?: string
}

export const ClassicArchLogoIcon: React.FC<{ className?: string }> = ({
  className = "w-10 h-10 text-accent-gold"
}) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Ícone do Arco Clássico com Pilares e Estrela de 4 Pontas"
  >
    {/* Base Platform / Stylobate */}
    <path d="M 6,42 L 42,42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 9,39 L 39,39" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    
    {/* Left Pillar Columns */}
    <path d="M 12,39 L 12,20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M 15,39 L 15,20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 10,20 L 17,20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M 10,39 L 17,39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    
    {/* Right Pillar Columns */}
    <path d="M 36,39 L 36,20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M 33,39 L 33,20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 31,20 L 38,20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M 31,39 L 38,39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

    {/* Arch Curve (Semi-circular arch connecting columns) */}
    <path d="M 12,20 C 12,8 36,8 36,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M 15,20 C 15,11 33,11 33,20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.5" />

    {/* Central 4-pointed star (sparkle diamond star) inside the apex of the arch */}
    <path
      d="M 24,7 L 25.6,12.4 L 31,14 L 25.6,15.6 L 24,21 L 22.4,15.6 L 17,14 L 22.4,12.4 Z"
      fill="currentColor"
    />
  </svg>
)

export const ClassicArchLogo: React.FC<ClassicArchLogoProps> = ({
  showSlogan = true,
  size = 'md',
  titleGraveAccent = true,
  className = '',
}) => {
  const isLarge = size === 'lg'
  const isSmall = size === 'sm'

  return (
    <div className={`flex flex-col items-center text-center space-y-3 ${className}`}>
      {/* Classical Arch Icon */}
      <div
        className={`inline-flex items-center justify-center ${
          isLarge ? 'w-20 h-20' : isSmall ? 'w-10 h-10' : 'w-14 h-14'
        } rounded-2xl bg-bg-base border border-accent-gold/40 shadow-xl p-2.5 mx-auto`}
      >
        <ClassicArchLogoIcon
          className={`${
            isLarge ? 'w-12 h-12' : isSmall ? 'w-6 h-6' : 'w-9 h-9'
          } text-accent-gold`}
        />
      </div>

      {/* Main Title "Àgora" in font-serif */}
      <div className="space-y-1">
        <h1
          className={`font-serif font-bold ${
            isLarge ? 'text-4xl sm:text-5xl' : isSmall ? 'text-xl' : 'text-3xl'
          } text-text-primary tracking-wide`}
        >
          {titleGraveAccent ? 'Àgora' : 'Ágora'}
        </h1>
      </div>

      {/* Official Slogan in font-sans Light/Regular */}
      {showSlogan && (
        <p
          className={`font-sans font-light ${
            isLarge ? 'text-sm sm:text-base' : 'text-xs'
          } text-text-secondary max-w-xs sm:max-w-md mx-auto leading-relaxed pt-1`}
        >
          Tudo o que você assiste, lê e aprende, em um só lugar.
        </p>
      )}
    </div>
  )
}
