"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface AdClientActionsProps {
  adId: string
  createdAt: string
}

export function AdClientActions({ adId, createdAt }: AdClientActionsProps) {
  const [viewCount, setViewCount] = useState<number | null>(null)

  useEffect(() => {
    // Generate view count on client side only to avoid hydration mismatch
    setViewCount(Math.floor(Math.random() * 100) + 20)
  }, [])

  // Handle case where adId might be undefined
  if (!adId || !createdAt) {
    return (
      <div className="text-xs text-muted-foreground">
        <p>Loading ad details...</p>
      </div>
    )
  }

  return (
    <div className="text-xs text-muted-foreground">
      <p>
        Ad #{adId.slice(-8)} &middot; Posted {new Date(createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })} &middot; {viewCount || '--'} views
      </p>
      <Link href="#" className="hover:text-primary hover:underline mt-2 inline-block">
        Report this ad
      </Link>
    </div>
  )
} 