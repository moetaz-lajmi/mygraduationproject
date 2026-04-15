import { Link } from "react-router-dom"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="BNA Assurances"
              className="h-10 md:h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors"
            >
              Nos Services
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors"
            >
              À Propos
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/login"
              className="px-4 py-2 text-sm font-medium text-[#1a365d] hover:bg-gray-100 rounded-lg transition-colors"
            >
              Connexion
            </Link>
            <Link 
              to="/register"
              className="px-4 py-2 text-sm font-medium bg-[#00a67e] text-white hover:bg-[#00a67e]/90 rounded-lg transition-colors"
            >
              Créer un compte
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <nav className="flex flex-col gap-3">
              <Link
                to="/"
                className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nos Services
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                À Propos
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              <Link 
                to="/login"
                className="w-full px-4 py-2 text-sm font-medium text-center border border-gray-300 text-[#1a365d] hover:bg-gray-50 rounded-lg transition-colors"
              >
                Connexion
              </Link>
              <Link 
                to="/register"
                className="w-full px-4 py-2 text-sm font-medium text-center bg-[#00a67e] text-white hover:bg-[#00a67e]/90 rounded-lg transition-colors"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}