import { useEffect, useRef, useState } from 'react';
import { Download, Check, Monitor, Apple } from 'lucide-react';

const platforms = [
  { icon: Monitor, label: 'Windows', version: '10/11' },
  { icon: Apple, label: 'macOS', version: '12+' },
  { icon: Monitor, label: 'Linux', version: 'Ubuntu 20+' },
];

const features = [
  '100% Free, no ads',
  'Open source',
  'No data collection',
  'Lightweight (< 10MB)',
];

export function DownloadSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => {
                el.classList.add('animate-in');
              }, i * 150);
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="download"
      ref={sectionRef}
      className="relative py-32 bg-black overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full animate-gradient-shift"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2 className="reveal opacity-0 translate-y-8 transition-[opacity,transform] duration-700 text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Ready to Clean Your{' '}
          <span className="text-gradient">Disk</span>?
        </h2>

        {/* Subheadline */}
        <p
          className="reveal opacity-0 translate-y-8 transition-[opacity,transform] duration-700 delay-100 text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          Download DiskWise for free and reclaim your storage space today. No ads,
          no tracking, just a clean disk.
        </p>

        {/* Feature List */}
        <div
          className="reveal opacity-0 translate-y-8 transition-[opacity,transform] duration-700 delay-200 flex flex-wrap justify-center gap-4 mb-10"
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-sm text-gray-300"
            >
              <Check className="w-4 h-4 text-[#f59e0b]" />
              {feature}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div
          className="reveal opacity-0 translate-y-8 transition-[opacity,transform] duration-700 delay-300 mb-12"
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <button
            className="relative group outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:ring-offset-8 focus-visible:ring-offset-black rounded-xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Download DiskWise for your platform"
          >
            <div
              className={`absolute inset-0 rounded-xl bg-[#f59e0b] blur-xl transition-opacity duration-300 ${
                isHovered ? 'opacity-60' : 'opacity-30'
              }`}
            />
            <div className="relative px-12 py-5 rounded-xl bg-[#f59e0b] text-white font-bold text-lg flex items-center gap-3 transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
              <Download className="w-6 h-6" />
              Download Now
            </div>
          </button>
          <p className="mt-4 text-sm text-gray-500">v2.1.0 • Released Jan&nbsp;2025</p>
        </div>

        {/* Platform Icons */}
        <div
          className="reveal opacity-0 translate-y-8 transition-[opacity,transform] duration-700 delay-400"
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <p className="text-sm text-gray-500 mb-4">Available for</p>
          <div className="flex justify-center gap-8">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.label}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center transition-[background-color,transform] duration-300 group-hover:bg-[#f59e0b]/20 group-hover:scale-110">
                    <Icon className="w-6 h-6 text-gray-400 transition-colors duration-300 group-hover:text-[#f59e0b]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-300">{platform.label}</p>
                    <p className="text-xs text-gray-500">{platform.version}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .reveal.animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
}
