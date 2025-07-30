"use client"

import { useState, useEffect } from "react"
import { withAuth, useAuth } from "@/contexts/AuthContext"
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
  const { user, updateUser, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  })
  const [dataLoaded, setDataLoaded] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('Profile Page - Auth State:', { user, loading })
    if (user) {
      console.log('User object:', user)
      console.log('User metadata:', user.user_metadata)
    }
  }, [user, loading])

  // Initialize form data when user data is available
  useEffect(() => {
    if (user && !loading) {
      console.log('Setting form data from user:', user)
      const userData = {
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        location: "", // Not available in current user schema, keeping as empty
        bio: "", // Not available in current user schema, keeping as empty
      }
      console.log('Form data being set:', userData)
      setFormData(userData)
      setDataLoaded(true)
    }
  }, [user, loading])

  const handleSave = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      await updateUser({
        email: formData.email,
        user_metadata: {
          full_name: formData.name,
          phone: formData.phone,
          // Note: location and bio are not currently supported by the backend
          // but we keep them in the form for potential future use
        }
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      // You might want to show an error toast here
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        location: "",
        bio: "",
      })
    }
    setIsEditing(false)
  }

  // Get user initials for avatar fallback
  const getUserInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  // Get display name - prefer full name, fallback to email username, then Anonymous
  const getDisplayName = () => {
    if (formData.name && formData.name.trim()) {
      return formData.name.trim()
    }
    if (formData.email) {
      const emailUsername = formData.email.split('@')[0]
      return emailUsername || "User"
    }
    return "User"
  }

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

  // Show loading until we have user data loaded
  if (loading || !user || !dataLoaded) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your profile...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={getDisplayName()} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(formData.name, formData.email)}
                </AvatarFallback>
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
              <h1 className="text-3xl font-bold">{getDisplayName()}</h1>
              <p className="text-muted-foreground">{formData.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  4.8 Rating
                </Badge>
                <Badge variant="outline">Member since 2023</Badge>
              </div>
            </div>
            <Button 
              onClick={() => isEditing ? handleCancel() : setIsEditing(true)} 
              variant={isEditing ? "outline" : "default"}
              disabled={isSaving}
            >
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
                        placeholder="Enter your full name"
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
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
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
