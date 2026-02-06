import { HardDrive, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative py-12 bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b] flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">DiskWise</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-gray-400 hover:text-[#f59e0b] transition-colors relative group"
              >
                {link}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#f59e0b] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Social & Copyright */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 DiskWise. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
