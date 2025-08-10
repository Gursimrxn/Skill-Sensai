import Navbar from '@/components/Navbar';
import { ProgressiveBlur } from '@/components/ui/ProgressiveBlur';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='bg-[#FFFCF4]'>
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "url('/illustration.png')"
        }}
        >
        <Navbar />

        {/* Hero Section */}
        <section className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="max-w-6xl mx-auto px-4 text-center">
            {/* Tagline */}
            <div className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm mb-8">
              The Smarter Way to Level Up — Together
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Skill Sensai is Where<br />
              Skills Meet, Grow, and Evolve
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-black mb-8 max-w-2xl mx-auto">
              List what you know. Request what you want to learn. Connect with<br />
              real people for real growth — one swap at a time.
            </p>
            
            {/* CTA Button */}
            <button 
              className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-200 inline-flex items-center space-x-2 transform hover:scale-105 cursor-pointer"
            >
              <span>Learn Something New</span>
              <span className="transition-transform duration-200">→</span>
            </button>
          </div>
        </section>
      </div>

      {/* Section with Background Image */}
      <section className='bg-black h-screen w-full overflow-hidden flex flex-col rounded-b-[40px] justify-between text-white bg-cover bg-bottom bg-no-repeat relative pointer-events-none select-none'
        style={{
          backgroundImage: "url('/section.svg')"
        }}
      >
        <h2 className='text-4xl md:text-6xl font-bold text-white mt-12 leading-tight max-w-4xl mx-auto text-center mix-blend-difference'>
          Ready to turn your knowledge into a two-way street?
        </h2>
        
        <ProgressiveBlur
          className='pointer-events-none bottom-0 left-0 h-1/2 w-screen'
          blurIntensity={0.8}
        />
      </section>
      <footer className='bg-[#FFFCF4] min-h-40 flex flex-col py-2 justify-around max-w-6xl mx-auto'>
        <Navbar />
        <div className='flex justify-between items-center text-center md:text-left text-black px-4 gap-2'>
          <div>Designed and Developed by</div>
            <div className="flex-1 flex items-center min-w-[120px] min-h-[32px]">
              <svg width="100%" height="100%" viewBox="0 0 533 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <path d="M532.854 16.8536C533.049 16.6583 533.049 16.3417 532.854 16.1464L529.672 12.9645C529.476 12.7692 529.16 12.7692 528.964 12.9645C528.769 13.1597 528.769 13.4763 528.964 13.6716L531.793 16.5L528.964 19.3284C528.769 19.5237 528.769 19.8403 528.964 20.0355C529.16 20.2308 529.476 20.2308 529.672 20.0355L532.854 16.8536ZM0 16.5V17H532.5V16.5V16H0V16.5Z" fill="#6F4EB0"/>
              </svg>
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-base text-center justify-center md:justify-end">
              <Link
              href="https://github.com/gursimrxn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-700 transition-colors break-all"
              >
              Gursimran Singh
              </Link>
              <span className="hidden md:inline">|</span>
              <Link
              href="https://github.com/ekas-7"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-700 transition-colors break-all"
              >
              Ekaspreet Singh
              </Link>
              <span className="hidden md:inline">|</span>
              <Link
              href="https://github.com/0aagam"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-700 transition-colors break-all"
              >
              Aagam Jain
              </Link>
              <span className="hidden md:inline">|</span>
              <Link
              href="https://github.com/singhjashanjot"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-700 transition-colors break-all"
              >
              Jashanjot Singh
              </Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
