import { useEffect, useRef } from 'react';
import { Search, Shield, Archive, Zap } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Intelligent Scanning',
    description:
      'Advanced algorithms identify safe-to-delete files with 99.9% accuracy. No more guessing what\'s safe to remove.',
    color: '#ff6b35',
  },
  {
    icon: Shield,
    title: 'Safe to Delete',
    description:
      'Color-coded safety indicators show exactly what\'s safe to delete, what needs review, and what to keep.',
    color: '#4caf50',
  },
  {
    icon: Archive,
    title: 'Smart Compression',
    description:
      'Compress large files instead of deleting them. Save space while keeping your files accessible.',
    color: '#2196f3',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Free up gigabytes in seconds with one-click cleanup. Optimized for speed and efficiency.',
    color: '#ffc107',
  },
];

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.feature-card');
            cards.forEach((card, i) => {
              setTimeout(() => {
                card.classList.add('animate-in');
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
      id="features"
      ref={sectionRef}
      className="relative py-32 bg-black overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#ff6b35]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Powerful <span className="text-gradient">Features</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Everything you need to keep your disk clean and optimized
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="feature-card opacity-0 translate-y-12 transition-all duration-700 group"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className="relative h-full p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-[#ff6b35]/50 transition-all duration-300 card-hover">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Icon
                      className="w-7 h-7 transition-colors duration-300"
                      style={{ color: feature.color }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                  {/* Hover Glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${feature.color}10, transparent 70%)`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Connecting Lines SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20 hidden lg:block"
          style={{ zIndex: 5 }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b35" stopOpacity="0" />
              <stop offset="50%" stopColor="#ff6b35" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <style>{`
        .feature-card.animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
}
