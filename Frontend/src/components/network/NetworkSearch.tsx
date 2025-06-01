import React, { useState, useEffect } from "react";
import SearchInput from "../common/SearchInput";

interface Filters {
  graduationYear: string;
  major: string;
  status: string;
}

interface NetworkSearchProps {
  onSearch: (query: string, filters: Filters) => void;
  availableGraduationYears: string[];
  availableMajors: string[];
  availableStatuses: string[];
}

const NetworkSearch: React.FC<NetworkSearchProps> = ({ onSearch, availableGraduationYears, availableMajors, availableStatuses }) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    graduationYear: "",
    major: "",
    status: "",
  });

  // Use useEffect to trigger search whenever searchQuery or filters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearch(query, filters);
    }, 300); // 300ms debounce to prevent too many searches while typing

    return () => clearTimeout(delayDebounce);
  }, [query, filters, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    triggerSearch(e.target.value, filters);
  };

  const handleReset = () => {
    setQuery("");
    setFilters({
      graduationYear: "",
      major: "",
      status: "",
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    triggerSearch(query, newFilters);
  };

  const triggerSearch = (currentQuery: string, currentFilters: Filters) => {
    onSearch(currentQuery, currentFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-4">
      <div className="mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={query}
              onChange={handleInputChange}
              onIconClick={() => onSearch(query, filters)}
              placeholder="Search by name, major, or email..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                />
              </svg>
              Filters
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="graduationYear"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Graduation Year
            </label>
            <select
              id="graduationYear"
              name="graduationYear"
              value={filters.graduationYear}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Years</option>
              {availableGraduationYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="major"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Major
            </label>
            <select
              id="major"
              name="major"
              value={filters.major}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Majors</option>
              {availableMajors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Member Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSearch;
