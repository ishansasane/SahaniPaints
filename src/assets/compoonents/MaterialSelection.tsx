import { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

interface AreaSelection {
  area: string;
  productGroups: string[];
}

const MaterialSelection = ({ setMaterials }) => {
  const [selections, setSelections] = useState<AreaSelection[]>([]);

  const availableAreas = ["Living Room", "Kitchen", "Bedroom", "Bathroom"];
  const availableProductGroups = [
    "Tiles",
    "Wood",
    "Marble",
    "Paint",
    "Wallpaper",
  ];

  const handleAddArea = () => {
    setSelections([...selections, { area: "", productGroups: [] }]);
  };

  const handleRemoveArea = (index: number) => {
    const updatedSelections = selections.filter((_, i) => i !== index);
    setSelections(updatedSelections);
  };

  const handleAreaChange = (index: number, newArea: string) => {
    const updatedSelections = [...selections];
    updatedSelections[index].area = newArea;
    setSelections(updatedSelections);
  };

  const handleProductGroupChange = (index: number, product: string) => {
    const updatedSelections = [...selections];
    const selectedProductGroups = updatedSelections[index].productGroups;

    if (selectedProductGroups.includes(product)) {
      updatedSelections[index].productGroups = selectedProductGroups.filter(
        (p) => p !== product
      );
    } else {
      updatedSelections[index].productGroups = [
        ...selectedProductGroups,
        product,
      ];
    }

    setSelections(updatedSelections);
  };

  // ✅ Update `materials` in `FormPage.tsx` when selections change
  useEffect(() => {
    setMaterials(
      selections.filter(
        (selection) => selection.area && selection.productGroups.length > 0
      )
    );
  }, [selections, setMaterials]);

  return (
    <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">
        Material Selection
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Area Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-600">
            Select Areas
          </h3>
          {selections.map((selection, index) => (
            <div key={index} className="flex items-center gap-2 mb-4">
              <select
                className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
                value={selection.area}
                onChange={(e) => handleAreaChange(index, e.target.value)}
              >
                <option value="">Select Area</option>
                {availableAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleRemoveArea(index)}
              >
                <FaTrash size={18} />
              </button>
            </div>
          ))}
          <button
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={handleAddArea}
          >
            <FaPlus /> Add Area
          </button>
        </div>

        {/* Right Column: Product Group Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-600">
            Select Product Groups
          </h3>
{selections && selections.length > 0 ? (
  selections.map(
    (selection, index) =>
      selection.area && (
        <div
          key={index}
          className="mb-4 border p-4 rounded-lg shadow-sm bg-gray-50"
        >
          <h4 className="text-md font-semibold mb-2 text-gray-700">
            {selection.area}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {availableProductGroups.map((product) => (
              <label
                key={product}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-500"
                  checked={selection.productGroups.includes(product)}
                  onChange={() =>
                    handleProductGroupChange(index, product)
                  }
                />
                {product}
              </label>
            ))}
          </div>
        </div>
      )
  )
) : (
  <div className="text-gray-500 italic">No areas available</div>
)}

        </div>
      </div>
    </div>
  );
};

export default MaterialSelection;
