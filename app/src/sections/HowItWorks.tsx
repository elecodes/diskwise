import { useEffect, useRef } from 'react';
import { Search, Eye, Trash2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Scan Your Disk',
    description:
      'Select folders to scan. DiskWise analyzes every file with intelligent classification, identifying what’s taking up space.',
    color: '#f59e0b',
  },
  {
    number: '02',
    icon: Eye,
    title: 'Review Results',
    description:
      'See what’s taking up space at a glance. Green means safe to delete, yellow means review, red means keep.',
    color: '#ffc107',
  },
  {
    number: '03',
    icon: Trash2,
    title: 'Clean Up',
    description:
      'One click to free up space. Delete or compress — you’re always in control of what gets removed.',
    color: '#4caf50',
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.step-item').forEach((el, i) => {
              setTimeout(() => {
                el.classList.add('animate-in');
              }, i * 200);
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
      id="how-it-works"
      ref={sectionRef}
      className="relative py-32 bg-black overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-[#f59e0b]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Clean your disk in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/10 hidden sm:block" />

          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={step.number}
                  className={`step-item opacity-0 translate-y-8 transition-[opacity,transform] duration-700 relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-0 ${
                    isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 sm:px-12 ${
                      isEven ? 'sm:text-right' : 'sm:text-left'
                    }`}
                  >
                    <div
                      className={`inline-flex items-center gap-3 mb-3 ${
                        isEven ? 'sm:flex-row-reverse' : ''
                      }`}
                    >
                      <span
                        className="text-4xl font-bold opacity-30"
                        style={{ color: step.color }}
                      >
                        {step.number}
                      </span>
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="text-gray-400 max-w-md ml-0 sm:ml-auto sm:mr-auto">
                      {step.description}
                    </p>
                  </div>

                  {/* Center Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 animate-pulse-glow"
                      style={{
                        backgroundColor: `${step.color}15`,
                        borderColor: `${step.color}40`,
                      }}
                    >
                      <Icon className="w-8 h-8" style={{ color: step.color }} />
                    </div>
                  </div>

                  {/* Empty space for layout */}
                  <div className="flex-1 hidden sm:block" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .step-item.animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
}
