'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  fallbackText: string
}

export function SafeImage({ src, alt, width, height, className, fallbackText }: SafeImageProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return (
      <div 
        className={`bg-muted rounded flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-xs font-medium text-muted-foreground">
          {fallbackText}
        </span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setHasError(true)}
      unoptimized // Temporariamente desabilita otimização para evitar erros de domínio
    />
  )
}
