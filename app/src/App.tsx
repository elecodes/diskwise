import { Navigation } from '@/sections/Navigation';
import { Hero } from '@/sections/Hero';
import { Features } from '@/sections/Features';
import { DashboardDemo } from '@/sections/DashboardDemo';
import { HowItWorks } from '@/sections/HowItWorks';
import { DownloadSection } from '@/sections/Download';
import { Footer } from '@/sections/Footer';
import { Toaster } from 'sonner';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <DashboardDemo />
        <HowItWorks />
        <DownloadSection />
      </main>
      <Footer />
      <Toaster 
        position="top-right" 
        richColors 
        toastOptions={{
          style: {
            fontSize: '1rem',
            padding: '16px',
            background: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            borderRadius: '12px'
          },
        }}
      />
    </div>
  );
}

export default App;
