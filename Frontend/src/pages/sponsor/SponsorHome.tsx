import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import SponsorDescription from "../../components/sponsor/SponsorDescription";
import axios from "axios";
import { useAuth } from "../../context/auth/authProvider";
import { MoreHorizontal, X } from "lucide-react";

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
    const [about, setAbout] = useState(sponsorDescription);
    const [linksList, setLinksList] = useState<string[]>(links);
    const [newLink, setNewLink] = useState("");
    const [editingLink, setEditingLink] = useState({ index: -1, value: "" });
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
    const [currentProfileUrl, setCurrentProfileUrl] = useState(profileUrl);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [linkToRemove, setLinkToRemove] = useState("");
    const [linkError, setLinkError] = useState("");
    const [showPicConfirmation, setShowPicConfirmation] = useState(false);
    const [showUnsavedChangesConfirmation, setShowUnsavedChangesConfirmation] = useState(false);
    const [closeTrigger, setCloseTrigger] = useState<'x' | 'outside' | null>(null);
    
    // Track if there are unsaved changes
    const hasUnsavedChanges = () => {
        return about !== sponsorDescription || 
               JSON.stringify(linksList) !== JSON.stringify(links) || 
               profilePicFile !== null;
    };

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setAbout(sponsorDescription);
        setLinksList(links);
        setCurrentProfileUrl(profileUrl);
    }, [sponsorDescription, links, profileUrl, isOpen]);

    // Handle clicks outside the modal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handleClose('outside');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleClose = (trigger: 'x' | 'outside') => {
        if (hasUnsavedChanges()) {
            setCloseTrigger(trigger);
            setShowUnsavedChangesConfirmation(true);
        } else {
            onClose();
        }
    };

    const confirmClose = () => {
        setShowUnsavedChangesConfirmation(false);
        onClose();
    };

    const cancelClose = () => {
        setShowUnsavedChangesConfirmation(false);
        setCloseTrigger(null);
    };

    const isValidUrl = (urlString: string) => {
        try {
            // Check if it's a valid URL format
            const url = new URL(urlString);
            // Check if it has http or https protocol
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (e) {
            return false;
        }
    };

    const handleAddLink = () => {
        setLinkError("");
        if (!newLink) return;

        if (!isValidUrl(newLink)) {
            setLinkError("Please enter a valid URL (must include http:// or https://)");
            return;
        }

        if (!linksList.includes(newLink)) {
            setLinksList([...linksList, newLink]);
            setNewLink("");
        }
    };

    const startEditLink = (index: number) => {
        setEditingLink({ index, value: linksList[index] });
    };

    const saveEditLink = () => {
        setLinkError("");
        if (!editingLink.value) {
            setEditingLink({ index: -1, value: "" });
            return;
        }

        if (!isValidUrl(editingLink.value)) {
            setLinkError("Please enter a valid URL (must include http:// or https://)");
            return;
        }

        const newLinks = [...linksList];
        newLinks[editingLink.index] = editingLink.value;
        setLinksList(newLinks);
        setEditingLink({ index: -1, value: "" });
    };

    const cancelEditLink = () => {
        setEditingLink({ index: -1, value: "" });
        setLinkError("");
    };

    const confirmRemoveLink = (linkToRemove: string) => {
        setLinkToRemove(linkToRemove);
        setShowConfirmation(true);
    };

    const handleRemoveLink = () => {
        setLinksList(linksList.filter(link => link !== linkToRemove));
        setShowConfirmation(false);
        setLinkToRemove("");
    };

    const handleCancelRemove = () => {
        setShowConfirmation(false);
        setLinkToRemove("");
    };

    const handleSave = async () => {
        try {
            // Update sponsor details
            await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/details`, {
                about,
                links: linksList
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Handle profile picture upload if selected
            if (profilePicFile) {
                await handleProfilePicUpload();
            }

            // Notify parent component of the update
            onUpdate({ description: about, links: linksList });
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleProfilePicUpload = async () => {
        if (!profilePicFile || !token) return;

        setUploadingProfilePic(true);
        try {
            const formData = new FormData();
            formData.append('file', profilePicFile);

            // Use the correct API endpoint
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/pfp`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            setCurrentProfileUrl(response.data.url);
            onProfilePicChange(response.data.url);
            setProfilePicFile(null);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        } finally {
            setUploadingProfilePic(false);
        }
    };

    const handleProfilePicDelete = async () => {
        if (!token) return;
        
        try {
            // Use the correct API endpoint
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/pfp`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const defaultPic = "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";
            setCurrentProfileUrl(defaultPic);
            onProfilePicChange(defaultPic);
            setShowPicConfirmation(false);
        } catch (error) {
            console.error('Error deleting profile picture:', error);
        }
    };

    const confirmProfilePicDelete = () => {
        setShowPicConfirmation(true);
    };

    const cancelProfilePicDelete = () => {
        setShowPicConfirmation(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Edit Profile</h2>
                    <button 
                        onClick={() => handleClose('x')}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                        aria-label="Close"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>
                
                {/* Profile Picture Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
                    <div className="flex items-start gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-md border border-gray-200 flex items-center justify-center bg-white overflow-hidden">
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
                            onChange={e => setNewLink(e.target.value)}
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
                                    onChange={e => setEditingLink({ ...editingLink, value: e.target.value })}
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
                        <ul className="border rounded-md overflow-hidden">
                            {linksList.map((link, index) => (
                                <li key={index} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-gray-50">
                                    <span className="text-black truncate max-w-[80%]">{link}</span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => startEditLink(index)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                                            title="Edit"
                                        >
                                            <MoreHorizontal size={16} className="text-gray-600" />
                                        </button>
                                        <button 
                                            onClick={() => confirmRemoveLink(link)}
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
                        onChange={e => setAbout(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md min-h-[150px] focus:ring-bapred focus:border-bapred"
                        maxLength={500}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Company description (max 500 characters)</span>
                        <span>{about.length}/500</span>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2 border-t">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 border rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-5 py-2 bg-bapred text-white rounded-md hover:bg-red-700"
                    >
                        Save Changes
                    </button>
                </div>

                {/* Confirmation Dialog */}
                {showConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Confirm Removal</h3>
                            <p className="mb-3">Are you sure you want to remove this link?</p>
                            <p className="text-black mb-6 break-all p-2 bg-gray-100 rounded">{linkToRemove}</p>
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={handleCancelRemove}
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleRemoveLink}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showPicConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
                            <p className="mb-3">Are you sure you want to remove this profile picture?</p>
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={cancelProfilePicDelete}
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleProfilePicDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showUnsavedChangesConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Unsaved Changes</h3>
                            <p className="mb-6">You have unsaved changes. Are you sure you want to close without saving?</p>
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={cancelClose}
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                                >
                                    Continue Editing
                                </button>
                                <button 
                                    onClick={confirmClose}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Discard Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Define SponsorOption component
interface SponsorOptionProps {
    header: string;
    description: string;
    buttonText: string;
    onClick: () => void;
}

const SponsorOption: React.FC<SponsorOptionProps> = ({ header, description, buttonText, onClick }) => {
    return (
        <div className="p-6 border border-gray-300 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2">{header}</h3>
            <p className="mb-4">{description}</p>
            <button 
                onClick={onClick}
                className="px-4 py-2 bg-bapred text-white rounded hover:bg-bapreddark transition-colors"
            >
                {buttonText}
            </button>
        </div>
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
    const [sponsorName] = useState("Google");
    const [sponsorDescription, setSponsorDescription] = useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec blandit dapibus dolor, id malesuada sapien lacinia non. Aliquam eget mattis tellus. Praesent in elit et velit fringilla feugiat. Donec mauris velit, finibus quis quam vel, rhoncus eleifend odio. Integer a pharetra sem. Duis aliquam felis nec nulla porttitor luctus. Phasellus sed euismod enim, sit amet dignissim nibh. Nulla tempor, felis non consequat imperdiet, nunc metus interdum odio, eget placerat ipsum velit a tortor. Nulla imperdiet mi eu condimentum pharetra. Fusce quam libero, pharetra nec enim nec, ultrices scelerisque est.");
    const [sponsorLinks, setSponsorLinks] = useState<string[]>([]);
    const [resources, setResources] = useState<{id: number, name: string, url: string, uploadDate: string}[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [resourceName, setResourceName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [sponserOptions] = useState([
        { 
            header: "Edit Profile", 
            description: "Edit your profile information.", 
            buttonText: "Edit", 
            onClick: () => setIsEditModalOpen(true) 
        },
        { header: "View Applications", description: "View applications from members.", buttonText: "View", onClick: () => console.log("View Applications") },
        { header: "Post Event", description: "Post an event for members to see.", buttonText: "Post", onClick: () => console.log("Post Event") },
    ]);

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
                                                        <p className="text-sm text-gray-500">Uploaded on {new Date(resource.uploadDate).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <a 
                                                            href={resource.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                                        >
                                                            View
                                                        </a>
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

            {isEditModalOpen && (
                <ProfileEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    sponsorName={sponsorName}
                    sponsorDescription={sponsorDescription}
                    onUpdate={handleProfileUpdate}
                    token={token}
                    profileUrl={sponsorProfileUrl}
                    onProfilePicChange={setSponsorProfileUrl}
                    links={sponsorLinks}
                />
            )}
        </div>
    );
};

export default SponsorHome;
