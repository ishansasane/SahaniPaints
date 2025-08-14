import { useState } from "react";

interface Measurement {
  area: string;
  material: string;
  length: string;
  width: string;
  height: string;
  unit: string;
}

const MeasurementSection = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  
  const availableAreas = ["Living Room", "Kitchen", "Bedroom", "Bathroom"];
  const availableMaterials = ["Tiles", "Wood", "Marble", "Paint", "Wallpaper"];
  const measurementUnits = ["cm", "m", "inch", "feet"];

  const handleAddMeasurement = () => {
    setMeasurements([...measurements, { area: "", material: "", length: "", width: "", height: "", unit: "cm" }]);
  };

  const handleMeasurementChange = (index: number, key: keyof Measurement, value: string) => {
    const updatedMeasurements = [...measurements];
    updatedMeasurements[index][key] = value;
    setMeasurements(updatedMeasurements);
  };

  return (
    <div className="mb-6 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Measurement Section</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Select Area and Material */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Select Area & Material</h3>
{Array.isArray(measurements) && measurements.length > 0 ? (
  measurements.map((measurement, index) => (
    <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
      {/* Select Area */}
      <select
        className="border p-2 rounded w-full mb-2"
        value={measurement.area}
        onChange={(e) => handleMeasurementChange(index, "area", e.target.value)}
      >
        <option value="">Select Area</option>
        {availableAreas.map((area) => (
          <option key={area} value={area}>{area}</option>
        ))}
      </select>

      {/* Select Material */}
      <select
        className="border p-2 rounded w-full"
        value={measurement.material}
        onChange={(e) => handleMeasurementChange(index, "material", e.target.value)}
      >
        <option value="">Select Material</option>
        {availableMaterials.map((material) => (
          <option key={material} value={material}>{material}</option>
        ))}
      </select>
    </div>
  ))
) : (
  <p className="text-gray-500 italic">No measurements added yet.</p>
)}

        </div>

        {/* Right Column: Enter Measurements */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Enter Measurements</h3>
          {measurements.map((measurement, index) => (
            measurement.area && measurement.material && (
              <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                <label className="block font-medium">{measurement.area} - {measurement.material}</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Length"
                    className="border p-2 rounded w-full"
                    value={measurement.length}
                    onChange={(e) => handleMeasurementChange(index, "length", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Width"
                    className="border p-2 rounded w-full"
                    value={measurement.width}
                    onChange={(e) => handleMeasurementChange(index, "width", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Height"
                    className="border p-2 rounded w-full"
                    value={measurement.height}
                    onChange={(e) => handleMeasurementChange(index, "height", e.target.value)}
                  />
                  <select
                    className="border p-2 rounded w-full"
                    value={measurement.unit}
                    onChange={(e) => handleMeasurementChange(index, "unit", e.target.value)}
                  >
                    {measurementUnits.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddMeasurement}>
        + Add Measurement
      </button>
    </div>
  );
};

export default MeasurementSection;
