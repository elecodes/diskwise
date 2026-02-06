import { useEffect, useRef } from 'react';
import { Download, ChevronRight, Sparkles } from 'lucide-react';
import { ParticleField } from '@/components/ParticleField';

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = contentRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Particle Background */}
      <ParticleField />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div
              className="reveal opacity-0 translate-y-8 transition-all duration-700 delay-100 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 mb-6"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-sm text-[#f59e0b]">Free Disk Cleanup Tool</span>
            </div>

            {/* Headline */}
            <h1 className="reveal opacity-0 translate-y-8 transition-all duration-700 delay-200 text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Clean Your{' '}
              <span className="text-gradient">Disk</span>
              <br />
              Like a Pro
            </h1>

            {/* Subheadline */}
            <p
              className="reveal opacity-0 translate-y-8 transition-all duration-700 delay-300 text-lg sm:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              Powerful, intelligent disk cleanup that knows what to keep and what to
              delete. Free up gigabytes in seconds with color-coded safety indicators.
            </p>

            {/* CTA Buttons */}
            <div
              className="reveal opacity-0 translate-y-8 transition-all duration-700 delay-400 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <button
                onClick={() => scrollToSection('download')}
                className="btn-primary flex items-center justify-center gap-2 group"
              >
                <Download className="w-5 h-5" />
                Download Free
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="btn-secondary flex items-center justify-center gap-2 group"
              >
                See How It Works
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Stats */}
            <div
              className="reveal opacity-0 translate-y-8 transition-all duration-700 delay-500 mt-12 grid grid-cols-3 gap-6"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {[
                { value: '10M+', label: 'Downloads' },
                { value: '50GB', label: 'Avg. Cleaned' },
                { value: '99.9%', label: 'Safe' },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div
            className="reveal opacity-0 translate-x-12 transition-all duration-1000 delay-600 relative hidden lg:block"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="relative animate-float">
              {/* Main Circle */}
              <div className="relative w-80 h-80 mx-auto">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-[#f59e0b]/20" />
                
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="160"
                    cy="160"
                    r="150"
                    fill="none"
                    stroke="rgba(255, 107, 53, 0.1)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="150"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${0.75 * 2 * Math.PI * 150} ${2 * Math.PI * 150}`}
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Inner Content */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#1a1a1a] to-black flex flex-col items-center justify-center">
                  <span className="text-6xl font-bold text-white">75%</span>
                  <span className="text-gray-400 mt-2">Disk Used</span>
                  <div className="mt-4 px-4 py-1 rounded-full bg-[#10b981]/20 text-[#10b981] text-sm">
                    12GB Safe to Delete
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-xl bg-[#1a1a1a] border border-[#f59e0b]/30 flex flex-col items-center justify-center animate-float-slow">
                <span className="text-2xl font-bold text-[#f59e0b]">2.1</span>
                <span className="text-xs text-gray-400">GB Cache</span>
              </div>

              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-xl bg-[#1a1a1a] border border-[#10b981]/30 flex flex-col items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                <span className="text-2xl font-bold text-[#10b981]">8.5</span>
                <span className="text-xs text-gray-400">GB Temp</span>
              </div>

              <div className="absolute top-1/2 -right-8 w-16 h-16 rounded-lg bg-[#1a1a1a] border border-yellow-500/30 flex flex-col items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
                <span className="text-lg font-bold text-yellow-500">1.4</span>
                <span className="text-xs text-gray-400">GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      <style>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) translateX(0) !important;
        }
      `}</style>
    </section>
  );
}
