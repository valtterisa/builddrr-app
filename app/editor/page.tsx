"use client";

import { useState, useEffect } from "react";
import { EnhancedEditor } from "@/components/editor/enhanced-editor";
import { VirtualFileSystem } from "@/lib/virtual-fs";
import { FileTracker } from "@/lib/file-tracker";

export default function EditorPage() {
  const [currentFile, setCurrentFile] = useState<string>("");
  const [files, setFiles] = useState<string[]>([]);
  const vfs = VirtualFileSystem.getInstance();
  const fileTracker = FileTracker.getInstance();

  useEffect(() => {
    // Load files from virtual file system
    const loadedFiles = vfs.listFiles();
    setFiles(loadedFiles);
    if (loadedFiles.length > 0) {
      setCurrentFile(loadedFiles[0]);
    }
  }, []);

  const handleFileSelect = (file: string) => {
    setCurrentFile(file);
  };

  const handleSave = async () => {
    // The EnhancedEditor component will handle saving through the API route
    console.log("Save triggered from editor page");
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-800 p-4">
        <h2 className="text-white text-lg font-bold mb-4">Files</h2>
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file}>
              <button
                className={`w-full text-left px-2 py-1 rounded ${
                  currentFile === file
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => handleFileSelect(file)}
              >
                {file}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        {currentFile && (
          <EnhancedEditor currentFile={currentFile} onSave={handleSave} />
        )}
      </div>
    </div>
  );
}
