"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { MessageSquare, Users, Shield, Sparkles, ChevronRight } from "lucide-react"

export default function Landing() {
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const floatingElementsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    setIsLoaded(true)
    
    // Create floating animation elements
    const createFloatingElement = () => {
      if (!containerRef.current) return
      
      const element = document.createElement("div")
      element.className = "floating-element"
      element.style.left = `${Math.random() * 100}%`
      element.style.top = `${Math.random() * 100}%`
      element.style.animationDelay = `${Math.random() * 5}s`
      
      containerRef.current.appendChild(element)
      floatingElementsRef.current.push(element)
      
      setTimeout(() => {
        if (element.parentNode) {
          element.remove()
        }
        // Remove from our ref array
        floatingElementsRef.current = floatingElementsRef.current.filter(el => el !== element)
      }, 15000)
    }

    // Create initial floating elements
    for (let i = 0; i < 15; i++) {
      setTimeout(() => createFloatingElement(), i * 300)
    }

    // Keep adding floating elements periodically
    const interval = setInterval(() => {
      createFloatingElement()
    }, 2000)

    return () => {
      clearInterval(interval)
      // Clean up any remaining floating elements
      floatingElementsRef.current.forEach(element => {
        if (element.parentNode) {
          element.remove()
        }
      })
      floatingElementsRef.current = []
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Connect with your partner in a secure space</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-pink-300">
              Chat with Partner
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            A private, secure messaging platform designed exclusively for couples to connect, share, and grow together.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full max-w-4xl"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-xl mb-4">
              <MessageSquare className="w-6 h-6 text-cyan-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Private Conversations</h3>
            <p className="text-gray-400">End-to-end encrypted messaging that keeps your conversations just between you two.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-500/20 rounded-xl mb-4">
              <Users className="w-6 h-6 text-pink-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Shared Moments</h3>
            <p className="text-gray-400">Create shared memories with photos, videos, and voice messages in your private space.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-xl mb-4">
              <Shield className="w-6 h-6 text-green-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Safe</h3>
            <p className="text-gray-400">Your data is protected with bank-level security. Privacy is our top priority.</p>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-8">Start Your Private Journey Today</h2>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30"
            >
              <span>Create Your Account</span>
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-50 blur-md -z-10 group-hover:opacity-70 transition-opacity"></div>
            </Link>
            
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <span>Existing User? Sign In</span>
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <p className="text-gray-400 text-sm">
            Join thousands of couples who trust us with their private conversations.
            <br />
            No credit card required. Start free forever.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-white/10 w-full max-w-4xl"
        >
          <div className="text-center">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-white">50K+</div>
            <div className="text-gray-400">Happy Couples</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-white">10M+</div>
            <div className="text-gray-400">Messages Sent</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white">99.9%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-white">24/7</div>
            <div className="text-gray-400">Support</div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="relative z-10 py-6 text-center border-t border-white/10"
      >
        <div className="container mx-auto px-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Chat with Partner. All rights reserved. 
            <span className="mx-2">•</span>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <span className="mx-2">•</span>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
          </p>
        </div>
      </motion.footer>

      {/* Custom CSS for floating elements */}
      <style jsx global>{`
        .floating-element {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          animation: float 15s linear infinite;
        }
        
        .floating-element:nth-child(3n) {
          width: 6px;
          height: 6px;
          background: rgba(103, 232, 249, 0.6);
        }
        
        .floating-element:nth-child(3n+1) {
          width: 3px;
          height: 3px;
          background: rgba(236, 72, 153, 0.6);
        }
        
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}