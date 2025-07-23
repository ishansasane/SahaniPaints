import React from "react";

interface CardProps {
  title: string;
  value: number;
  color: string; // Tailwind color class (e.g., "bg-blue-500")
  isCurrency?: boolean; // If true, show ₹ before value
}

const Card: React.FC<CardProps> = ({ title, value, color, isCurrency = false }) => {
  return (
    <div className="flex items-center bg-transparent shadow-md border border-zinc-790 !rounded-lg p-2 w-full max-w-sm">

      {/* Vertical Colored Line */}
      <div className={`w-1 h-full ${color} !rounded-full`}></div>

      {/* Content */}
      <div className="ml-4 flex flex-col">
        <p className="md:text-[1.3vw] font-semibold">{title}</p>
        <p className="md:text-[1.1vw] mb-1 font-semibold text-gray-900">
          {isCurrency ? `₹${value.toLocaleString('en-IN')}` : value.toLocaleString('en-IN')}

        </p>
      </div>
    </div>
  );
};

export default Card;
