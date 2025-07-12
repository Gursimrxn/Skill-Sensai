import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  availability: string;
  onSearchQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAvailabilityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  availability,
  onSearchQueryChange,
  onAvailabilityChange
}) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="flex-1 relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchQueryChange}
          className="w-full pl-12 pr-4 py-3 text-black bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-urbanist"
          placeholder="Search skills..."
        />
      </div>
      
      <div className="relative">
        <select
          value={availability}
          onChange={onAvailabilityChange}
          className="px-6 py-3 bg-white text-black rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-urbanist appearance-none pr-10"
        >
          <option>Availability</option>
          <option>Available Now</option>
          <option>Available Later</option>
          <option>Busy</option>
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <button className="px-4 py-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>
    </div>
  );
};
