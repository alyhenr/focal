'use client'

import { useEffect, useRef } from 'react'

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    // Star properties
    const stars: Array<{
      x: number
      y: number
      size: number
      speed: number
      opacity: number
    }> = []

    // Create stars - fewer and more subtle
    const createStars = () => {
      const starCount = 80 // Reduced from 150
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5, // Smaller stars
          speed: Math.random() * 0.3 + 0.05, // Slower movement
          opacity: Math.random() * 0.4 + 0.1, // More subtle opacity
        })
      }
    }
    createStars()

    // Animation loop
    let animationId: number
    const animate = () => {
      // Clear canvas with very subtle trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        // Move star
        star.y += star.speed

        // Reset star position when it goes off screen
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }

        // Draw star with subtle glow
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)

        // Create gradient for subtle glow effect
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2)
        gradient.addColorStop(0, `rgba(107, 142, 127, ${star.opacity})`) // Sage green core
        gradient.addColorStop(1, 'rgba(107, 142, 127, 0)') // Fade out

        ctx.fillStyle = gradient
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    return () => {
      window.removeEventListener('resize', setCanvasSize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-20" // More subtle overall opacity
      style={{
        background: 'linear-gradient(135deg, #1C2626 0%, #2D3E40 50%, #1C2626 100%)'  // Deep teal-gray gradient
      }}
    />
  )
}