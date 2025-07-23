import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setBrandData } from "../Redux/dataSlice";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface BrandDialogProps {
  setDialogOpen: (state: boolean) => void;
  setRefresh: (state: boolean) => void;
  refresh: boolean;
  editingBrand: string[] | null;
  setEditingBrand: (brand: string[] | null) => void;
  brandData: string[][];
}

async function fetchBrands() {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsbrands",
      { credentials: "include" }
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data.body) ? data.body : [];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

const BrandDialog: React.FC<BrandDialogProps> = ({
  setDialogOpen,
  setRefresh,
  refresh,
  editingBrand,
  setEditingBrand,
  brandData,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const data = editingBrand;
  const [brandName, setBrandName] = useState(editingBrand ? data[0] : "");
  const [description, setDescription] = useState(editingBrand ? data[1] : "");

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent form default reload

    if (!editingBrand) {
      const duplicate = brandData.find(
        (brand) =>
          brand[0].toLowerCase().trim() === brandName.toLowerCase().trim()
      );
      if (duplicate) {
        alert("Already data present");
        setDialogOpen(false);
        setEditingBrand(null);
        setRefresh(!refresh);
        return;
      }
    }

    const url = editingBrand
      ? "https://sheeladecor.netlify.app/.netlify/functions/server/updatepaintsbrand"
      : "https://sheeladecor.netlify.app/.netlify/functions/server/addpaintsbrand";

    try {
      const response = await fetchWithLoading(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ brandName, description }),
      });

      if (response.status === 200) {
        alert(
          editingBrand
            ? "Brand updated successfully"
            : "Brand added successfully"
        );

        const updatedData = await fetchBrands();
        const now = Date.now();

        if (Array.isArray(updatedData)) {
          dispatch(setBrandData(updatedData));
          localStorage.setItem(
            "brandData",
            JSON.stringify({ data: updatedData, time: now })
          );
        }

        setDialogOpen(false);
        setEditingBrand(null);
        setRefresh(!refresh);
        navigate("/masters/brands");
      } else {
        alert("Error saving brand");
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      alert("Error saving brand");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white p-6 rounded shadow-md w-full border">
          <h2 className="text-xl font-bold mb-4">
            {editingBrand ? "Edit Brand" : "Add Brand"}
          </h2>

          {/* ✅ FORM START */}
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                className="border p-2 rounded w-full"
                placeholder="Brand Name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                className="border p-2 rounded w-full"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingBrand(null);
                  navigate("/masters/brands");
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </form>

          {/* ✅ FORM END */}
        </div>
      </div>
    </>
  );
};

export default BrandDialog;
