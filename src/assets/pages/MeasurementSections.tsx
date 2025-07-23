<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap" />




import React, { useEffect } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";

interface MeasurementSectionProps {
  selections: any[];
  units: string[];
  handleRemoveArea: (index: number) => void;
  handleReferenceChange: (
    mainIndex: number,
    index: number,
    value: string
  ) => void;
  handleunitchange: (mainIndex: number, index: number, value: string) => void;
  handlewidthchange: (mainIndex: number, index: number, value: string) => void;
  handleheightchange: (mainIndex: number, index: number, value: string) => void;
  handlequantitychange: (
    mainIndex: number,
    index: number,
    value: string
  ) => void;
  setSelections: (selections: any[]) => void;
  handleGroupDelete: (mainIndex: number, index: number) => void;
}

const MeasurementSection: React.FC<MeasurementSectionProps> = ({
  selections,
  units,
  handleRemoveArea,
  handleReferenceChange,
  handleunitchange,
  handlewidthchange,
  handleheightchange,
  handlequantitychange,
  setSelections,
  handleGroupDelete,
}) => {
  // Handler for Default Unit change
  const handleDefaultUnitChange = (value: string) => {
    const updatedSelections = selections.map((selection) => ({
      ...selection,
      areacollection: selection.areacollection.map((collection) => ({
        ...collection,
        measurement: {
          ...collection.measurement,
          unit: value,
        },
      })),
    }));
    setSelections(updatedSelections);
  };

  // Determine the default unit value for the select
  const defaultUnit = selections.every((selection) =>
    selection.areacollection.every(
      (collection) =>
        collection.measurement.unit ===
        selections[0]?.areacollection[0]?.measurement.unit
    )
  )
    ? selections[0]?.areacollection[0]?.measurement.unit || ""
    : "";

  return (
    <div className="flex flex-col gap-6 p-6 bg-white !rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl font-inter">
      <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-gray-900 tracking-tight mb-4">
        Measurements
      </h2>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Area Selection */}
        <div className="w-full lg:w-1/4 border border-gray-100 !rounded-lg p-4 bg-gray-50 shadow-sm transition-all duration-300 hover:shadow-md">
          <p className="text-sm font-poppins font-medium text-gray-700 mb-2">Area</p>
{Array.isArray(selections) && selections.length > 0 ? (
  selections.map((selection, index) => (
    <div
      key={index}
      className="flex items-center justify-between py-2 px-3 border-b border-gray-100 last:border-b-0"
    >
      <p className="text-sm font-inter text-gray-900">
        {selection?.area || "Unnamed Area"}
      </p>
      <button
        className={`text-red-500 hover:text-red-600 transition-colors duration-200 ${!selection?.area ? "hidden" : ""}`}
        onClick={() => handleRemoveArea(index)}
      >
        <FaTrash className="w-4 h-4" />
      </button>
    </div>
  ))
) : (
  <p className="text-sm text-gray-500 px-3 py-2">No areas selected.</p>
)}

        </div>

        {/* Right Column: Measurement Details */}
        <div className="w-full lg:w-3/4 border border-gray-100 !rounded-lg p-4 bg-gray-50 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-4">
            <p className="text-sm font-poppins font-medium text-gray-700">Default Unit</p>
            <select
              className="w-full lg:w-64 border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-white"
              value={defaultUnit}
              onChange={(e) => handleDefaultUnitChange(e.target.value)}
            >
              <option value="" className="text-gray-500">Select Unit</option>
{Array.isArray(units) && units.length > 0 ? (
  units.map((unit) => (
    <option key={unit} value={unit} className="font-inter">
      {unit}
    </option>
  ))
) : (
  <option value="" disabled>
    No units available
  </option>
)}

            </select>
          </div>
          <div className="flex flex-col gap-4">
{Array.isArray(selections) && selections.length > 0 ? (
  selections.map((selection, mainindex) => (
    <div key={mainindex} className="flex flex-col gap-3">
      <p className="text-base font-poppins font-medium text-gray-900">
        {selection?.area || "Unnamed Area"}
      </p>

      {Array.isArray(selection?.areacollection) && selection.areacollection.length > 0 ? (
        selection.areacollection.map((collection, index) => (
          <div
            key={index}
            className="flex flex-col lg:flex-row items-start lg:items-center gap-4 p-3 border border-gray-100 !rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div className="flex flex-col lg:flex-row w-full gap-4">
              <div className="flex flex-col w-full lg:w-1/4">
                <p className="text-sm font-poppins font-medium text-gray-700 mb-1">Product Group</p>
                <input
                  type="text"
                  className="w-full border border-gray-200 !rounded-lg px-2 py-2 text-sm bg-gray-50 font-inter"
                  value={collection?.productGroup?.[0] || ""}
                  readOnly
                />
              </div>

              <div className="flex flex-col w-full lg:w-1/4">
                <p className="text-sm font-poppins font-medium text-gray-700 mb-1">Reference</p>
                <input
                  type="text"
                  onChange={(e) => handleReferenceChange(mainindex, index, e.target.value)}
                  className="w-full border border-gray-200 !rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                  value={collection?.reference || ""}
                  placeholder="Enter reference"
                />
              </div>

              <div className="flex flex-col w-full lg:w-1/4">
                <p className="text-sm font-poppins font-medium text-gray-700 mb-1">Measurement</p>
                <select
                  onChange={(e) => handleunitchange(mainindex, index, e.target.value)}
                  className="w-full border border-gray-200 !rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-white"
                  value={collection?.measurement?.unit ?? ""}
                >
                  <option value="" className="text-gray-500">Select Unit</option>
                  {Array.isArray(units) && units.length > 0 ? (
                    units.map((unit) => (
                      <option key={unit} value={unit} className="font-inter">
                        {unit}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No Units Available</option>
                  )}
                </select>
              </div>

              <div className="flex flex-col w-full lg:w-1/5">
                <p className="text-sm font-poppins font-medium text-gray-700 mb-1">Width</p>
                <input
                  onChange={(e) => handlewidthchange(mainindex, index, e.target.value)}
                  type="number"
                  className="w-full border border-gray-200 !rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                  value={collection?.measurement?.width ?? ""}
                  placeholder="Enter width"
                />
              </div>

              <div className="flex flex-col w-full lg:w-1/5">
                <p className="text-sm font-poppins font-medium text-gray-700 mb-1">Height</p>
                <input
                  onChange={(e) => handleheightchange(mainindex, index, e.target.value)}
                  type="number"
                  className="w-full border border-gray-200 !rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                  value={collection?.measurement?.height ?? ""}
                  placeholder="Enter height"
                />
              </div>
            </div>

            <div className="flex flex-col w-full lg:w-auto">
              <p className="text-sm font-poppins font-medium text-gray-700 mb-1 hidden lg:block"></p>
              <button
                onClick={() => handleGroupDelete(mainindex, index)}
                className="text-red-500 hover:text-red-600 transition-colors duration-200 mt-2 lg:mt-0"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No product groups added.</p>
      )}
    </div>
  ))
) : (
  <p className="text-sm text-gray-500">No selections available.</p>
)}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementSection;