import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import {
  ExternalLink,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

// List of common image MIME types for preview
const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

interface ResourcePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: {
    name: string;
    signed_url: string | null;
    mime_type?: string; // Optional, used for image check
  } | null;
}

const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  isOpen,
  onClose,
  resource,
}) => {
  const [imageZoomLevel, setImageZoomLevel] = useState(1);

  // Reset zoom when resource changes or modal opens/closes
  useEffect(() => {
    setImageZoomLevel(1);
  }, [resource, isOpen]);

  // Add useEffect to re-assert body overflow on zoom change
  useEffect(() => {
    if (isOpen) {
      // console.log('PreviewModal zoom effect: Re-setting body overflow to hidden');
      document.body.style.overflow = "hidden";
    }
    // No cleanup needed here, the main Modal effect handles final restoration
  }, [imageZoomLevel, isOpen]); // Depend on zoom level and isOpen

  const handleZoomIn = () => {
    setImageZoomLevel((prev) => Math.min(prev + 0.2, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setImageZoomLevel((prev) => Math.max(prev - 0.2, 0.5)); // Min zoom 0.5x
  };

  const handleResetZoom = () => {
    setImageZoomLevel(1); // Reset to 1x
  };

  if (!resource) {
    return null; // Don't render if no resource is provided
  }

  const isImage = resource.mime_type
    ? IMAGE_MIME_TYPES.includes(resource.mime_type)
    : // Fallback check based on URL extension if mime_type is missing
      resource.signed_url &&
      /\.(jpe?g|png|gif|svg|webp)$/i.test(resource.signed_url);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resource.name}
      showFooter={false} // Hide default footer
      size="lg" // Use a larger size
    >
      <div className="mt-4 space-y-4">
        {/* Header: Buttons */}
        {resource.signed_url && (
          <div className="flex justify-end space-x-2 mb-4">
            {/* Open in New Tab Button */}
            <a
              href={resource.signed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-bapred rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bapred"
              title="Open file in a new tab"
            >
              <ExternalLink size={16} />
              Open
            </a>
            {/* Download Button */}
            <a
              href={resource.signed_url}
              download={resource.name} // Suggest original filename
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              title="Download file"
              // target="_blank" // Can cause issues on some browsers for direct downloads
            >
              <Download size={16} />
              Download
            </a>
          </div>
        )}

        {/* Content: Preview Area */}
        {resource.signed_url ? (
          <div className="w-full h-[65vh] flex flex-col">
            {isImage ? (
              // Image with Zoom container
              <div
                className="overflow-auto text-center flex-grow"
                // style={{ maxHeight: "65vh" }} // Let flex-grow handle height
              >
                <img
                  src={resource.signed_url}
                  alt={`Preview of ${resource.name}`}
                  className="object-contain mx-auto block transition-transform duration-150"
                  style={{
                    transform: `scale(${imageZoomLevel})`,
                    transformOrigin: "center",
                    maxWidth: "100%", // Ensure image doesn't overflow horizontally initially
                    maxHeight: "100%", // Ensure image fits container vertically
                  }}
                />
              </div>
            ) : (
              // Attempt iframe for other types (PDF, etc.)
              <iframe
                src={resource.signed_url}
                title={`Preview of ${resource.name}`}
                className="w-full h-full border-0 flex-grow"
                // sandbox // Consider adding sandbox attribute for security
              >
                Your browser does not support previews for this file type. Use
                the buttons above to download or open it.
              </iframe>
            )}
          </div>
        ) : (
          <p className="text-center text-red-600 p-4">
            Preview URL is missing for this resource.
          </p>
        )}

        {/* Footer: Zoom Controls (only for images) */}
        {resource.signed_url && isImage && (
          <div className="flex justify-center items-center space-x-2 pt-3 mt-3 border-t border-gray-200">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled={imageZoomLevel <= 0.5}
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm text-gray-700 min-w-[40px] text-center">
              {(imageZoomLevel * 100).toFixed(0)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled={imageZoomLevel >= 3}
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled={imageZoomLevel === 1}
              title="Reset Zoom"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ResourcePreviewModal;
