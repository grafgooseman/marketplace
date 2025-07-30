"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Star, MapPin, SlidersHorizontal, Filter } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { apiClient, type Ad } from "@/lib/api"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const categories = [
  { id: "primary", label: "Primary Weapons" },
  { id: "secondary", label: "Secondary/Pistols" },
  { id: "aeg", label: "AEG (Electric)" },
  { id: "hpa", label: "HPA (High Pressure Air)" },
  { id: "gbb", label: "Gas Blowback (GBB)" },
  { id: "spring", label: "Spring Powered" },
  { id: "gear", label: "Gear & Accessories" },
  { id: "parts", label: "Parts & Upgrades" },
  { id: "uniforms", label: "Uniforms & Clothing" },
  { id: "optics", label: "Optics & Scopes" },
  { id: "magazines", label: "Magazines & Ammo" },
  { id: "batteries", label: "Batteries & Chargers" },
]

const sortOptions = [
  { id: "relevance", label: "Relevance" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "newest", label: "Newest Listings" },
  { id: "oldest", label: "Oldest Listings" },
]

export default function MarketplaceMain() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState("relevance")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Applied filters (only updated when Search button is clicked)
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("")
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 1000])
  const [appliedSortBy, setAppliedSortBy] = useState("relevance")
  
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load ads from API
  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getAds({
          search: appliedSearchQuery || undefined,
          // category: selectedCategories.length > 0 ? selectedCategories : undefined, // Disabled until DB column added
          price_min: appliedPriceRange[0],
          price_max: appliedPriceRange[1],
          sort: appliedSortBy,
          limit: 50 // Get more ads for better filtering
        })
        
        // Transform the data to match the expected format
        const transformedAds = response.ads.map(ad => ({
          ...ad,
          // Ensure price is a number
          price: typeof ad.price === 'string' ? parseFloat(ad.price) : ad.price
        }))
        
        setAds(transformedAds)
        setError(null)
      } catch (err) {
        console.error('Failed to load ads:', err)
        setError('Failed to load ads. Please try again.')
        setAds([]) // Fallback to empty array
      } finally {
        setLoading(false)
      }
    }

    loadAds()
  }, [appliedSearchQuery, appliedPriceRange, appliedSortBy]) // Only trigger when Search button is clicked

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked 
        ? [...prev, categoryId]
        : prev.filter(id => id !== categoryId)
    )
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleApplyFilters = () => {
    setAppliedSearchQuery(searchQuery)
    setAppliedPriceRange(priceRange)
    setAppliedSortBy(sortBy)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ads...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Filters */}
        <aside className="w-full lg:w-80 space-y-6">
          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Search */}
                  <div>
                    <h3 className="font-semibold mb-3">Search</h3>
                    <Input 
                      placeholder="Search ads..." 
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  {/* Categories - Temporarily disabled until database column is added */}
                  {/* <div>
                    <h3 className="font-semibold mb-3">Categories</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mobile-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                          />
                          <Label htmlFor={`mobile-${category.id}`} className="text-sm font-normal cursor-pointer">
                            {category.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div> */}

                  {/* Price Range */}
                  <div>
                    <h3 className="font-semibold mb-3">Price Range</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="w-20"
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <h3 className="font-semibold mb-3">Sort By</h3>
                    <RadioGroup value={sortBy} onValueChange={setSortBy}>
                      {sortOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={`mobile-${option.id}`} />
                          <Label htmlFor={`mobile-${option.id}`} className="text-sm font-normal cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Search Button */}
                  <div>
                    <Button onClick={handleApplyFilters} className="w-full">
                      Search
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:block space-y-6">
            {/* Search */}
            <div>
              <h3 className="font-semibold mb-3">Search</h3>
              <Input 
                placeholder="Search ads..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Categories - Temporarily disabled until database column is added */}
            {/* <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    />
                    <Label htmlFor={category.id} className="text-sm font-normal cursor-pointer">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Price Range */}
            <div>
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-20"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-20"
                  />
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="font-semibold mb-3">Sort By</h3>
              <RadioGroup value={sortBy} onValueChange={setSortBy}>
                {sortOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="text-sm font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Search Button */}
            <div>
              <Button onClick={handleApplyFilters} className="w-full">
                Search
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="grid gap-4">
            {ads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No ads found matching your criteria.</p>
              </div>
            ) : (
              ads.map((ad) => (
                <Link href={`/ad/${ad.id}`} key={ad.id} className="block">
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                      {/* Image */}
                      <div className="relative w-full sm:w-48 flex-shrink-0 aspect-video sm:aspect-auto">
                        <Image src={ad.image || "/placeholder.svg"} alt={ad.title} fill className="object-cover" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`absolute top-2 right-2 h-8 w-8 bg-background/60 hover:bg-background/80 ${ad.is_favorite ? "text-red-500" : "text-gray-400"}`}
                        >
                          <Heart className={`h-4 w-4 ${ad.is_favorite ? "fill-current" : ""}`} />
                        </Button>
                      </div>
                      {/* Content */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{ad.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ad.description}</p>
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{ad.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                            <span>{ad.rating || 'N/A'}</span>
                            <span className="mx-2">•</span>
                            <span>{ad.seller}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-2xl font-bold">${ad.price}</span>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
