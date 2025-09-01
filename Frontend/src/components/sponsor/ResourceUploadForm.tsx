import React, { useState } from "react";
import { upload } from '@vercel/blob/client';

interface ResourceUploadFormProps {
  sponsorName: string; // Needed for the API endpoint
  token: string; // Needed for authorization
  onUploadSuccess: () => void; // Callback to refresh list
}

const ResourceUploadForm: React.FC<ResourceUploadFormProps> = ({
  sponsorName,
  token,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [resourceName, setResourceName] = useState("");
  const [resourceDescription, setResourceDescription] = useState(""); // New state for description
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Allowed file extensions and MIME types
  const ALLOWED_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.txt', '.rtf',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.xls', '.xlsx', '.csv',
    '.ppt', '.pptx',
  ];

  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  // File validation function
  const validateFile = (file: File): string | null => {
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return `File size must be less than 50MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `File type not supported. Please upload a valid file.`;
    }

    return null; // File is valid
  };



  const handleResourceUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !resourceName || !token || !sponsorName) return;

    // Validate file before upload
    const validationError = validateFile(file);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    setUploading(true);
    setFileError(null); // Clear any previous errors
    try {
      if (file.size > 4.5 * 1024 * 1024) {
        // Large file - use Vercel Blob upload
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: `${import.meta.env.VITE_BACKEND_URL}/blob-upload/sponsor/${sponsorName}?token=${token}`,
        });

        // Create resource with blob URL
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/resources`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              resourceLabel: resourceName,
              description: resourceDescription,
              blobUrl: blob.url
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(
            `Failed to create resource: ${response.status} ${errorData}`
          );
        }
      } else {
        // Small file - use existing upload
        const formData = new FormData();
        formData.append("resourceLabel", resourceName);
        formData.append("description", resourceDescription);
        formData.append("file", file);

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/resources`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              // Content-Type is set automatically for FormData
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(
            `Failed to upload resource: ${response.status} ${errorData}`
          );
        }
      }

      setFile(null);
      setResourceName("");
      setResourceDescription(""); // Reset description field
      onUploadSuccess(); // Call the callback to refresh the list in parent
    } catch (error) {
      console.error("Error uploading resource:", error);
      alert(
        `Error uploading resource: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Resources</h2>
      <form onSubmit={handleResourceUpload} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-medium">Resource Name</label>
          <input
            type="text"
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <input
            type="text"
            value={resourceDescription}
            onChange={(e) => setResourceDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter a description for this resource"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">File</label>
          <input
            type="file"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setFile(selectedFile);
              
              // Validate file when selected
              if (selectedFile) {
                const error = validateFile(selectedFile);
                setFileError(error);
              } else {
                setFileError(null);
              }
            }}
            className="w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-bapred file:text-white
                hover:file:bg-opacity-90"
            required
          />
          {fileError && (
            <p className="text-red-600 text-sm mt-1">{fileError}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Allowed file types: PDF, DOC, DOCX, TXT, RTF, Images (JPG, PNG, GIF, WebP, SVG), 
            Excel (XLS, XLSX, CSV), PowerPoint (PPT, PPTX). Max size: 50MB.
          </p>
        </div>
        <button
          type="submit"
          disabled={!file || !resourceName || uploading || !sponsorName || !!fileError}
          className="px-4 py-2 bg-bapred text-white rounded disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Resource"}
        </button>
      </form>
    </div>
  );
};

export default ResourceUploadForm;
