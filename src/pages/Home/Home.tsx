/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, CSSProperties } from "react";
import { BarChart, Shield, Package } from "lucide-react";
import EvoteMockupImage from "./MockupUI";
import TimeCountDown from "./Home-time-counter";

// Define custom CSS Properties interface to allow for custom properties
interface CustomCSSProperties extends CSSProperties {
  '--x-offset'?: string;
  '--y-offset'?: string;
}

const EVotingPlatform: React.FC = () => {
  const shinyTextRef = useRef<HTMLSpanElement | null>(null);
  
  useEffect(() => {
    const shinyText = shinyTextRef.current;
    if (!shinyText) return;
    
    const handleMouseMove = (e: MouseEvent): void => {
      const { left, top, width, height } = shinyText.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      const offsetX = ((x - centerX) / centerX) * 25;
      const offsetY = ((y - centerY) / centerY) * 25;
      
      shinyText.style.setProperty('--x-offset', `${offsetX}%`);
      shinyText.style.setProperty('--y-offset', `${offsetY}%`);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white">
      {/* Main content */}
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-6">
            <span className="inline-flex items-center bg-purple-50 text-indigo-600 px-4 py-1 rounded-full text-sm">
              <span className="h-2 w-2 bg-gradient-to-tr from-violet-300 to-violet-600 rounded-full mr-2"></span>
              Updated: Blockchain Integrated
            </span>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              <span 
                ref={shinyTextRef}
                className="inline-block relative animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #a78bfa, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shine 3s ease-in-out infinite',
                  textShadow: '0 0 5px rgba(139, 92, 246, 0.3)',
                  '--x-offset': '0%',
                  '--y-offset': '0%',
                } as CustomCSSProperties}
              >
                BlockVote
              </span>
              <style jsx global>{`
                @keyframes gradient-shine {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }
              `}</style>
              , the trusted platform for
              <br />
              Blockchain-Powered Voting
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Cast your vote with confidence using our blockchain-driven tools.
              Secure, transparent, and seamless—your gateway to the future of
              democracy.
            </p>
          </div>

          {/* Dashboard Preview */}
          <EvoteMockupImage />
          <TimeCountDown />
        </section>
      </main>
      {/* Features Section */}
      {/* <Features /> */}

      <section className="container mx-auto px-4 py-16 bg-gradient-to-b from-purple-100 to-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose BlockVote?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge blockchain technology with
            user-friendly design to ensure secure, transparent, and accessible
            democratic participation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="bg-indigo-100 p-3 rounded-lg inline-block mb-4">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Unmatched Security</h3>
            <p className="text-gray-600">
              Military-grade encryption and blockchain verification ensures your
              vote remains secure and tamper-proof.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="bg-indigo-100 p-3 rounded-lg inline-block mb-4">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Complete Transparency
            </h3>
            <p className="text-gray-600">
              Publicly verifiable blockchain ledger makes the entire voting
              process transparent while maintaining voter privacy.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="bg-indigo-100 p-3 rounded-lg inline-block mb-4">
              <BarChart className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Results</h3>
            <p className="text-gray-600">
              Access accurate, real-time election results with detailed
              analytics and verification tools.
            </p>
          </div>
        </div>
      </section>
    {/* <Footer/> */}
    
    </div>
  );
};

export default EVotingPlatform;