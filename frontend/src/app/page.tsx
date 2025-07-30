import Header from "@/components/header";
import Footer from "@/components/footer";
import MarketplaceMain from "@/components/marketplace-main";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug section - remove this after fixing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 p-4 mb-4">
          <h3 className="font-bold">Debug Info:</h3>
          <p>NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
          <p>API_BASE_URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}</p>
        </div>
      )}
      
      <MarketplaceMain />
    </div>
  )
}
