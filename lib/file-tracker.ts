import { VirtualFileSystem } from "./virtual-fs";

export interface FileChange {
  path: string;
  content: string;
  type: "html" | "css" | "js" | "json" | "image";
  timestamp: number;
  operation: "create" | "update" | "delete";
}

export interface NextJSProjectStructure {
  app: {
    [key: string]: {
      page: string;
      layout?: string;
      loading?: string;
      error?: string;
      notFound?: string;
    };
  };
  components: string[];
  public: string[];
  styles: string[];
  lib: string[];
}

export class FileTracker {
  private static instance: FileTracker;
  private vfs: VirtualFileSystem;
  private changes: FileChange[] = [];
  private currentFile: string | null = null;
  private projectStructure: NextJSProjectStructure | null = null;

  private constructor() {
    this.vfs = VirtualFileSystem.getInstance();
  }

  public static getInstance(): FileTracker {
    if (!FileTracker.instance) {
      FileTracker.instance = new FileTracker();
    }
    return FileTracker.instance;
  }

  public setProjectStructure(structure: NextJSProjectStructure): void {
    this.projectStructure = structure;
    this.initializeProjectFiles();
  }

  private initializeProjectFiles(): void {
    if (!this.projectStructure) return;

    // Initialize app directory structure
    Object.entries(this.projectStructure.app).forEach(([route, files]) => {
      if (files.page) {
        this.vfs.createFile(`/app/${route}/page.tsx`, files.page, "js");
      }
      if (files.layout) {
        this.vfs.createFile(`/app/${route}/layout.tsx`, files.layout, "js");
      }
      if (files.loading) {
        this.vfs.createFile(`/app/${route}/loading.tsx`, files.loading, "js");
      }
      if (files.error) {
        this.vfs.createFile(`/app/${route}/error.tsx`, files.error, "js");
      }
      if (files.notFound) {
        this.vfs.createFile(
          `/app/${route}/not-found.tsx`,
          files.notFound,
          "js"
        );
      }
    });

    // Initialize other directories
    this.projectStructure.components.forEach((component) => {
      this.vfs.createFile(`/components/${component}`, "", "js");
    });

    this.projectStructure.public.forEach((asset) => {
      this.vfs.createFile(`/public/${asset}`, "", "image");
    });

    this.projectStructure.styles.forEach((style) => {
      this.vfs.createFile(`/styles/${style}`, "", "css");
    });

    this.projectStructure.lib.forEach((lib) => {
      this.vfs.createFile(`/lib/${lib}`, "", "js");
    });
  }

  public setCurrentFile(path: string): void {
    this.currentFile = path;
  }

  public getCurrentFile(): string | null {
    return this.currentFile;
  }

  public trackChange(
    path: string,
    content: string,
    operation: "create" | "update" | "delete"
  ): void {
    const file = this.vfs.getFile(path);
    if (!file) return;

    const change: FileChange = {
      path,
      content,
      type: file.type,
      timestamp: Date.now(),
      operation,
    };

    this.changes.push(change);
    this.vfs.updateFile(path, content);
  }

  public getChanges(): FileChange[] {
    return this.changes;
  }

  public clearChanges(): void {
    this.changes = [];
  }

  public async saveToBackend(): Promise<void> {
    if (this.changes.length === 0) return;

    try {
      // Here you would implement the actual API call to your backend
      const response = await fetch("/api/save-changes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          changes: this.changes,
          currentFile: this.currentFile,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes to backend");
      }

      // Clear changes after successful save
      this.clearChanges();
    } catch (error) {
      console.error("Error saving to backend:", error);
      throw error;
    }
  }

  public getFileStructure(): NextJSProjectStructure | null {
    return this.projectStructure;
  }

  public getFileContent(path: string): string | null {
    const file = this.vfs.getFile(path);
    return file?.content || null;
  }

  public getRecentChanges(): FileChange[] {
    return this.changes.slice(-5); // Get last 5 changes
  }
}
