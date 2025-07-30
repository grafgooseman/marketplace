"use client"

import { useState } from "react"
import { withAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Star, Package, Heart } from "lucide-react"


function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "",
    location: "",
    bio: "",
  })

  const myAds = [
    {
      id: 1,
      title: "Tokyo Marui AK-47 GBBR",
      price: "$450",
      status: "Active",
      views: 234,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      title: "Complete Tactical Gear Set",
      price: "$280",
      status: "Sold",
      views: 156,
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  const wishlistItems = [
    {
      id: 1,
      title: "Krytac Trident MK2 CRB",
      price: "$380",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt="John Doe" />
                <AvatarFallback className="text-2xl">JD</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-transparent"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">John Doe</h1>
              <p className="text-muted-foreground">john@example.com</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  4.8 Rating
                </Badge>
                <Badge variant="outline">Member since 2023</Badge>
              </div>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="ads">My Ads</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile information and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={!isEditing}
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself and your airsoft interests..."
                      rows={4}
                    />
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ads">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    My Ads ({myAds.length})
                  </CardTitle>
                  <CardDescription>Manage your active and sold listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myAds.map((ad) => (
                      <div key={ad.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={ad.image || "/placeholder.svg"}
                          alt={ad.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{ad.title}</h3>
                          <p className="text-sm text-muted-foreground">{ad.views} views</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{ad.price}</p>
                          <Badge variant={ad.status === "Active" ? "default" : "secondary"}>{ad.status}</Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Wishlist ({wishlistItems.length})
                  </CardTitle>
                  <CardDescription>Items you're interested in buying</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="font-bold text-primary">{item.price}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences and security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Notifications</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">New messages</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Price drops on wishlist items</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span className="text-sm">Marketing emails</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default withAuth(ProfilePage)
