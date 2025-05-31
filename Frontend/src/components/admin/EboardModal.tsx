import React, { useState, useMemo, useRef, useEffect } from "react";
import Modal from "../ui/Modal"; // Assuming Modal is in ui
import { createPortal } from "react-dom";

interface EboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEditing: boolean;
  eboardData: {
    name: string;
    role: string;
    email: string;
    memberEmail: string;
    major: string;
    location: string;
  };
  onEboardDataChange: (field: "name" | "role" | "email" | "memberEmail" | "major" | "location", value: string) => void;
  hideImageField?: boolean;
  members: { email: string; name?: string }[];
}

const EboardModal: React.FC<EboardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isEditing,
  eboardData,
  onEboardDataChange,
  members = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  // Sync searchQuery with eboardData.memberEmail when modal opens or memberEmail changes
  useEffect(() => {
    setSearchQuery(eboardData.memberEmail || "");
  }, [isOpen, eboardData.memberEmail]);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return members;
    }

    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.email.toLowerCase().includes(query) ||
        (member.name && member.name.toLowerCase().includes(query))
    );
  }, [searchQuery, members]);

  const handleMemberSelect = (email: string) => {
    onEboardDataChange("memberEmail", email);
    setSearchQuery(email);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredMembers.length > 0) {
      e.preventDefault();
      handleMemberSelect(filteredMembers[0].email);
    }
  };

  // Position dropdown below input
  useEffect(() => {
    if (showResults && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showResults, searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showResults) return;
    const handleClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showResults]);

  // Dropdown element for portal
  const dropdown = showResults && searchQuery && (
    createPortal(
      <div
        className="z-[99999] bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto absolute"
        style={{
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
        }}
      >
        <div className="py-1">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div
                key={member.email}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => handleMemberSelect(member.email)}
              >
                {member.name ? `${member.name} (${member.email})` : member.email}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No members found</div>
          )}
        </div>
      </div>,
      document.body
    )
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Eboard Member" : "Add Eboard Member"}
      onConfirm={onConfirm}
      confirmText={isEditing ? "Update" : "Add"}
      size="md"
    >
      <div className="space-y-6 py-4 max-h-[90vh] overflow-y-auto">
        {/* Role Name Input */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="role"
            value={eboardData.role}
            onChange={(e) => onEboardDataChange("role", e.target.value)}
            className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
            required
          />
        </div>

        {/* Role-Email Input */}
        <div>
          <label
            htmlFor="role-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="role-email"
            value={eboardData.email}
            onChange={(e) => onEboardDataChange("email", e.target.value)}
            className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
            required
          />
        </div>

        {/* Member Search and Selection */}
        <div>
          <label
            htmlFor="member-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Member Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              id="member-email"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowResults(true)}
              placeholder="Search members by name or email..."
              className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
              required
              autoComplete="off"
            />
          </div>
        </div>
        {dropdown}
      </div>
    </Modal>
  );
};

export default EboardModal;
