"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Heart, MoreHorizontal, Star, MessageCircle, Phone, MapPin } from "lucide-react"
import { apiClient, type Ad } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdClientActions } from "./ad-client-actions"

interface AdPageContentProps {
  adId: string
  initialData: { ad: Ad; relatedAds: Ad[] } | null
}

export function AdPageContent({ adId, initialData }: AdPageContentProps) {
  const [ad, setAd] = useState<Ad | null>(initialData?.ad || null)
  const [relatedAds, setRelatedAds] = useState<Ad[]>(initialData?.relatedAds || [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If we don't have initial data, fetch on client side
    if (!initialData) {
      const fetchData = async () => {
        try {
          console.log('Client: Fetching ad data for ID:', adId)
          setLoading(true)
          
          // ISOLATED TEST: Try fetching with unique headers to avoid interference
          console.log('Client: Testing isolated fetch...')
          const isolatedResponse = await fetch(`http://localhost:3001/api/ads/${adId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Test-Request': 'isolated-ad-fetch',
              'Cache-Control': 'no-cache'
            }
          })
          const isolatedData = await isolatedResponse.json()
          console.log('Client: Isolated fetch response:', isolatedData)
          console.log('Client: Isolated fetch response text:', JSON.stringify(isolatedData))
          
          // DIRECT TEST: Try fetching with a simple fetch call
          console.log('Client: Testing direct fetch...')
          const directResponse = await fetch(`http://localhost:3001/api/ads/${adId}`)
          const directData = await directResponse.json()
          console.log('Client: Direct fetch response:', directData)
          console.log('Client: Direct fetch ad data:', directData.ad)
          console.log('Client: Direct fetch ad title:', directData.ad?.title)
          
          // TEMPORARY FIX: Use direct fetch data if API client fails
          if (directData.ad && directData.ad.id) {
            console.log('Client: Using direct fetch data as fallback')
            setAd(directData.ad)
            
            // Still fetch related ads with API client
            console.log('Client: Fetching related ads...')
            const relatedResponse = await apiClient.getAds({ limit: 8 })
            console.log('Client: getAds response:', relatedResponse)
            setRelatedAds(relatedResponse.ads.filter(relatedAd => relatedAd.id !== adId))
            
            console.log('Client: Data fetched successfully using direct fetch')
            return // Skip the API client call
          }
          
          console.log('Client: Calling apiClient.getAd...')
          const adData = await apiClient.getAd(adId)
          console.log('Client: getAd response:', adData)
          
          if (!adData || !adData.id) {
            throw new Error('Invalid ad data received')
          }
          
          setAd(adData)
          
          console.log('Client: Fetching related ads...')
          const relatedResponse = await apiClient.getAds({ limit: 8 })
          console.log('Client: getAds response:', relatedResponse)
          setRelatedAds(relatedResponse.ads.filter(relatedAd => relatedAd.id !== adId))
          
          console.log('Client: Data fetched successfully')
        } catch (err) {
          console.error('Client: Failed to fetch ad data:', err)
          setError('Failed to load ad details')
        } finally {
          setLoading(false)
        }
      }
      
      fetchData()
    } else {
      console.log('Client: Using initial server data:', initialData)
    }
  }, [adId, initialData])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ad details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !ad) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Ad not found'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Mock data based on the reference image
  const seller = {
    name: ad.seller || "Anonymous Seller",
    rating: ad.rating || 4.5,
    reviews: 15,
    status: "Private Seller",
    responseTime: "Responds in about an hour",
  }

  const quickMessagePrompts = [
    "Where and when can I see it?",
    "Is it still for sale?",
    "Call me?",
    "Is bargaining appropriate?",
    "Can you send a video?",
  ]

  const breadcrumbs = ["Home", "Airsoft", "Primary Weapons", ad.title]

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-4 text-sm text-muted-foreground">
            <ol className="list-none p-0 inline-flex">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  <Link href="#" className="hover:text-primary">
                    {crumb}
                  </Link>
                  {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 mx-1" />}
                </li>
              ))}
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Images and Description */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-4 lg:hidden">{ad.title}</h1>
              {/* Main Image */}
              <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 shadow-sm">
                <Image src={ad.image || "/placeholder.svg"} alt={ad.title} fill className="object-cover" />
              </div>

              {/* Image Gallery - Show only current ad's image */}
              {ad.image && (
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 mb-8">
                  <div className="relative aspect-square rounded-md overflow-hidden cursor-pointer ring-2 ring-primary ring-offset-2">
                    <Image
                      src={ad.image}
                      alt={`${ad.title} thumbnail`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Location</h2>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{ad.location}</span>
                </div>
                <Link href="#" className="text-sm text-primary hover:underline mt-1 inline-block">
                  Show on map
                </Link>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground whitespace-pre-line">{ad.description}</p>
              </div>

              {/* Ad Info - Using client component for view count */}
              <AdClientActions adId={ad.id} createdAt={ad.created_at} />
            </div>

            {/* Right Column: Price and Seller Info */}
            <div className="relative">
              <div className="sticky top-24 space-y-6">
                <h1 className="text-3xl font-bold hidden lg:block">{ad.title}</h1>

                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">${ad.price}</span>
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Heart className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{seller.responseTime}</p>

                <div className="grid grid-cols-2 gap-3">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    <Phone className="h-5 w-5 mr-2" />
                    Show Phone
                  </Button>
                  <Button size="lg">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Message
                  </Button>
                </div>

                {/* Seller Info Card */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Seller</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{seller.name}</p>
                        <div className="flex items-center text-xs">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span>
                            {seller.rating} ({seller.reviews} reviews)
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{seller.status}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Follow
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Messages Card */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Ask the seller</h3>
                    <Input placeholder="Hello!" className="mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {quickMessagePrompts.map((prompt) => (
                        <Button key={prompt} variant="secondary" size="sm" className="text-xs h-auto py-1.5">
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 