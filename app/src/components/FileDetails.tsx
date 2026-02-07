import { 
  File, 
  Folder, 
  Copy, 
  ExternalLink, 
  Trash2, 
  Archive, 
  Info,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import { SafetyBadge } from './SafetyBadge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from './ui/drawer';
import { toast } from 'sonner';
import { useState } from 'react';

interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: 'file' | 'directory';
  safety_status: 'safe' | 'warning' | 'danger' | 'unknown';
  category?: string;
  children_count?: number;
}

interface FileDetailsProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function FileDetails({ file, isOpen, onClose, onRefresh }: FileDetailsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  if (!file) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const copyPath = () => {
    navigator.clipboard.writeText(file.path);
    toast.success('Path copied to clipboard');
  };

  const openPath = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/open-path?path=${encodeURIComponent(file.path)}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to open path');
      toast.success('Path opened on your system');
    } catch (err) {
      toast.error('Could not open path');
    }
  };

  const getSafetyLogic = (status: string) => {
    switch (status) {
      case 'safe':
        return 'This file is part of a known cache or temporary directory and is safe to delete.';
      case 'warning':
        return 'This file matches common cleanup patterns but might contain user data. Exercise caution.';
      case 'danger':
        return 'This file appears to be a user document or system file. Deletion is not recommended.';
      default:
        return 'Safety status unknown. No specific rules matched this file.';
    }
  };

  const handleDelete = async () => {
    const isWarning = file.safety_status === 'warning';
    const message = isWarning 
      ? `This file is marked with a WARNING. Are you SURE you want to delete ${file.name}?`
      : `Are you sure you want to delete ${file.name}?`;
      
    if (!confirm(message)) return;

    setIsProcessing(true);
    try {
      await api.deleteItems([file.path], isWarning);
      toast.success('File deleted successfully');
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompress = async () => {
    setIsProcessing(true);
    try {
      await api.compressItems([file.path]);
      toast.success('File compressed successfully');
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to compress file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="bg-[#0a0a0a] border-white/10 text-white">
        <DrawerHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-bold flex items-center gap-2 truncate pr-8">
              {file.type === 'directory' ? (
                <Folder className="w-5 h-5 text-[#f59e0b]" />
              ) : (
                <File className="w-5 h-5 text-gray-400" />
              )}
              {file.name}
            </DrawerTitle>
            <DrawerClose className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/5 transition-colors">
              <X className="w-5 h-5" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-2xl glass-reflection">
              {file.type === 'directory' ? (
                <Folder className="w-12 h-12 text-[#f59e0b]" />
              ) : (
                <File className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <div className="text-3xl font-bold">{formatSize(file.size)}</div>
              <div className="text-gray-500 text-sm mt-1">{file.category || 'Uncategorized'} {file.type}</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <SafetyBadge status={file.safety_status} size="sm" />
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-xs text-gray-500 mb-1">Children</div>
              <div className="text-sm font-medium">{file.children_count ?? 'N/A'} items</div>
            </div>
          </div>

          {/* Safety Rationale */}
          <div className="p-4 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/10 space-y-2">
            <div className="flex items-center gap-2 text-[#f59e0b]">
              <Info className="w-4 h-4" />
              <span className="text-sm font-semibold">Safety Insights</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {getSafetyLogic(file.safety_status)}
            </p>
          </div>

          {/* Path Section */}
          <div className="space-y-2">
            <label className="text-xs text-gray-500 px-1">Location</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400 truncate">
                {file.path}
              </div>
              <button 
                onClick={copyPath}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                title="Copy Path"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action List */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <button 
              onClick={openPath}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/5 border border-white/5 transition-[background-color,transform] active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Open File</div>
                  <div className="text-xs text-gray-500">Reveal in Finder/Explorer</div>
                </div>
              </div>
            </button>

            <button 
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/5 border border-white/5 transition-[background-color,transform] active:scale-[0.98] group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                  <Archive className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Compress</div>
                  <div className="text-xs text-gray-500">Save up to 40% space</div>
                </div>
              </div>
            </button>

            <button 
              onClick={handleDelete}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-[background-color,transform] active:scale-[0.98] group text-red-500 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Delete Permanently</div>
                  <div className="text-xs text-red-500/60">This action cannot be undone</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
