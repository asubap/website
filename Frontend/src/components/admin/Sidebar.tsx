import React from "react";

interface SidebarProps {
  sections: { key: string; label: string }[];
  activeSection: string;
  onSidebarItemClick: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sections,
  activeSection,
  onSidebarItemClick,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = (key: string) => {
    onSidebarItemClick(key);
    setIsOpen(false); // close on mobile
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-20 left-4 z-30 bg-bapred text-white px-3 py-2 rounded focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? "Close" : "Menu"}
      </button>
      {/* Sidebar */}
      <aside
        className={`
          hidden md:block fixed left-0 top-20 bottom-0 w-56 bg-white border-r border-gray-200 shadow-md z-10
        `}
      >
        <nav className="flex flex-col py-12 px-4 gap-2">
          {sections.map((section) => (
            <button
              key={section.key}
              className={`
                text-left px-4 py-2 rounded font-medium transition-colors
                ${
                  activeSection === section.key
                    ? "bg-bapred text-white"
                    : "text-bapred hover:bg-bapred/10"
                }
              `}
              onClick={() => handleClick(section.key)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Overlay and sidebar for mobile */}
      <aside
        className={`
          md:hidden fixed top-20 left-0 z-20 h-[calc(100vh-5rem)] w-56 bg-white border-r border-gray-200 shadow-md
          transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="flex flex-col py-6 px-4 gap-2">
          {sections.map((section) => (
            <button
              key={section.key}
              className={`
                text-left px-4 py-2 rounded font-medium transition-colors
                ${
                  activeSection === section.key
                    ? "bg-bapred text-white"
                    : "text-bapred hover:bg-bapred/10"
                }
              `}
              onClick={() => handleClick(section.key)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
