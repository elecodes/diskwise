import { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  Search,
  Trash2,
  CheckSquare,
  Square,
  HardDrive,
  File,
  Folder,
  Minimize2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, type DiskUsage, type ScanResult } from '../lib/api';
import { SafetyBadge } from '@/components/SafetyBadge';
import { DiskChart } from '@/components/DiskChart';
import { FileDetails } from '@/components/FileDetails';

export function DashboardDemo() {
  const [isScanning, setIsScanning] = useState(false);
  const [diskUsage, setDiskUsage] = useState<DiskUsage | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [filter, setFilter] = useState<'all' | 'safe' | 'warning' | 'danger'>('all');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewingFile, setViewingFile] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  // Initial disk usage fetch
  useEffect(() => {
    const fetchDiskUsage = async () => {
      try {
        const usage = await api.getDiskUsage('~');
        setDiskUsage(usage);
      } catch (err) {
        console.error('Failed to fetch disk usage:', err);
        setError('Could not connect to the backend API. Please ensure the server is running.');
      }
    };
    fetchDiskUsage();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    try {
      // Small artificial delay to show scanning state
      await new Promise(resolve => setTimeout(resolve, 800));
      const result = await api.scanPath('~', 2);
      setScanResult(result);
      setSelectedFiles(new Set());
    } catch (err: any) {
      console.error('Scan failed:', err);
      setError(err.message || 'An error occurred during scanning.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDelete = async () => {
    if (selectedFiles.size === 0 || !scanResult) return;
    
    const selectedList = Array.from(selectedFiles);
    const paths = selectedList.map(id => 
      scanResult.files.find(f => f.id === id)?.path
    ).filter(Boolean) as string[];

    if (!confirm(`Are you sure you want to delete ${paths.length} items? This action cannot be undone.`)) return;

    const toastId = toast.loading(paths.length === 1 
      ? `deleting "${paths[0].split('/').pop()}"...`
      : `deleting ${paths.length} items...`
    );

    setIsScanning(true);
    try {
      const result = await api.deleteItems(paths);
      if (result.status === 'success') {
        if (result.deleted.length === 1) {
          const fileName = result.deleted[0].split('/').pop();
          toast.success(`file "${fileName}" has been deleted`, { id: toastId });
        } else {
          toast.success(`Successfully deleted ${result.deleted.length} items`, { id: toastId });
        }
      } else if (result.errors?.length > 0) {
        toast.error(`Failed to delete some items: ${result.errors[0].error}`, { id: toastId });
      }
      handleScan();
    } catch (err: any) {
      toast.error(err.message || 'Deletion failed', { id: toastId });
    } finally {
      setIsScanning(false);
    }
  };

  const handleCompress = async () => {
    if (selectedFiles.size === 0 || !scanResult) return;
    
    const selectedList = Array.from(selectedFiles);
    const paths = selectedList.map(id => 
      scanResult.files.find(f => f.id === id)?.path
    ).filter(Boolean) as string[];

    setIsScanning(true);
    try {
      const result = await api.compressItems(paths);
      if (result.status === 'success') {
        toast.success(`Successfully compressed ${result.compressed.length} items`);
      }
      handleScan();
    } catch (err: any) {
      toast.error(err.message || 'Compression failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileClick = (file: any, e: React.MouseEvent) => {
    // If clicking checkbox, don't open details
    if ((e.target as HTMLElement).closest('.checkbox-btn')) return;
    setViewingFile(file);
  };

  const toggleFile = (id: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFiles(newSelected);
  };

  const selectAll = () => {
    if (!scanResult) return;
    const currentFiles = filteredFiles;
    if (selectedFiles.size === currentFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(currentFiles.map((f) => f.id)));
    }
  };

  const filteredFiles = scanResult?.files.filter((file) => {
    if (filter === 'all') return true;
    if (filter === 'safe') return file.safety_status === 'safe';
    if (filter === 'warning') return file.safety_status === 'warning';
    if (filter === 'danger') return file.safety_status === 'danger';
    return true;
  }) || [];

  const selectedSize = (scanResult?.files || [])
    .filter((f) => selectedFiles.has(f.id))
    .reduce((sum, f) => sum + f.size, 0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 GB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
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
            Try the dashboard demo. Connect to your local system to see actual
            files safe to delete.
          </p>
          {error && (
            <div className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Dashboard */}
        <div className="reveal opacity-0 translate-y-8 transition-[opacity,transform] duration-700 delay-200 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl glass-reflection">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-white/10 gap-4 bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.3)] shimmer">
                <HardDrive className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Disk Analysis</h3>
                <p className="text-sm text-gray-500">{scanResult?.path || '/home/user'}</p>
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
            {/* Left: Charts */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-left">
                  <h3 className="text-sm text-gray-400 font-medium">System Health</h3>
                  <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                    {diskUsage ? `${100 - Math.round(diskUsage.percent_used)}%` : '--%'}
                    <span className="text-xs text-green-500 font-normal">Optimal</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col text-right">
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Used</p>
                    <p className="text-sm font-bold text-white">{diskUsage ? formatSize(diskUsage.used) : '-- GB'}</p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-4">
                    <p className="text-xs text-gray-500">Free</p>
                    <p className="text-sm font-bold text-white">{diskUsage ? formatSize(diskUsage.free) : '-- GB'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8 mt-8">
                <h4 className="text-lg font-bold text-white mb-6">Storage Breakdown</h4>
                <DiskChart 
                  used={diskUsage?.used || 0} 
                  total={diskUsage?.total || 1} 
                  categories={scanResult?.categories || []} 
                />
              </div>

              <div className="space-y-4">
                {(scanResult?.categories || []).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm text-gray-400">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{formatSize(cat.size)}</span>
                  </div>
                ))}
                {!scanResult && (
                  <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-xl">
                    <p className="text-sm text-gray-500 italic">No scan results yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: File List */}
            <div className="lg:col-span-2 p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
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
                      {selectedFiles.size > 0 && filter === f && (
                        <span className="text-xs bg-white text-black ml-1.5 px-1.5 py-0.5 rounded-full font-bold">
                          {selectedFiles.size}
                        </span>
                      )}
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
                  <button
                    onClick={selectAll}
                    className="text-gray-400 hover:text-[#f59e0b] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] rounded"
                    aria-label={selectedFiles.size === filteredFiles.length ? "Deselect all" : "Select all"}
                    aria-pressed={selectedFiles.size === filteredFiles.length}
                  >
                    {selectedFiles.size === filteredFiles.length && filteredFiles.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
                    ) : (
                      <Square className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <div className="col-span-11">
                  <div className="grid grid-cols-11 gap-4">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-2">Status</div>
                  </div>
                </div>
              </div>

              {/* File Items */}
              <div className="max-h-80 overflow-y-auto">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={(e) => handleFileClick(file, e)}
                    className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-white/[0.04] backdrop-blur-0 hover:backdrop-blur-md transition-[background-color,backdrop-filter,transform] duration-300 border-b border-white/5 last:border-0 group cursor-pointer transform hover:scale-[1.002]"
                  >
                    <div className="col-span-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFile(file.id);
                        }}
                        className="checkbox-btn text-gray-400 hover:text-[#f59e0b] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] rounded"
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
                    <div className="col-span-11">
                      <div className="grid grid-cols-11 gap-4 items-center">
                        <div className="col-span-5 flex items-center gap-2">
                          {file.type === 'directory' ? (
                            <Folder className="w-4 h-4 text-[#f59e0b]" />
                          ) : (
                            <File className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-white truncate" title={file.path}>{file.name}</span>
                        </div>
                        <div className="col-span-2 text-sm text-gray-500 truncate">{file.category}</div>
                        <div className="col-span-2 text-sm text-gray-400">{formatSize(file.size)}</div>
                        <div className="col-span-2">
                          <SafetyBadge status={file.safety_status} size="sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredFiles.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400">
                      {isScanning ? 'Analyzing files…' : scanResult ? 'No files match your filter.' : 'Click "Rescan System" to start analysis.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              {selectedFiles.size > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#f59e0b]/20 to-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-between shadow-lg shadow-[#f59e0b]/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="text-sm">
                    <span className="text-white font-semibold">{selectedFiles.size}</span>
                    <span className="text-gray-300 ml-1">items selected (</span>
                    <span className="text-[#f59e0b] font-bold inline">{formatSize(selectedSize)}</span>
                    <span className="text-gray-300">)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCompress}
                      disabled={isScanning}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 transition-[background-color] font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:opacity-50"
                    >
                      <Minimize2 className="w-4 h-4" aria-hidden="true" />
                      Compress
                    </button>
                    <button 
                      onClick={handleDelete}
                      disabled={isScanning}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-[background-color] font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                    >
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

      <FileDetails 
        file={viewingFile} 
        isOpen={!!viewingFile} 
        onClose={() => setViewingFile(null)} 
        onRefresh={() => handleScan()}
      />

      <style>{`
        .reveal.animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
}
