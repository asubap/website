import React, { useState } from "react";

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
  const [uploading, setUploading] = useState(false);

  const handleResourceUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !resourceName || !token || !sponsorName) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resourceLabel", resourceName);
      formData.append("file", file);

      console.log("Uploading resource with key 'file'");

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
        const errorData = await response.text(); // Or response.json() if API returns JSON error
        throw new Error(
          `Failed to upload resource: ${response.status} ${errorData}`
        );
      }

      setFile(null);
      setResourceName("");
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
          <label className="block mb-1 font-medium">File</label>
          <input
            type="file"
            // Reset file input visually if needed by setting key={file ? file.name : 'empty'}
            // or by managing the input value directly (more complex)
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-bapred file:text-white
                hover:file:bg-opacity-90"
            required
          />
        </div>
        <button
          type="submit"
          disabled={!file || !resourceName || uploading || !sponsorName}
          className="px-4 py-2 bg-bapred text-white rounded disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Resource"}
        </button>
      </form>
    </div>
  );
};

export default ResourceUploadForm;
