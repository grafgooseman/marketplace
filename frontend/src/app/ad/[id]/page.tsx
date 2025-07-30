"use client"

import { Input } from "@/components/ui/input"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Heart, MoreHorizontal, Star, MessageCircle, Phone, MapPin } from "lucide-react"
import { apiClient, type Ad } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"

type AdPageProps = {
  params: {
    id: string
  }
}

export default function AdPage({ params }: AdPageProps) {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedAds, setRelatedAds] = useState<Ad[]>([])

  useEffect(() => {
    const loadAd = async () => {
      try {
        setLoading(true)
        
        // Load the specific ad
        const adData = await apiClient.getAd(params.id)
        setAd(adData)
        
        // Load related ads for the image gallery
        const relatedResponse = await apiClient.getAds({ limit: 8 })
        setRelatedAds(relatedResponse.ads.filter(relatedAd => relatedAd.id !== params.id))
        
        setError(null)
      } catch (err) {
        console.error('Failed to load ad:', err)
        setError('Failed to load ad details.')
        setAd(null)
      } finally {
        setLoading(false)
      }
    }

    loadAd()
  }, [params.id])

  // Show loading state
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

  // Show error state or not found
  if (error || !ad) {
    notFound()
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

              {/* Image Gallery */}
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 mb-8">
                {[ad.image, ...relatedAds.slice(0, 7).map((a) => a.image)].map((img, index) => (
                  <div
                    key={index}
                    className={`relative aspect-square rounded-md overflow-hidden cursor-pointer ${index === 0 ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

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

              {/* Ad Info */}
              <div className="text-xs text-muted-foreground">
                <p>
                  Ad #{ad.id.slice(-8)} &middot; Posted {new Date(ad.created_at).toLocaleDateString()} &middot; {Math.floor(Math.random() * 100)} views
                </p>
                <Link href="#" className="hover:text-primary hover:underline mt-2 inline-block">
                  Report this ad
                </Link>
              </div>
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
