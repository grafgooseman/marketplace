import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"

type AdLayoutProps = {
  children: React.ReactNode
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: "Ad Details - Goose Exchange",
  description: "View airsoft gear details and specifications.",
}

export default function AdLayout({ children, params }: AdLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
