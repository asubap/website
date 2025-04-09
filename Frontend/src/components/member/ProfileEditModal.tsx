import type React from "react"

import { useState } from "react"
import { ChevronDown, Plus } from "lucide-react"
import { useAuth } from "../../context/auth/authProvider"


type ProfileData = {
  name: string
  email: string
  phone: string
  major: string
  graduationDate: string
  status: string
  about: string
  internship: string
  photoUrl: string
  hours: string
}

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  profileData: ProfileData
  onSave: (data: ProfileData) => void
}

export default function ProfileEditModal({ isOpen, onClose, profileData, onSave }: ProfileEditModalProps) {
  const [formData, setFormData] = useState<ProfileData>(profileData)
  const [photoPreview, setPhotoPreview] = useState<string | null>(profileData.photoUrl || null)
  const {session }= useAuth();

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoPreview(event.target.result as string)
          setFormData((prev) => ({ ...prev, photoUrl: event.target?.result as string }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    // Send the updated data to the server
  
    
    

    fetch("https://asubap-backend.vercel.app/member-info/edit-member-info/", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
        user_email: formData.email,
        about: formData.about, // leave this empty ("") if not being changed
        internship_experience: formData.internship, // leave this empty ("") if not being changed
        first_name: formData.name, // leave this empty ("") if not being changed
        last_name: "", // leave this empty ("") if not being changed
        year: formData.graduationDate, // leave this empty ("") if not being changed
        major: formData.major, // leave this empty ("") if not being changed
        contact_me: formData.phone, // leave this empty ("") if not being changed
        graduation_year: "",
        member_status: formData.status, // leave this empty ("") if not being changed
    }),
    }).then((response) => response.json())
    .then((data) => {
        
        
        console.log(data);
        
    })
    .catch((error) => console.error("Error editing:", error));
        
    onClose()
   
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Edit Form */}
          <div className="w-full lg:w-1/2 p-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Update Profile</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Profile</h3>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-[#d9d9d9] rounded-lg p-3 mb-4"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border border-[#d9d9d9] rounded-lg p-3"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border border-[#d9d9d9] rounded-lg p-3"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    name="major"
                    placeholder="Major(s)"
                    value={formData.major}
                    onChange={handleChange}
                    className="border border-[#d9d9d9] rounded-lg p-3 sm:col-span-1"
                  />
                  <input
                    type="text"
                    name="graduationDate"
                    placeholder="Graduation Date"
                    value={formData.graduationDate}
                    onChange={handleChange}
                    className="border border-[#d9d9d9] rounded-lg p-3"
                  />
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="appearance-none border border-[#d9d9d9] rounded-lg p-3 w-full pr-10"
                    >
                      <option value="">Status</option>
                      <option value="Looking for Internship">Looking for Internship</option>
                      <option value="Looking for Full-time">Looking for Full-time</option>
                      <option value="Not Looking">Not Looking</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>

                <textarea
                  name="about"
                  placeholder="Write about yourself..."
                  value={formData.about}
                  onChange={handleChange}
                  className="w-full border border-[#d9d9d9] rounded-lg p-3 min-h-[150px]"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-[#d9d9d9] rounded-full text-[#202020] hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#af272f] text-white rounded-full hover:bg-[#8f1f26] transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>

          {/* Center - Photo Upload */}
          <div className="w-full lg:w-auto flex justify-center items-start p-6">
            <div className="relative">
              <div className="w-36 h-36 bg-[#d9d9d9] rounded-full flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Profile Preview"
                    width={144}
                    height={144}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-sm">
                    <div>Upload</div>
                    <div>
                      Photo <Plus className="inline-block" size={12} />
                    </div>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label="Upload profile photo"
              />
            </div>
          </div>

          
      </div>
    </div>
    </div>

  )
}
