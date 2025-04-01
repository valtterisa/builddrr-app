"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, AlertCircle, FileText, Image, File } from "lucide-react"
import { uploadFile, type StorageBucket } from "@/lib/storage"
import { createAsset } from "@/lib/database"

interface FileUploadProps {
  websiteId: string
  bucket: StorageBucket
  path?: string
  onUploadComplete?: (url: string, fileData: any) => void
  onUploadError?: (error: Error) => void
  accept?: string
  maxSize?: number // in bytes
  multiple?: boolean
  className?: string
}

export function FileUpload({
  websiteId,
  bucket,
  path = "",
  onUploadComplete,
  onUploadError,
  accept = "*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    // Validate file size
    const invalidFiles = selectedFiles.filter((file) => file.size > maxSize)
    if (invalidFiles.length > 0) {
      setError(`File(s) too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`)
      return
    }

    setError(null)
    setFiles(multiple ? [...files, ...selectedFiles] : selectedFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const totalFiles = files.length
      let completedFiles = 0

      for (const file of files) {
        const filePath = path ? `${path}/${file.name}` : file.name

        try {
          // Upload file to storage
          const url = await uploadFile(bucket, filePath, file, {
            contentType: file.type,
            upsert: true,
          })

          // Create asset record in database
          const asset = await createAsset(websiteId, {
            name: file.name,
            path: filePath,
            size: file.size,
            type: file.type,
            metadata: {
              lastModified: file.lastModified,
            },
          })

          // Call onUploadComplete callback
          onUploadComplete?.(url, asset)

          // Update progress
          completedFiles++
          setProgress(Math.round((completedFiles / totalFiles) * 100))
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error)
          onUploadError?.(error as Error)
          setError(`Failed to upload ${file.name}: ${(error as Error).message}`)
          break
        }
      }

      // Clear files if all uploads completed successfully
      if (completedFiles === totalFiles) {
        setFiles([])
      }
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-5 w-5" />
    } else if (file.type.includes("pdf")) {
      return <FileText className="h-5 w-5" />
    } else {
      return <File className="h-5 w-5" />
    }
  }

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mb-4">
            {accept === "*" ? "Any file type" : accept.split(",").join(", ")} up to {maxSize / (1024 * 1024)}MB
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            multiple={multiple}
            className="hidden"
          />
          <Button size="sm" type="button" variant="secondary">
            Select Files
          </Button>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Files ({files.length})</p>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file)}
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeFile(index)} disabled={uploading}>
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>

            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">Uploading... {progress}%</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setFiles([])} disabled={uploading}>
                Clear All
              </Button>
              <Button size="sm" onClick={handleUpload} disabled={uploading || files.length === 0}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

