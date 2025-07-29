import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ads from "@/data/ads.json"

type AdLayoutProps = {
  children: React.ReactNode
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const adId = Number.parseInt(params.id, 10)
  const ad = ads.find((a) => a.id === adId)

  if (!ad) {
    return {
      title: "Ad Not Found | Goose Exchange",
      description: "The requested airsoft ad could not be found.",
    }
  }

  return {
    title: `${ad.title} - $${ad.price} | Goose Exchange`,
    description: ad.description,
    openGraph: {
      title: `${ad.title} - $${ad.price}`,
      description: ad.description,
      type: "website",
      images: [
        {
          url: ad.image,
          width: 1200,
          height: 630,
          alt: ad.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${ad.title} - $${ad.price}`,
      description: ad.description,
      images: [ad.image],
    },
  }
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
