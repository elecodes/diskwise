export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: 'file' | 'directory';
  safetyStatus: 'safe' | 'warning' | 'danger' | 'unknown';
  category?: string;
}

export interface DiskUsageData {
  total: number;
  used: number;
  free: number;
  categories: {
    name: string;
    size: number;
    color: string;
  }[];
}

export interface ScanResult {
  files: FileItem[];
  totalSize: number;
  safeToDeleteSize: number;
  compressibleSize: number;
}

export type SafetyStatus = 'safe' | 'warning' | 'danger' | 'unknown';
