import { useState, useEffect, useRef } from 'react';
import {
  FolderOpen,
  FileText,
  Trash2,
  Minimize2,
  CheckSquare,
  Square,
  Search,
  RefreshCw,
} from 'lucide-react';
import { SafetyBadge } from '@/components/SafetyBadge';
import { FileSize } from '@/components/FileSize';
import { DiskChart } from '@/components/DiskChart';
import type { FileItem } from '@/types';

// Mock data for the demo
const mockFiles: FileItem[] = [
  {
    id: '1',
    name: '__pycache__',
    path: '/home/user/project/__pycache__',
    size: 2147483648,
    type: 'directory',
    safetyStatus: 'safe',
    category: 'Python Cache',
  },
  {
    id: '2',
    name: 'node_modules',
    path: '/home/user/project/node_modules',
    size: 5368709120,
    type: 'directory',
    safetyStatus: 'safe',
    category: 'Dependencies',
  },
  {
    id: '3',
    name: 'temp.log',
    path: '/var/log/temp.log',
    size: 1073741824,
    type: 'file',
    safetyStatus: 'safe',
    category: 'Log Files',
  },
  {
    id: '4',
    name: 'Documents',
    path: '/home/user/Documents',
    size: 8589934592,
    type: 'directory',
    safetyStatus: 'warning',
    category: 'User Files',
  },
  {
    id: '5',
    name: 'System',
    path: '/System',
    size: 16106127360,
    type: 'directory',
    safetyStatus: 'danger',
    category: 'System',
  },
  {
    id: '6',
    name: '.pytest_cache',
    path: '/home/user/project/.pytest_cache',
    size: 524288000,
    type: 'directory',
    safetyStatus: 'safe',
    category: 'Test Cache',
  },
  {
    id: '7',
    name: 'Downloads',
    path: '/home/user/Downloads',
    size: 4294967296,
    type: 'directory',
    safetyStatus: 'warning',
    category: 'Downloads',
  },
];

const diskData = {
  total: 512 * 1024 * 1024 * 1024, // 512 GB
  used: 384 * 1024 * 1024 * 1024, // 384 GB
  free: 128 * 1024 * 1024 * 1024, // 128 GB
  categories: [
    { name: 'System', size: 16106127360, color: '#f44336' },
    { name: 'Applications', size: 42949672960, color: '#2196f3' },
    { name: 'Documents', size: 85899345920, color: '#ffc107' },
    { name: 'Cache/Temp', size: 12884901888, color: '#4caf50' },
    { name: 'Other', size: 225485783040, color: '#9e9e9e' },
  ],
};

export function DashboardDemo() {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'safe' | 'warning' | 'danger'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => {
                el.classList.add('animate-in');
              }, i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleFile = (id: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFiles(newSelected);
  };

  const filteredFiles = mockFiles.filter((file) =>
    filter === 'all' ? true : file.safetyStatus === filter
  );

  const selectedSize = mockFiles
    .filter((f) => selectedFiles.has(f.id))
    .reduce((sum, f) => sum + f.size, 0);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <section
      id="dashboard"
      ref={sectionRef}
      className="relative py-32 bg-black overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-black to-[#0a0a0a]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 reveal opacity-0 translate-y-8 transition-[opacity,transform] duration-700">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            See It In <span className="text-gradient">Action</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Interactive dashboard showing disk usage and file safety status
          </p>
        </div>

        {/* Dashboard */}
        <div className="reveal opacity-0 translate-y-8 transition-[opacity,transform] duration-700 delay-200 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl glass-reflection">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-white/10 gap-4 bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.3)] shimmer">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Disk Analysis</h3>
                <p className="text-sm text-gray-500">/home/user</p>
              </div>
            </div>
            <button
              onClick={handleScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 hover:bg-[#f59e0b]/20 transition-[background-color,opacity] disabled:opacity-50 shimmer outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] ${!isScanning ? 'glass-reflection' : ''}`}
              aria-label={isScanning ? "Scanning in progress" : "Rescan System"}
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} aria-hidden="true" />
              {isScanning ? 'Scanning…' : 'Rescan System'}
            </button>
          </div>

          <div className="grid lg:grid-cols-3">
            {/* Left: Disk Chart */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/10">
              <DiskChart
                used={diskData.used}
                total={diskData.total}
                categories={diskData.categories}
              />

              {/* Legend */}
              <div className="mt-6 space-y-2">
                {diskData.categories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-gray-400">{cat.name}</span>
                    </div>
                    <FileSize bytes={cat.size} className="text-gray-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: File List */}
            <div className="lg:col-span-2 p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {(['all', 'safe', 'warning', 'danger'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] ${
                        filter === f
                          ? 'bg-[#f59e0b] text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                      aria-label={`Filter by ${f}`}
                      aria-pressed={filter === f}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Search className="w-4 h-4" />
                  <span>{filteredFiles.length} items found</span>
                </div>
              </div>

              {/* File List Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-500 border-b border-white/5">
                <div className="col-span-1">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Status</div>
              </div>

              {/* File Items */}
              <div className="max-h-80 overflow-y-auto">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-white/[0.04] backdrop-blur-0 hover:backdrop-blur-md transition-[background-color,backdrop-filter,transform] duration-300 border-b border-white/5 last:border-0 group cursor-default transform hover:scale-[1.002]"
                  >
                    <div className="col-span-1">
                      <button
                        onClick={() => toggleFile(file.id)}
                        className="text-gray-400 hover:text-[#f59e0b] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] rounded"
                        aria-label={selectedFiles.has(file.id) ? `Deselect ${file.name}` : `Select ${file.name}`}
                        aria-pressed={selectedFiles.has(file.id)}
                      >
                        {selectedFiles.has(file.id) ? (
                          <CheckSquare className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
                        ) : (
                          <Square className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    <div className="col-span-5 flex items-center gap-2">
                      {file.type === 'directory' ? (
                        <FolderOpen className="w-4 h-4 text-[#f59e0b]" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-white truncate">{file.name}</span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">{file.category}</div>
                    <div className="col-span-2">
                      <FileSize bytes={file.size} className="text-sm text-gray-400" />
                    </div>
                    <div className="col-span-2">
                      <SafetyBadge status={file.safetyStatus} size="sm" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              {selectedFiles.size > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#f59e0b]/20 to-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-between shadow-lg shadow-[#f59e0b]/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="text-sm">
                    <span className="text-white font-semibold">{selectedFiles.size}</span>
                    <span className="text-gray-300 ml-1">items selected (</span>
                    <FileSize bytes={selectedSize} className="text-[#f59e0b] font-bold inline" />
                    <span className="text-gray-300">)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 transition-[background-color] font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-green-500">
                      <Minimize2 className="w-4 h-4" aria-hidden="true" />
                      Compress
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-[background-color] font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
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
