'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [showScroll, setShowScroll] = useState(true)

  // Handle scroll indicator visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScroll(false)
      } else {
        setShowScroll(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigation = (path: string) => {
    setIsNavigating(true)
    router.push(path)
  }

  return (
    <div className="min-h-screen">
      {/* Loading Indicator */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-1">
            <div className="h-full bg-orange-600 animate-[loading_1s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative bg-cover bg-center min-h-screen pt-16" // reduced from pt-20
        style={{
          backgroundImage: `
            linear-gradient(
              150deg,
              rgba(17, 24, 39, 0.95) 0%,
              rgba(30, 58, 138, 0.85) 50%,
              rgba(29, 78, 216, 0.70) 100%
            ),
            url('/img/image.png')
          `,
          backgroundAttachment: 'fixed'
        }}>


        {/* Navbar with glass effect */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#1A2A5B]/90 shadow-lg transition-all duration-300">
          <div className="container mx-auto px-4 sm:px-6 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              {/* Logo with subtle animation */}
              <div className="flex items-center space-x-4 group">
              <img 
                src="/img/circlelogomod.png" 
                alt="Benedicto College Logo" 
                className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-full bg-white p-0.5 transition-transform duration-300 group-hover:scale-105" 
              />
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors duration-300">
                  Benedicto College
                </div>
              </div>

              {/* Enhanced buttons */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Button 
                  variant="secondary" 
                  className="bg-white/90 hover:bg-white text-[#1A2A5B] font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => handleNavigation('/login')}
                  disabled={isNavigating}
                >
                  Student Portal
                </Button>
                <Button 
                  className="bg-blue-500/90 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => handleNavigation('/enrollment')}
                  disabled={isNavigating}
                >
                  Enroll Now
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content - adjust the padding and centering */}
        <div className="container mx-auto px-4 sm:px-6 flex flex-col justify-center items-center min-h-screen -mt-16"> {/* added negative margin */}
          <div className="text-center max-w-4xl animate-fadeIn">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-white leading-tight tracking-tight animate-slideDown">
              Your Education...<br/>
              <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                Our Mission
              </span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 sm:mb-10 mx-auto text-gray-200 max-w-2xl leading-relaxed font-light px-4 animate-slideUp">
              As the preferred higher educational institution in the Asia-Pacific,
              Benedicto College will be a globally competitive institution and a
              catalyst in nation-building, creating a better quality of life and
              developing productive members of the society.
            </p>
            <Button 
              className="bg-blue-600/90 text-white hover:bg-blue-700 px-8 sm:px-12 py-6 sm:py-8 text-base sm:text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
              onClick={() => handleNavigation('/enrollment')}
              disabled={isNavigating}
            >
              Start Your Journey
            </Button>
          </div>

          {/* Animated Scroll Indicator */}
          {showScroll && (
            <div className="absolute bottom-16 -mb-10 left-1/2 transform -translate-x-1/2 text-center transition-opacity duration-500 animate-fadeIn"> {/* removed hidden sm:block */}
              <div className="text-white/90 text-sm mb-3 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg">
                Scroll to explore
              </div>
              <ChevronDown className="w-8 h-8 text-white animate-bounce mx-auto filter drop-shadow-lg" />
            </div>
          )}
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 text-gray-900">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-6 sm:p-8 hover:shadow-lg transition-all duration-300 border-none bg-white shadow-md">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Quality Education</h3>
              <p className="text-gray-600 leading-relaxed">
                Experience world-class education with our expert faculty and modern curriculum designed to prepare you for success in your chosen field. Our programs meet international standards and industry requirements.
              </p>
            </Card>
            <Card className="p-6 sm:p-8 hover:shadow-lg transition-all duration-300 border-none bg-white shadow-md">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Modern Facilities</h3>
              <p className="text-gray-600 leading-relaxed">
                Access state-of-the-art facilities and resources for enhanced learning, including advanced laboratories, digital libraries, sports complexes, and innovative learning spaces designed for collaborative education.
              </p>
            </Card>
            <Card className="p-6 sm:p-8 hover:shadow-lg transition-all duration-300 border-none bg-white shadow-md">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Student Success</h3>
              <p className="text-gray-600 leading-relaxed">
                Join our community of successful graduates and achieve your goals. Our career development programs, industry partnerships, and alumni network provide endless opportunities for professional growth.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-gray-900">Ready to Begin?</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 px-6 sm:px-10 py-5 sm:py-7 text-base sm:text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => handleNavigation('/enrollment')}
              disabled={isNavigating}
            >
              Enroll Now
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto px-6 sm:px-10 py-5 sm:py-7 text-base sm:text-lg font-medium rounded-full border-2 hover:bg-gray-50 transition-all duration-300"
              onClick={() => handleNavigation('/login')}
              disabled={isNavigating}
            >
              Student Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
<footer className="bg-gray-900 text-white py-12 sm:py-16">
  <div className="container mx-auto px-4 sm:px-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
      <div>
        <h4 className="text-xl font-bold mb-6">Contact Us</h4>
        <p className="text-gray-400 mb-2">Email: admissions@benedicto.edu</p>
        <p className="text-gray-400 mb-2">Phone: (123) 456-7890</p>
        <p className="text-gray-400">Address: 123 College Avenue,<br />Metro City, 12345</p>
      </div>
      <div>
        <h4 className="text-xl font-bold mb-6">Quick Links</h4>
        <ul className="space-y-3">
          <li>
            <button 
              onClick={() => handleNavigation('/about')}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              disabled={isNavigating}
            >
              About Us
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigation('/programs')}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              disabled={isNavigating}
            >
              Academic Programs
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigation('/admissions')}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              disabled={isNavigating}
            >
              Admissions
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigation('/campus-life')}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              disabled={isNavigating}
            >
              Campus Life
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigation('/contact')}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              disabled={isNavigating}
            >
              Contact
            </button>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-xl font-bold mb-6">Follow Us</h4>
        <div className="space-y-4">
          <p className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
            Facebook
          </p>
          <p className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
            Twitter
          </p>
          <p className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
            Instagram
          </p>
          <p className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
            LinkedIn
          </p>
        </div>
        <div className="mt-6">
          <h4 className="text-xl font-bold mb-4">Newsletter</h4>
          <p className="text-gray-400 mb-4">Stay updated with our latest news and events.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div className="text-center mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-gray-800">
      <p className="text-gray-500">© 2024 Benedicto College. All rights reserved.</p>
      <div className="mt-4 text-gray-500">
        <span className="mx-2 hover:text-gray-400 cursor-pointer">Privacy Policy</span>
        <span className="mx-2">|</span>
        <span className="mx-2 hover:text-gray-400 cursor-pointer">Terms of Service</span>
        <span className="mx-2">|</span>
        <span className="mx-2 hover:text-gray-400 cursor-pointer">Sitemap</span>
      </div>
    </div>
  </div>
</footer>

<style jsx>{`
        @keyframes loading {
          0% { width: 0; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 1s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 1s ease-out;
        }
      `}</style>
    </div>
  )
}