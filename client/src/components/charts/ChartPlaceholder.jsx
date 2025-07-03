import React from 'react';

const ChartPlaceholder = ({ height = 160 }) => (
  <div
    className="flex items-center justify-center bg-gray-200 rounded"
    style={{ height }}
    aria-hidden="true"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-8 h-8 text-gray-400"
    >
      <path d="M3 3h18v18H3z" fill="none" />
      <path
        d="M5 13h3v6H5zm5-4h3v10h-3zm5-3h3v13h-3z"
        className="text-gray-400"
        fill="currentColor"
      />
    </svg>
  </div>
);

export default ChartPlaceholder;
