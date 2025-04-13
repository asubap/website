import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import SponsorDescription from "../../components/sponsor/SponsorDescription";
import axios from "axios";
import { useAuth } from "../../context/auth/authProvider";
import { MoreHorizontal, X } from "lucide-react";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// Edit Profile Modal Component
interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    sponsorName: string;
    sponsorDescription: string;
    onUpdate: (updatedProfile: { description: string; links: string[] }) => void;
    token: string;
    profileUrl: string;
    onProfilePicChange: (url: string) => void;
    links?: string[];
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, sponsorName, sponsorDescription, onUpdate, token, profileUrl, onProfilePicChange, links = [] }) => {
    // State variables
    const [about, setAbout] = useState(sponsorDescription);
    const [linksList, setLinksList] = useState<string[]>(links);
    const [newLink, setNewLink] = useState("");
    const [editingLink, setEditingLink] = useState({ index: -1, value: "" });
    const [initialAbout, setInitialAbout] = useState(sponsorDescription);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
    const [currentProfileUrl, setCurrentProfileUrl] = useState(profileUrl);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [linkToRemove, setLinkToRemove] = useState("");
    const [linkError, setLinkError] = useState("");
    const [showPicConfirmation, setShowPicConfirmation] = useState(false);
    const [showLinkWarning, setShowLinkWarning] = useState(false);
    
    // Use refs to reliably track changes 
    const hasChangesRef = useRef({
        about: false,
        links: false
    });
    
    // Check if there are unsaved changes
    const hasUnsavedChanges = () => {
        // Check links and bio directly
        const areLinksChanged = hasChangesRef.current.links;
        const isBioChanged = hasChangesRef.current.about;
        const hasNewProfilePic = profilePicFile !== null;
        const isEditingALink = editingLink.index !== -1;
        
        // Determine if there are any changes
        const hasChanges = areLinksChanged || isBioChanged || hasNewProfilePic || isEditingALink;
        
        console.log("hasUnsavedChanges check:", {
            areLinksChanged,
            isBioChanged,
            hasNewProfilePic,
            isEditingALink,
            hasChanges,
            refState: { ...hasChangesRef.current }
        });
        
        return hasChanges;
    };

    useEffect(() => {
        setAbout(sponsorDescription);
        setLinksList(links);
        setCurrentProfileUrl(profileUrl);
        setInitialAbout(sponsorDescription);
        
        // Reset change tracking when modal opens/closes
        hasChangesRef.current = {
            about: false,
            links: false
        };
    }, [sponsorDescription, links, profileUrl, isOpen]);

    const isValidUrl = (urlString: string) => {
        try {
            const url = new URL(urlString);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (_) {
            return false;
        }
    };

    const handleAddLink = () => {
        if (!newLink.trim()) {
            setLinkError("Please enter a valid URL");
            return;
        }

        if (!isValidUrl(newLink)) {
            setLinkError("Please enter a valid URL starting with http:// or https://");
            return;
        }

        // Add link and set change state
        const newLinksList = [...linksList, newLink];
        setLinksList(newLinksList);
        hasChangesRef.current.links = true;
        
        console.log("Link added, changes set to true:", hasChangesRef.current);
        
        setNewLink("");
        setLinkError("");
    };

    const startEditLink = (index: number) => {
        console.log("Starting to edit link at index:", index);
        setEditingLink({ index, value: linksList[index] });
        // Just starting to edit is enough to mark as having unsaved changes
        hasChangesRef.current.links = true;
        console.log("Started editing link, changes set to true:", hasChangesRef.current);
    };

    const saveEditLink = () => {
        if (!isValidUrl(editingLink.value)) {
            setLinkError("Please enter a valid URL starting with http:// or https://");
            return;
        }

        // Edit link and set change state
        const newLinks = [...linksList];
        newLinks[editingLink.index] = editingLink.value;
        setLinksList(newLinks);
        hasChangesRef.current.links = true;
        
        setEditingLink({ index: -1, value: '' });
        setLinkError("");
    };

    const cancelEditLink = () => {
        setEditingLink({ index: -1, value: '' });
        setLinkError("");
    };

    const confirmRemoveLink = (linkToRemove: string, e?: React.MouseEvent) => {
        // Only stop propagation but not preventDefault
        if (e) {
            e.stopPropagation();
        }
        setLinkToRemove(linkToRemove);
        setShowConfirmation(true);
    };

    const handleRemoveLink = (e?: React.MouseEvent) => {
        console.log("Removing link:", linkToRemove);
        
        // Only stop propagation but not preventDefault
        if (e) {
            e.stopPropagation();
        }
        
        // Remove the link immediately and set change state
        const newLinksList = linksList.filter(link => link !== linkToRemove);
        setLinksList(newLinksList);
        hasChangesRef.current.links = true;
        
        // Close the confirmation dialog
        setShowConfirmation(false);
        setLinkToRemove("");
    };

    const handleCancelRemove = () => {
        setShowConfirmation(false);
        setLinkToRemove("");
    };

    // Reset state when modal closes
    const handleModalClose = () => {
        // Reset ref before closing
        hasChangesRef.current = {
            about: false,
            links: false
        };
        
        onClose();
        
        // Reset the state 100ms after the modal closes
        setTimeout(() => {
            setNewLink("");
            setEditingLink({ index: -1, value: "" });
            setLinkError("");
            setShowConfirmation(false);
            setShowPicConfirmation(false);
        }, 100);
    };

    const handleSave = async () => {
        // Check if there's text in the newLink input that hasn't been added
        if (newLink.trim()) {
            // Show warning instead of saving
            setShowLinkWarning(true);
            return;
        }
        
        onUpdate({
            description: about,
            links: linksList
        });
        
        // Reset change tracking after saving
        hasChangesRef.current = {
            about: false,
            links: false
        };
        
        handleModalClose();
    };

    const handleAddAndSave = () => {
        // Add the link first
        handleAddLink();
        // Then save after a small delay to ensure state is updated
        setTimeout(() => {
            onUpdate({
                description: about,
                links: [...linksList, newLink]
            });
            
            // Reset change tracking
            hasChangesRef.current = {
                about: false,
                links: false
            };
            
            handleModalClose();
        }, 100);
    };

    const handleProfilePicUpload = async () => {
        if (!profilePicFile) return;
        
        setUploadingProfilePic(true);
        
        try {
            const formData = new FormData();
            formData.append('file', profilePicFile);
            
            const response = await fetch('https://bap-backend.onrender.com/upload-sponsor-pic', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to upload profile picture');
            }
            
            const data = await response.json();
            setCurrentProfileUrl(data.url);
            onProfilePicChange(data.url);
            setProfilePicFile(null);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        } finally {
            setUploadingProfilePic(false);
        }
    };

    const handleProfilePicDelete = async () => {
        try {
            const response = await fetch('https://bap-backend.onrender.com/delete-sponsor-pic', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete profile picture');
            }
            
            // Set default image or placeholder
            setCurrentProfileUrl('/placeholder-logo.png');
            onProfilePicChange('/placeholder-logo.png');
        } catch (error) {
            console.error('Error deleting profile picture:', error);
        }
        
        setShowPicConfirmation(false);
    };

    const confirmProfilePicDelete = () => {
        setShowPicConfirmation(true);
    };

    const cancelProfilePicDelete = () => {
        setShowPicConfirmation(false);
    };

    const modalContent = (
        <>
            {/* Profile Picture Section */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
                <div className="flex items-start gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-white overflow-hidden">
                            <img 
                                src={currentProfileUrl} 
                                alt={`${sponsorName} Logo`} 
                                className="max-w-full max-h-full object-contain p-1" 
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                            <label 
                                htmlFor="profile-pic-upload" 
                                className="bg-bapred text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md"
                                title="Change picture"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                  <path d="M12 5v14M5 12h14"></path>
                                </svg>
                            </label>
                        </div>
                        <input 
                            id="profile-pic-upload"
                            type="file" 
                            accept="image/*" 
                            onChange={e => setProfilePicFile(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                    </div>
                    
                    <div className="flex flex-col">
                        <h4 className="text-xl font-bold">{sponsorName}</h4>
                        
                        {profilePicFile && (
                            <p className="text-sm text-gray-600 mt-1">
                                New image selected: {profilePicFile.name.length > 20 ? 
                                    profilePicFile.name.substring(0, 20) + '...' : 
                                    profilePicFile.name}
                            </p>
                        )}
                        
                        {!profilePicFile && !uploadingProfilePic && (
                            <button 
                                onClick={confirmProfilePicDelete}
                                className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm mt-2 w-fit"
                            >
                                Remove Picture
                            </button>
                        )}
                        
                        {profilePicFile && (
                            <div className="flex gap-2 mt-2">
                                <button 
                                    onClick={handleProfilePicUpload} 
                                    disabled={uploadingProfilePic}
                                    className="px-3 py-1 bg-bapred text-white rounded-md text-sm disabled:opacity-50"
                                >
                                    {uploadingProfilePic ? 'Uploading...' : 'Save Picture'}
                                </button>
                                <button 
                                    onClick={() => setProfilePicFile(null)}
                                    className="px-3 py-1 bg-gray-400 text-white rounded-md text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 ml-1">Recommended size: 250x250px square image</p>
            </div>
            
            {/* Links Section */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Links</h3>
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={newLink} 
                        onChange={e => {
                            setNewLink(e.target.value);
                            // Mark that we're making changes to links
                            if (e.target.value.trim()) {
                                hasChangesRef.current.links = true;
                            }
                        }}
                        placeholder="https://example.com"
                        className="flex-grow px-3 py-2 border rounded-md"
                    />
                    <button 
                        onClick={handleAddLink}
                        className="px-4 py-2 bg-bapred text-white rounded-md font-bold"
                        title="Add link"
                    >
                        +
                    </button>
                </div>
                {linkError && <p className="text-red-500 text-sm mb-4">{linkError}</p>}
                
                {editingLink.index !== -1 && (
                    <div className="mb-4 p-3 border rounded-md bg-gray-50">
                        <h4 className="font-medium mb-2">Edit Link</h4>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={editingLink.value} 
                                onChange={e => {
                                    setEditingLink({ ...editingLink, value: e.target.value });
                                    // Force change tracking for link edits
                                    hasChangesRef.current.links = true;
                                    console.log("Editing link value, changes set to true:", hasChangesRef.current);
                                }}
                                className="flex-grow px-3 py-2 border rounded-md"
                            />
                            <button 
                                onClick={saveEditLink}
                                className="px-3 py-2 bg-green-600 text-white rounded-md"
                                title="Save"
                            >
                                Save
                            </button>
                            <button 
                                onClick={cancelEditLink}
                                className="px-3 py-2 bg-gray-400 text-white rounded-md"
                                title="Cancel"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                
                {linksList.length > 0 && (
                    <ul className="overflow-hidden">
                        {linksList.map((link, index) => (
                            <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md">
                                <span className="text-black truncate max-w-[80%]">{link}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            startEditLink(index);
                                            // Mark as changed when editing a link
                                            hasChangesRef.current.links = true;
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                                        title="Edit"
                                    >
                                        <MoreHorizontal size={16} className="text-gray-600" />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            confirmRemoveLink(link, e);
                                            // Mark as changed when removing a link
                                            hasChangesRef.current.links = true;
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                                        title="Remove"
                                    >
                                        <X size={16} className="text-red-600" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {/* About Section */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <textarea 
                    value={about} 
                    onChange={e => {
                        const newValue = e.target.value;
                        setAbout(newValue);
                        
                        // Update ref directly - much more reliable than state
                        hasChangesRef.current.about = (newValue !== initialAbout);
                        
                        console.log("About text changed:", {
                            newValue,
                            initialAbout,
                            hasChanged: hasChangesRef.current.about
                        });
                    }}
                    onBlur={() => {
                        // Use ref directly on blur too
                        hasChangesRef.current.about = (about !== initialAbout);
                        console.log("Textarea blur - ref:", hasChangesRef.current);
                    }}
                    className="w-full px-3 py-2 border rounded-md min-h-[150px] focus:ring-bapred focus:border-bapred"
                    maxLength={500}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Company description (max 500 characters)</span>
                    <span>{about.length}/500</span>
                </div>
            </div>

            {/* Confirmation modals */}
            {showConfirmation && (
                <ConfirmDialog
                    isOpen={showConfirmation}
                    onClose={() => {
                        handleCancelRemove();
                    }}
                    onConfirm={(e) => {
                        handleRemoveLink(e);
                    }}
                    title="Confirm Removal"
                    message="Are you sure you want to remove this link?"
                    confirmText="Remove"
                    cancelText="Cancel"
                    preventOutsideClick={true}
                />
            )}

            {showPicConfirmation && (
                <ConfirmDialog
                    isOpen={showPicConfirmation}
                    onClose={() => {
                        cancelProfilePicDelete();
                    }}
                    onConfirm={() => {
                        handleProfilePicDelete();
                    }}
                    title="Confirm Deletion"
                    message="Are you sure you want to remove this profile picture?"
                    confirmText="Remove"
                    cancelText="Cancel"
                    preventOutsideClick={true}
                />
            )}
            
            {/* Link warning dialog */}
            {showLinkWarning && (
                <ConfirmDialog
                    isOpen={showLinkWarning}
                    onClose={() => {
                        setShowLinkWarning(false);
                        // Just save without the link
                        onUpdate({
                            description: about,
                            links: linksList
                        });
                        handleModalClose();
                    }}
                    onConfirm={() => {
                        handleAddAndSave();
                    }}
                    title="Unsaved Link"
                    message={`You have text in the link field that hasn't been added: "${newLink}". Would you like to add it before saving?`}
                    confirmText="Add & Save"
                    cancelText="Discard Link"
                    preventOutsideClick={true}
                />
            )}
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleModalClose}
            title="Edit Profile"
            hasUnsavedChanges={hasUnsavedChanges}
            onConfirm={handleSave}
            confirmText="Save Changes"
            cancelText="Cancel"
            showFooter={true}
            size="lg"
        >
            {modalContent}
        </Modal>
    );
};


const SponsorHome = () => {
    const { session } = useAuth();
    const token = session?.access_token;

    const navLinks = [
        { name: "Network", href: "/network" },
        { name: "Events", href: "/events" },
        { name: "Dashboard", href: "/sponsor" },
      ];

    const [sponsorProfileUrl, setSponsorProfileUrl] = useState("https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg");
    const [sponsorName] = useState("Deloitte");
    const [sponsorDescription, setSponsorDescription] = useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec blandit dapibus dolor, id malesuada sapien lacinia non. Aliquam eget mattis tellus. Praesent in elit et velit fringilla feugiat. Donec mauris velit, finibus quis quam vel, rhoncus eleifend odio. Integer a pharetra sem. Duis aliquam felis nec nulla porttitor luctus. Phasellus sed euismod enim, sit amet dignissim nibh. Nulla tempor, felis non consequat imperdiet, nunc metus interdum odio, eget placerat ipsum velit a tortor. Nulla imperdiet mi eu condimentum pharetra. Fusce quam libero, pharetra nec enim nec, ultrices scelerisque est.");
    const [sponsorLinks, setSponsorLinks] = useState<string[]>([]);
    const [resources, setResources] = useState<{id: number, name: string, url: string, uploadDate: string}[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [resourceName, setResourceName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [previewResource, setPreviewResource] = useState<{id: number, name: string, url: string} | null>(null);

    // Helper function to format dates properly
    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown date";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Recent upload" : date.toLocaleDateString();
    };

    // Reset zoom level when opening a new preview
    useEffect(() => {
        if (previewResource) {
           // No zoom state to reset
        }
    }, [previewResource]);

    useEffect(() => {
        // Fetch resources when component mounts
        if (token) {
            fetchResources();
        }
    }, [token]);

    const fetchResources = async () => {
        try {
            // Use the correct API endpoint with environment variable
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/resources`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Ensure resources is an array
            const resourcesData = Array.isArray(response.data) ? response.data : 
                                 (response.data?.resources || response.data?.data || []);
            setResources(resourcesData);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    const handleResourceUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !resourceName || !token) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('resourceLabel', resourceName);
            formData.append('file', file);

            // Use the correct API endpoint with environment variable
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/resources`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            setFile(null);
            setResourceName("");
            fetchResources(); // Refresh the resources list
        } catch (error) {
            console.error('Error uploading resource:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleProfileUpdate = (updatedProfile: { description: string; links: string[] }) => {
        setSponsorDescription(updatedProfile.description);
        setSponsorLinks(updatedProfile.links);
    };

    const handleResourceDelete = async (resourceId: number) => {
        if (!token) return;
        
        try {
            // Use the correct API endpoint with environment variable
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/resources/${resourceId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Refresh resource list after deletion
            fetchResources();
        } catch (error) {
            console.error('Error deleting resource:', error);
        }
    };

    // Function to handle showing resource preview
    const showResourcePreview = (resource: {id: number, name: string, url: string}) => {
        setPreviewResource(resource);
    };

    // Function to close the preview modal
    const closePreview = () => {
        setPreviewResource(null);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar
                    isLogged={true}
                    links={navLinks}
                    title="Beta Alpha Psi | Beta Tau Chapter"
                    backgroundColor="#FFFFFF"
                    outlineColor="#AF272F"
                />

            {/* Add padding-top to account for fixed navbar */}
            <div className="flex flex-col pt-[72px] flex-grow">
                <main className="flex-grow flex flex-col items-center justify-center">
                    <div className="py-24 px-16 md:px-32 flex-grow flex flex-col md:grid md:grid-cols-2 items-start gap-24">
                        <div className="flex flex-col items-center justify-start h-full gap-8 w-full">
                            <div className="w-full">   
                                <h1 className="text-4xl font-bold font-outfit">
                                    Welcome back, <span className="text-bapred">{sponsorName}</span>!
                                </h1>
                            </div>
                            <SponsorDescription 
                                profileUrl={sponsorProfileUrl} 
                                name={sponsorName} 
                                description={sponsorDescription} 
                                links={sponsorLinks}
                                onEditClick={() => setIsEditModalOpen(true)}
                            />
                        </div>
                        
                        {/* Resource Management */}
                        <div className="h-full w-full">
                            <div className="flex flex-col gap-8 h-full">
                                <div className="border p-6 rounded-lg shadow-md">
                                    <h2 className="text-2xl font-bold mb-4">Upload Resources</h2>
                                    <form onSubmit={handleResourceUpload} className="flex flex-col gap-4">
                                        <div>
                                            <label className="block mb-1 font-medium">Resource Name</label>
                                            <input 
                                                type="text" 
                                                value={resourceName} 
                                                onChange={e => setResourceName(e.target.value)}
                                                className="w-full px-3 py-2 border rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-medium">File</label>
                                            <input 
                                                type="file"
                                                onChange={e => setFile(e.target.files?.[0] || null)}
                                                className="w-full"
                                                required
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={!file || !resourceName || uploading}
                                            className="px-4 py-2 bg-bapred text-white rounded disabled:opacity-50"
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Resource'}
                                        </button>
                                    </form>
                                </div>
                                
                                <div className="border p-6 rounded-lg shadow-md">
                                    <h2 className="text-2xl font-bold mb-4">My Resources</h2>
                                    {Array.isArray(resources) && resources.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {resources.map(resource => (
                                                <div key={resource.id} className="flex justify-between items-center border-b pb-2">
                                                    <div>
                                                        <p className="font-medium">{resource.name}</p>
                                                        <p className="text-sm text-gray-500">Uploaded on {formatDate(resource.uploadDate)}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => showResourcePreview(resource)}
                                                            className="px-3 py-1 bg-bapred text-white rounded text-sm"
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            onClick={() => handleResourceDelete(resource.id)}
                                                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No resources uploaded yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            
            <Footer backgroundColor="#AF272F" />

            {/* Profile Edit Modal */}
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                sponsorName={sponsorName}
                sponsorDescription={sponsorDescription}
                onUpdate={handleProfileUpdate}
                token={session?.access_token || ""}
                profileUrl={sponsorProfileUrl}
                onProfilePicChange={(url) => setSponsorProfileUrl(url)}
                links={sponsorLinks}
            />

            {/* Resource Preview Modal */}
            {previewResource && (
                <Modal
                    isOpen={!!previewResource}
                    onClose={closePreview}
                    title={previewResource.name}
                    showFooter={true}
                    confirmText="Close"
                    onConfirm={closePreview}
                    size="lg"
                >
                    <div className="w-full h-[70vh] flex flex-col items-center">
                         {/* Header row for Open in New Tab button only */}
                         <div className="w-full mb-4 flex justify-end items-center">
                            <a 
                                href={previewResource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-bapred text-white rounded text-sm"
                            >
                                Open in New Tab
                            </a>
                        </div>
                        
                        {/* Scrollable container for preview content */}
                        <div 
                            className="w-full flex-1 overflow-auto border border-gray-200 bg-gray-50"
                            style={{ maxHeight: 'calc(70vh - 60px)' }} // Adjust height based on controls row height
                        >
                            {previewResource.url.endsWith('.pdf') ? (
                                // PDF container
                                <div 
                                    className="w-full h-full flex justify-center"
                                    style={{ minHeight: '100%' }} // Ensure PDF takes full height
                                >
                                    <iframe 
                                        src={`${previewResource.url}#toolbar=0`} 
                                        className="w-full h-full border-none shadow-md"
                                        title={previewResource.name}
                                        loading="eager"
                                    />
                                </div>
                            ) : previewResource.url.match(/\.(jpe?g|png|gif|svg|webp)$/i) ? (
                                // Image container
                                <div 
                                    className="w-full h-full flex items-center justify-center p-4"
                                >
                                    <img 
                                        src={previewResource.url} 
                                        alt={previewResource.name} 
                                        style={{ 
                                            maxWidth: '100%', // Respect container width initially
                                            maxHeight: '100%', // Respect container height initially
                                            width: 'auto', 
                                            height: 'auto',
                                            display: 'block' // Helps with centering/sizing
                                        }}
                                        className="block shadow-md"
                                        loading="eager"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <p className="mb-4">This file type cannot be previewed in-browser.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SponsorHome;
