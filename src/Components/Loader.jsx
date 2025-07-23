// components/Loader.jsx
import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#292a62]"></div>
    </div>
  );
};

export default Loader;
