import { getSupabaseClient } from "../app/utils/supabase/supabase";

// Error handling
export class StorageError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "StorageError";
    this.code = code;
  }
}

// Storage buckets
export enum StorageBucket {
  WEBSITE_ASSETS = "website-assets",
  USER_AVATARS = "user-avatars",
  TEMPLATES = "templates",
}

// Helper function to handle storage errors
function handleError(error: any, customMessage: string): never {
  console.error(`Storage error: ${customMessage}`, error);
  throw new StorageError(`${customMessage}: ${error.message}`, error?.code);
}

// Create storage buckets if they don't exist
export async function initializeStorage(): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    // Create buckets if they don't exist
    for (const bucket of Object.values(StorageBucket)) {
      const { data: existingBucket } = await supabase.storage.getBucket(bucket);

      if (!existingBucket) {
        const { error } = await supabase.storage.createBucket(bucket, {
          public: bucket === StorageBucket.WEBSITE_ASSETS, // Make website assets public
          fileSizeLimit:
            bucket === StorageBucket.WEBSITE_ASSETS ? 10485760 : 5242880, // 10MB for website assets, 5MB for others
        });

        if (error) {
          console.error(`Failed to create bucket ${bucket}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Failed to initialize storage:", error);
  }
}

// Upload a file to storage
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
): Promise<string> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
      });

    if (error) throw error;

    // Return the public URL for the file
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    return publicUrl.publicUrl;
  } catch (error) {
    return handleError(error, `Failed to upload file to ${bucket}/${path}`);
  }
}

// Get a file from storage
export async function getFileUrl(
  bucket: StorageBucket,
  path: string,
  options?: { download?: boolean }
): Promise<string> {
  try {
    const supabase = getSupabaseClient();

    if (bucket === StorageBucket.WEBSITE_ASSETS) {
      // For public buckets, return the public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } else {
      // For private buckets, return a signed URL
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    }
  } catch (error) {
    return handleError(error, `Failed to get file URL for ${bucket}/${path}`);
  }
}

// Download a file from storage
export async function downloadFile(
  bucket: StorageBucket,
  path: string
): Promise<Blob> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error, `Failed to download file from ${bucket}/${path}`);
  }
}

// List files in a folder
export async function listFiles(
  bucket: StorageBucket,
  path?: string
): Promise<{ name: string; size: number; metadata: any }[]> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path || "");

    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(
      error,
      `Failed to list files in ${bucket}/${path || ""}`
    );
  }
}

// Delete a file from storage
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
  } catch (error) {
    return handleError(error, `Failed to delete file from ${bucket}/${path}`);
  }
}

// Delete multiple files from storage
export async function deleteFiles(
  bucket: StorageBucket,
  paths: string[]
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage.from(bucket).remove(paths);

    if (error) throw error;
  } catch (error) {
    return handleError(error, `Failed to delete files from ${bucket}`);
  }
}

// Move/rename a file in storage
export async function moveFile(
  bucket: StorageBucket,
  fromPath: string,
  toPath: string
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) throw error;
  } catch (error) {
    return handleError(
      error,
      `Failed to move file from ${bucket}/${fromPath} to ${bucket}/${toPath}`
    );
  }
}

// Copy a file in storage
export async function copyFile(
  bucket: StorageBucket,
  fromPath: string,
  toPath: string
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage
      .from(bucket)
      .copy(fromPath, toPath);

    if (error) throw error;
  } catch (error) {
    return handleError(
      error,
      `Failed to copy file from ${bucket}/${fromPath} to ${bucket}/${toPath}`
    );
  }
}

// Get metadata for a file
export async function getFileMetadata(
  bucket: StorageBucket,
  path: string
): Promise<any> {
  try {
    const supabase = getSupabaseClient();

    // Currently, Supabase doesn't have a direct method to get file metadata
    // So we'll list the parent directory and find the file
    const parentPath = path.split("/").slice(0, -1).join("/");
    const fileName = path.split("/").pop();

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(parentPath);

    if (error) throw error;

    const fileData = data.find((item) => item.name === fileName);
    if (!fileData) {
      throw new Error(`File not found: ${path}`);
    }

    return fileData;
  } catch (error) {
    return handleError(error, `Failed to get metadata for ${bucket}/${path}`);
  }
}

// Upload an image and create a thumbnail
export async function uploadImage(
  bucket: StorageBucket,
  path: string,
  file: File | Blob,
  options?: {
    contentType?: string;
    upsert?: boolean;
    generateThumbnail?: boolean;
  }
): Promise<{ url: string; thumbnailUrl?: string }> {
  try {
    // Upload the original image
    const url = await uploadFile(bucket, path, file, options);

    // If thumbnail generation is requested, we would normally process the image
    // and create a thumbnail. For simplicity, we'll just return the original URL.
    // In a real application, you would use a serverless function or edge function
    // to generate the thumbnail.

    if (options?.generateThumbnail) {
      const thumbnailPath = path.replace(/(\.[^.]+)$/, "-thumbnail$1");
      // In a real app, we would generate and upload the thumbnail here
      // For now, we'll just return the original URL
      return { url, thumbnailUrl: url };
    }

    return { url };
  } catch (error) {
    return handleError(error, `Failed to upload image to ${bucket}/${path}`);
  }
}
