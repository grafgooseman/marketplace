import { Input } from "@/components/ui/input"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Heart, MoreHorizontal, Star, MessageCircle, Phone, MapPin } from "lucide-react"
import { apiClient, type Ad } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AdClientActions } from "./ad-client-actions"
import { Metadata } from "next"
import { AdPageContent } from "./ad-page-content"

type AdPageProps = {
  params: {
    id: string
  }
}

// Server-side data fetching with better error handling
async function getAdData(id: string): Promise<{ ad: Ad; relatedAds: Ad[] } | null> {
  try {
    console.log('Server: Fetching ad data for ID:', id)
    
    // Check if we're in server environment and API is accessible
    if (typeof window === 'undefined') {
      console.log('Server: Running in server environment')
      
      // TEMPORARILY DISABLE SERVER-SIDE FETCHING FOR DEBUGGING
      console.log('Server: Skipping server-side fetch for debugging')
      return null
      
      try {
        // We're on the server, try to fetch
        console.log('Server: Calling apiClient.getAd...')
        const ad = await apiClient.getAd(id)
        console.log('Server: getAd response:', ad)
        
        if (!ad || !ad.id) {
          console.log('Server: No ad found or invalid ad data:', ad)
          return null
        }
        
        console.log('Server: Ad fetched successfully:', ad.title)
        
        // Fetch related ads
        console.log('Server: Fetching related ads...')
        const relatedResponse = await apiClient.getAds({ limit: 8 })
        console.log('Server: getAds response:', relatedResponse)
        const relatedAds = relatedResponse.ads.filter(relatedAd => relatedAd.id !== id)
        console.log('Server: Related ads filtered:', relatedAds.length)
        
        return { ad, relatedAds }
      } catch (apiError) {
        console.error('Server: API call failed:', apiError)
        return null
      }
    }
    
    console.log('Server: Not in server environment, returning null')
    return null
  } catch (error) {
    console.error('Server: Failed to load ad data:', error)
    // Don't fail completely, let client handle it
    return null
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: AdPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getAdData(resolvedParams.id)
  
  if (!data || !data.ad) {
    return {
      title: 'Ad Details - Goose Exchange',
      description: 'View airsoft gear details and specifications.',
    }
  }

  const { ad } = data
  
  return {
    title: `${ad.title} - $${ad.price} | Goose Exchange`,
    description: ad.description?.slice(0, 160) + (ad.description?.length > 160 ? '...' : ''),
    openGraph: {
      title: ad.title,
      description: ad.description || 'Airsoft gear for sale',
      images: ad.image ? [{ url: ad.image, alt: ad.title }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ad.title,
      description: ad.description || 'Airsoft gear for sale',
      images: ad.image ? [ad.image] : [],
    },
  }
}

export default async function AdPage({ params }: AdPageProps) {
  // Await params to fix Next.js warning
  const resolvedParams = await params;
  
  // Try to get data on server-side
  const serverData = await getAdData(resolvedParams.id)
  
  // Pass the server data (or null) to client component for handling
  return <AdPageContent adId={resolvedParams.id} initialData={serverData} />
}
