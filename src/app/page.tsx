'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

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
            <div className="h-full bg-blue-600 animate-[loading_1s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative bg-cover bg-center min-h-screen" 
        style={{
          backgroundImage: `
            linear-gradient(
              150deg,
              rgba(17, 24, 39, 0.98) 0%,    /* Darkest blue (almost black-blue) */
              rgba(30, 58, 138, 0.90) 50%,   /* Very dark blue */
              rgba(29, 78, 216, 0.75) 100%   /* Dark royal blue */
            ),
            url('/img/image.png')
          `
        }}>
        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent">
          <div className="container mx-auto px-6 py-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Logo Image */}
              <img 
                src="/img/circlelogomod.png" 
                alt="Benedicto College Logo" 
                className="w-20 h-20 object-contain rounded-full" 
              />
              {/* College Name */}
              <div className="text-3xl font-bold text-white tracking-tight">
                Benedicto College
              </div>
            </div>
            <div className="space-x-4">
              <Button 
                variant="secondary" 
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
                onClick={() => handleNavigation('/login')}
                disabled={isNavigating}
              >
                Student Portal
              </Button>
              <Button 
                className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
                onClick={() => handleNavigation('/enrollment')}
                disabled={isNavigating}
              >
                Enroll Now
              </Button>
            </div>
          </div>
        </nav>


        {/* Hero Content */}
        <div className="container mx-auto px-6 flex flex-col justify-center items-center h-screen">
          <div className="text-center max-w-4xl">
            <h1 className="text-6xl font-bold mb-8 text-white leading-tight tracking-tight">
              Your Education...<br/>Our Mission
            </h1>
            <p className="text-xl mb-10 mx-auto text-gray-200 max-w-2xl leading-relaxed font-light">
              As the preferred higher educational institution in the Asia-Pacific,
              Benedicto College will be a globally competitive institution and a
              catalyst in nation-building, creating a better quality of life and
              developing productive members of the society.
            </p>
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-7 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => handleNavigation('/enrollment')}
              disabled={isNavigating}
            >
              Start Your Journey
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-white/90 text-sm mb-3 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20">
              Scroll to explore
            </div>
            <ChevronDown className="w-6 h-6 text-white animate-bounce mx-auto" />
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-all duration-300 border-none bg-white shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Quality Education</h3>
              <p className="text-gray-600 leading-relaxed">
                Experience world-class education with our expert faculty and modern curriculum.
              </p>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-all duration-300 border-none bg-white shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Modern Facilities</h3>
              <p className="text-gray-600 leading-relaxed">
                Access state-of-the-art facilities and resources for enhanced learning.
              </p>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-all duration-300 border-none bg-white shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Student Success</h3>
              <p className="text-gray-600 leading-relaxed">
                Join our community of successful graduates and achieve your goals.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-10 text-gray-900">Ready to Begin?</h2>
          <div className="space-x-6">
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-7 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => handleNavigation('/enrollment')}
              disabled={isNavigating}
            >
              Enroll Now
            </Button>
            <Button 
              variant="outline" 
              className="px-10 py-7 text-lg font-medium rounded-full border-2 hover:bg-gray-50 transition-all duration-300"
              onClick={() => handleNavigation('/login')}
              disabled={isNavigating}
            >
              Student Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-xl font-bold mb-6">Contact Us</h4>
              <p className="text-gray-400 mb-2">Email: contact@school.edu</p>
              <p className="text-gray-400">Phone: (123) 456-7890</p>
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
                    Programs
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
              <div className="space-x-4">
                {/* Add social media icons/links here */}
              </div>
            </div>
          </div>
          <div className="text-center mt-12 pt-12 border-t border-gray-800">
            <p className="text-gray-500">© 2024 Benedicto College. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}