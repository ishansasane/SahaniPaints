import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { setProducts } from "../Redux/dataSlice";
import Select from "react-select";
import { XCircle } from "lucide-react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

async function fetchProductGroups() {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getallproductgroup",
      { credentials: "include" }
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data.body) ? data.body : [];
  } catch (error) {
    console.error("Error fetching product groups:", error);
    return [];
  }
}

const ProductGroupForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const items = useSelector((state: RootState) => state.data.items);
  const products = useSelector((state: RootState) => state.data.products);

  const [groupName, setGroupName] = useState("");
  const [mainProduct, setMainProduct] = useState("");
  const [addonProducts, setAddonProducts] = useState<string[]>([]);
  const [selectedAddon, setSelectedAddon] = useState<string>("");
  const [status, setStatus] = useState(false);

  const handleAddAddon = useCallback(() => {
    if (
      selectedAddon &&
      !addonProducts.includes(selectedAddon) &&
      selectedAddon !== mainProduct
    ) {
      setAddonProducts((prev) => [...new Set([...prev, selectedAddon])]);
      setSelectedAddon("");
    }
  }, [selectedAddon, addonProducts, mainProduct]);

  const handleAddGroup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!groupName || !mainProduct) {
      alert("Please fill in all required fields: Group Name and Main Product.");
      return;
    }

    const isDuplicate = products.some((group: any) => {
      const existingGroupName = Array.isArray(group)
        ? group[0]
        : group.groupName;
      return existingGroupName?.toLowerCase() === groupName.trim().toLowerCase();
    });

    if (isDuplicate) {
      alert("Group with this name already exists!");
      navigate("/masters/product-groups");
      return;
    }

    const groupData = {
      group_name: groupName,
      main_product: mainProduct,
      addon_products: addonProducts.length > 0 ? addonProducts : [],
      status,
    };

    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/addproductgroup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            groupName: groupData.group_name,
            mainProducts: groupData.main_product,
            addonProducts: JSON.stringify(groupData.addon_products),
            status: groupData.status,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save product group. ${errorText}`);
      }

      const result = await response.json();
      console.log("Saved Group:", result);

      const data = await fetchProductGroups();
      dispatch(setProducts(data));
      localStorage.setItem("productGroupData", JSON.stringify({ data, time: Date.now() }));

      alert("Product Group saved successfully!");
      navigate("/masters/product-groups");
    } catch (error: any) {
      console.error("Error saving product group:", error);
      alert(`Failed to save product group: ${error.message}`);
    }
  };

  const availableAddonProducts = items.filter(
    (item) => !addonProducts.includes(item[0]) && item[0] !== mainProduct
  );

  const mainProductOptions = items.map((item) => ({
    value: item[0],
    label: item[0],
  }));

  const addonProductOptions = availableAddonProducts.map((item) => ({
    value: item[0],
    label: item[0],
  }));

  // ✅ Global Enter key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddGroup();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [groupName, mainProduct, addonProducts, status]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800">New Product Group</h2>
      <p className="text-gray-500 text-sm mb-6">
        <Link className="text-black !no-underline" to="/">Dashboard</Link> {" > "}
        <Link className="text-black !no-underline" to="/masters/product-groups">Product Groups</Link> {" > "}
        New Product Group
      </p>

      <form onSubmit={handleAddGroup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter Product Name"
            className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Main Product <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => navigate("/add-product")}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              + Product
            </button>
            <Select
              options={mainProductOptions}
              value={mainProductOptions.find((opt) => opt.value === mainProduct) || null}
              onChange={(option) => setMainProduct(option ? option.value : "")}
              placeholder="Select Main Product"
              className="w-full"
              classNamePrefix="react-select"
              isSearchable
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Addon Products
          </label>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => navigate("/add-product")}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              + Product
            </button>
            <Select
              options={addonProductOptions}
              value={addonProductOptions.find((opt) => opt.value === selectedAddon) || null}
              onChange={(option) => setSelectedAddon(option ? option.value : "")}
              placeholder="Select Addon Product"
              className="w-full"
              classNamePrefix="react-select"
              isSearchable
            />
            <button
              type="button"
              onClick={handleAddAddon}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              disabled={!selectedAddon}
            >
              Add
            </button>
          </div>

          {addonProducts.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Selected Addon Products:</p>
              <ul className="list-disc pl-5">
                {addonProducts.map((product, index) => (
                  <li key={index} className="text-sm flex items-center text-gray-600 gap-2">
                    {product}
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() =>
                        setAddonProducts(addonProducts.filter((p) => p !== product))
                      }
                    >
                      <XCircle size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                status ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() => setStatus(!status)}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform ${
                  status ? "translate-x-6" : "translate-x-0"
                } transition`}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/masters/product-groups")}
            className="border px-4 py-2 rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Group
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductGroupForm;
