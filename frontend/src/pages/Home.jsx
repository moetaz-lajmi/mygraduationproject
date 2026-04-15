import Header from "../components/Header"
import HeroSection from "../components/HeroSections";
import ServicesSection from "../components/ServicesSection"
import Footer from "../components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
      </main>
      <Footer />
    </div>
  )
}