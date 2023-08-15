import { FileNode } from '@sagaroute/react/lib/gather';

class CacheManger {
  dirty: string[] = [];
  cache: Record<string, FileNode> = {};
  preCount?: number;
  curCount = 0;

  clearAll() {
    this.clearCache();
    this.clearDirty();
    this.resetCount();
  }

  resetCount() {
    this.preCount = undefined;
    this.curCount = 0;
  }

  refreshCount() {
    this.preCount = this.curCount;
    this.curCount = 0;
  }

  compareCount() {
    return this.preCount === this.curCount;
  }

  addDirty(path: string) {
    if (!this.dirty.includes(path)) {
      this.dirty.push(path);
    }
  }

  hasDirty(path: string) {
    return this.dirty.includes(path);
  }

  clearDirty() {
    this.dirty = [];
  }

  addCache(path: string, fileNode: FileNode) {
    this.cache[path] = fileNode;
  }

  getCache(path: string) {
    return this.cache[path];
  }

  setCache(path: string, fileNode: FileNode) {
    this.cache[path] = fileNode;
  }

  hasCache(path: string) {
    return Object.prototype.hasOwnProperty.call(this.cache, path);
  }

  deleteCache(path: string) {
    delete this.cache[path];
  }

  clearCache() {
    this.cache = {};
  }
}

let cacheManger: CacheManger;

export default function getCacheManager() {
  if (!cacheManger) {
    cacheManger = new CacheManger();
  }
  return cacheManger;
}
