import { Navigation } from '@/sections/Navigation';
import { Hero } from '@/sections/Hero';
import { Features } from '@/sections/Features';
import { DashboardDemo } from '@/sections/DashboardDemo';
import { HowItWorks } from '@/sections/HowItWorks';
import { DownloadSection } from '@/sections/Download';
import { Footer } from '@/sections/Footer';
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
    </div>
  );
}

export default App;
