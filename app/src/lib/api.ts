export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: 'file' | 'directory';
  safety_status: 'safe' | 'warning' | 'danger' | 'unknown';
  category?: string;
  children_count?: number;
}

export interface DiskUsage {
  total: number;
  used: number;
  free: number;
  percent_used: number;
}

export interface CategoryBreakdown {
  name: string;
  size: number;
  color: string;
  percentage: number;
}

export interface ScanResult {
  path: string;
  files: FileItem[];
  total_size: number;
  safe_to_delete_size: number;
  compressible_size: number;
  categories: CategoryBreakdown[];
}

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  async getDiskUsage(path: string = '~'): Promise<DiskUsage> {
    const response = await fetch(`${API_BASE_URL}/disk-usage?path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error('Failed to fetch disk usage');
    return response.json();
  },

  async scanPath(path: string = '~', maxDepth: number = 2): Promise<ScanResult> {
    const response = await fetch(`${API_BASE_URL}/scan?path=${encodeURIComponent(path)}&max_depth=${maxDepth}`);
    if (!response.ok) throw new Error('Failed to scan path');
    return response.json();
  },

  async deleteItems(paths: string[], force: boolean = false): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths, force }),
    });
    if (!response.ok) throw new Error('Failed to delete items');
    return response.json();
  },

  async compressItems(paths: string[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/compress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    });
    if (!response.ok) throw new Error('Failed to compress items');
    return response.json();
  },

  async checkPythonInstalled(): Promise<{ installed: boolean; path: string | null }> {
    const response = await fetch(`${API_BASE_URL}/python-installed`);
    if (!response.ok) throw new Error('Failed to check Python status');
    return response.json();
  }
};
