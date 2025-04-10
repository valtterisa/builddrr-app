export interface VirtualFile {
  path: string;
  content: string;
  type: "html" | "css" | "js" | "json" | "image";
  lastModified: number;
}

export interface VirtualDirectory {
  path: string;
  files: VirtualFile[];
  directories: VirtualDirectory[];
}

export interface VirtualFileSystem {
  path: string;
  files: VirtualFile[];
  directories: VirtualDirectory[];
  saveChanges: (changes: {
    elementId: string;
    changes: EditOptions;
    timestamp: string;
  }) => Promise<void>;
}

export class VirtualFileSystem {
  path: string;
  files: VirtualFile[];
  directories: VirtualDirectory[];

  private root: VirtualDirectory;
  private static instance: VirtualFileSystem;

  private constructor() {
    this.path = "/";
    this.files = [];
    this.directories = [];
    this.root = {
      path: "/",
      files: [],
      directories: [],
    };
  }

  public static getInstance(): VirtualFileSystem {
    if (!VirtualFileSystem.instance) {
      VirtualFileSystem.instance = new VirtualFileSystem();
    }
    return VirtualFileSystem.instance;
  }

  public createFile(
    path: string,
    content: string,
    type: VirtualFile["type"]
  ): VirtualFile {
    const file: VirtualFile = {
      path,
      content,
      type,
      lastModified: Date.now(),
    };

    const dirPath = path.substring(0, path.lastIndexOf("/"));
    const dir = this.getOrCreateDirectory(dirPath);
    dir.files.push(file);
    return file;
  }

  public updateFile(path: string, content: string): VirtualFile | null {
    const file = this.findFile(path);
    if (file) {
      file.content = content;
      file.lastModified = Date.now();
      return file;
    }
    return null;
  }

  public deleteFile(path: string): boolean {
    const dirPath = path.substring(0, path.lastIndexOf("/"));
    const dir = this.findDirectory(dirPath);
    if (dir) {
      const index = dir.files.findIndex((f) => f.path === path);
      if (index !== -1) {
        dir.files.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  public getFile(path: string): VirtualFile | null {
    return this.findFile(path);
  }

  public getDirectory(path: string): VirtualDirectory | null {
    return this.findDirectory(path);
  }

  public listDirectory(path: string): {
    files: VirtualFile[];
    directories: VirtualDirectory[];
  } {
    const dir = this.findDirectory(path);
    if (dir) {
      return {
        files: dir.files,
        directories: dir.directories,
      };
    }
    return { files: [], directories: [] };
  }

  public saveToLocalStorage(): void {
    localStorage.setItem("virtualFileSystem", JSON.stringify(this.root));
  }

  public loadFromLocalStorage(): void {
    const saved = localStorage.getItem("virtualFileSystem");
    if (saved) {
      this.root = JSON.parse(saved);
    }
  }

  private findFile(path: string): VirtualFile | null {
    const dirPath = path.substring(0, path.lastIndexOf("/"));
    const dir = this.findDirectory(dirPath);
    if (dir) {
      return dir.files.find((f) => f.path === path) || null;
    }
    return null;
  }

  private findDirectory(path: string): VirtualDirectory | null {
    if (path === "/") return this.root;

    const parts = path.split("/").filter((p) => p);
    let current = this.root;

    for (const part of parts) {
      const found = current.directories.find((d) => d.path.endsWith(part));
      if (!found) return null;
      current = found;
    }

    return current;
  }

  private getOrCreateDirectory(path: string): VirtualDirectory {
    if (path === "/") return this.root;

    const parts = path.split("/").filter((p) => p);
    let current = this.root;

    for (const part of parts) {
      let found = current.directories.find((d) => d.path.endsWith(part));
      if (!found) {
        found = {
          path: current.path + part + "/",
          files: [],
          directories: [],
        };
        current.directories.push(found);
      }
      current = found;
    }

    return current;
  }

  async saveChanges(changes: {
    elementId: string;
    changes: EditOptions;
    timestamp: string;
  }): Promise<void> {
    // Implementation will be added later
    console.log("Saving changes:", changes);
  }
}
