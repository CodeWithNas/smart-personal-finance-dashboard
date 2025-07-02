import React from 'react';

const Spinner = ({ className = '' }) => (
  <div className="flex justify-center" role="status" aria-label="Loading">
    <div
      className={`animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full ${className}`.trim()}
    />
  </div>
);

export default Spinner;
