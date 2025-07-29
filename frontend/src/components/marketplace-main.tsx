"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Star, MapPin, SlidersHorizontal, Filter } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import mockAds from "../data/ads.json"
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
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [selectedSortOption, setSelectedSortOption] = useState("relevance")
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false)

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories((prev) => (checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)))
  }

  const handleClearCategories = () => {
    setSelectedCategories([])
  }

  const handleSortChange = (value: string) => {
    setSelectedSortOption(value)
    setIsSortDialogOpen(false) // Close dialog on selection
  }

  // Determine if Replica Series filter should be shown
  const showReplicaSeries = selectedCategories.some((id) =>
    ["primary", "secondary", "aeg", "hpa", "gbb", "spring"].includes(id),
  )

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Airsoft Gear: listings <span className="text-muted-foreground">{mockAds.length}</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-4">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              {/* Filters will be duplicated here for the sheet */}
              <div className="space-y-6">
                {/* Price Filter */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Price, $</h3>
                    <div className="flex space-x-2">
                      <Input placeholder="From" className="flex-1" />
                      <Input placeholder="To" className="flex-1" />
                    </div>
                  </CardContent>
                </Card>

                {/* Category Filter */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Categories</h3>
                      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Select
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Select Categories</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 gap-3 mt-4 max-h-96 overflow-y-auto">
                            {categories.map((category) => (
                              <div key={category.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`mobile-${category.id}`}
                                  checked={selectedCategories.includes(category.id)}
                                  onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                                />
                                <label
                                  htmlFor={`mobile-${category.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {category.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end mt-6">
                            <Button variant="outline" size="sm" onClick={handleClearCategories}>
                              Clear All
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {selectedCategories.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedCategories.map((categoryId) => {
                          const category = categories.find((c) => c.id === categoryId)
                          return (
                            <Badge key={categoryId} variant="secondary">
                              {category?.label}
                            </Badge>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Click "Select" to choose categories</div>
                    )}
                  </CardContent>
                </Card>

                {/* Replica Series Filter */}
                {showReplicaSeries && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Replica Series</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-ak-series" />
                          <label htmlFor="mobile-ak-series" className="text-sm">
                            AK Series
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-m4-series" />
                          <label htmlFor="mobile-m4-series" className="text-sm">
                            M4 Series
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-ar15-series" />
                          <label htmlFor="mobile-ar15-series" className="text-sm">
                            AR-15 Series
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-mp5-series" />
                          <label htmlFor="mobile-mp5-series" className="text-sm">
                            MP5 Series
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-g36-series" />
                          <label htmlFor="mobile-g36-series" className="text-sm">
                            G36 Series
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-scar-series" />
                          <label htmlFor="mobile-scar-series" className="text-sm">
                            SCAR Series
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-glock-series" />
                          <label htmlFor="mobile-glock-series" className="text-sm">
                            Glock Series
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-1911-series" />
                          <label htmlFor="mobile-1911-series" className="text-sm">
                            1911 Series
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Seller Rating */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Seller Rating</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="mobile-4stars" />
                        <div className="flex items-center">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <Star className="h-4 w-4 text-gray-300" />
                          <span className="text-sm ml-1">4 stars & up</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Keywords */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Keywords in description</h3>
                    <Input placeholder="Something specific for you" />
                  </CardContent>
                </Card>

                <Button className="w-full">Show listings</Button>
              </div>
            </SheetContent>
          </Sheet>
          {/* Sort Dialog remains */}
          <Dialog open={isSortDialogOpen} onOpenChange={setIsSortDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs">
              <DialogHeader>
                <DialogTitle>Sort By</DialogTitle>
              </DialogHeader>
              <RadioGroup value={selectedSortOption} onValueChange={handleSortChange} className="grid gap-2 py-4">
                {sortOptions.map((option) => (
                  <div key={option.id} className="flex items-center">
                    <RadioGroupItem value={option.id} id={`sort-${option.id}`} />
                    <Label htmlFor={`sort-${option.id}`} className="ml-2 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-80 shrink-0 space-y-6">
          {/* Price Filter */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Price, $</h3>
              <div className="flex space-x-2">
                <Input placeholder="From" className="flex-1" />
                <Input placeholder="To" className="flex-1" />
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Categories</h3>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Select
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Select Categories</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3 mt-4 max-h-96 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                          />
                          <label
                            htmlFor={category.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {category.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-6">
                      {" "}
                      {/* Changed to justify-end */}
                      <Button variant="outline" size="sm" onClick={handleClearCategories}>
                        Clear All
                      </Button>
                      {/* Removed Apply Filters button */}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {selectedCategories.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCategories.map((categoryId) => {
                    const category = categories.find((c) => c.id === categoryId)
                    return (
                      <Badge key={categoryId} variant="secondary">
                        {category?.label}
                      </Badge>
                    )
                  })}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Click "Select" to choose categories</div>
              )}
            </CardContent>
          </Card>

          {/* Replica Series Filter - Conditionally rendered */}
          {showReplicaSeries && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Replica Series</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ak-series" />
                    <label htmlFor="ak-series" className="text-sm">
                      AK Series
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="m4-series" />
                    <label htmlFor="m4-series" className="text-sm">
                      M4 Series
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ar15-series" />
                    <label htmlFor="ar15-series" className="text-sm">
                      AR-15 Series
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mp5-series" />
                    <label htmlFor="mp5-series" className="text-sm">
                      MP5 Series
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="g36-series" />
                    <label htmlFor="g36-series" className="text-sm">
                      G36 Series
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="scar-series" />
                    <label htmlFor="scar-series" className="text-sm">
                      SCAR Series
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="glock-series" />
                    <label htmlFor="glock-series" className="text-sm">
                      Glock Series
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="1911-series" />
                    <label htmlFor="1911-series" className="text-sm">
                      1911 Series
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seller Rating */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Seller Rating</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="4stars" />
                  <div className="flex items-center">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="h-4 w-4 text-gray-300" />
                    <span className="text-sm ml-1">4 stars & up</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Keywords in description</h3>
              <Input placeholder="Something specific for you" />
            </CardContent>
          </Card>

          <Button className="w-full">Show more than 1k listings</Button>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="grid gap-4">
            {mockAds.map((ad) => (
              <Link href={`/ad/${ad.id}`} key={ad.id} className="block">
                <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                    {/* Image */}
                    <div className="relative w-full sm:w-48 flex-shrink-0 aspect-video sm:aspect-auto">
                      <Image src={ad.image || "/placeholder.svg"} alt={ad.title} fill className="object-cover" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`absolute top-2 right-2 h-8 w-8 bg-background/60 hover:bg-background/80 ${ad.isFavorite ? "text-red-500" : "text-gray-400"}`}
                      >
                        <Heart className={`h-4 w-4 ${ad.isFavorite ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        <div className="text-right">
                          <div className="text-xl font-bold">${ad.price}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{ad.location}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ad.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{ad.seller}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">{String(ad.rating)}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Airsoft
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
