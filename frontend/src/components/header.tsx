"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, User, Calendar } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Plus, Settings, LogOut, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

export default function Header() {
  const { user, logout, isAuthenticated, loading } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-xl text-foreground">Goose Exchange</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-2xl mx-8">
          {/* Search Bar - Prominent */}
          {/* <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search airsoft gear, guns, accessories..."
              className="pl-10 pr-4 h-12 text-base bg-muted/50 border-2 border-muted focus:border-primary focus:bg-background transition-all duration-200"
            />
          </div> */}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile Search Button */}
          {/* <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button> */}

          {/* Events Button */}
          <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden lg:inline">Events</span>
          </Button>

          {/* Mobile Events Button */}
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Calendar className="h-5 w-5" />
            <span className="sr-only">Events</span>
          </Button>

          {/* Authentication Section */}
          {loading ? (
            <div className="animate-pulse bg-muted rounded-md h-10 w-20"></div>
          ) : isAuthenticated ? (
            /* Account Dropdown with Visual Indicators */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center space-x-1 px-3 py-2 h-10">
                  <div className="relative">
                    <User className="h-5 w-5" />
                    {/* Messages notification badge */}
                    {/* <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
                      3
                    </Badge> */}
                  </div>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                  <span className="sr-only">Account menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || user?.email || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem className="cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </div>
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">3</Badge>
                  </div>
                </DropdownMenuItem>
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>My Ads</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="cursor-pointer">
                  <Heart className="mr-2 h-4 w-4" />
                  <span>My Wishlist</span>
                </DropdownMenuItem> */}
                {/* <DropdownMenuSeparator /> */}
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Login/Signup Buttons for Unauthenticated Users */
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Join Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {/* <div className="md:hidden px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search airsoft gear..."
            className="pl-10 pr-4 h-11 bg-muted/50 border-2 border-muted focus:border-primary focus:bg-background transition-all duration-200"
          />
        </div>
      </div> */}
    </header>
  )
}
