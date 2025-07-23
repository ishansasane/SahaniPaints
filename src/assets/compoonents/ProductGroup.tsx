import { useState, useEffect } from "react";
import { Plus, Pencil, XCircle } from "lucide-react";
import ProductGroupDialog from "../compoonents/AddProductGroupDialog";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/Store.ts";
import { setProducts } from "../Redux/dataSlice.ts";
import { useNavigate } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading.ts";

interface ProductGroup {
  groupName: string;
  mainProducts: string;
  addonProducts: string;
  color: string;
  needsTailoring: boolean;
}

// Fetch product groups from the server
async function fetchProductGroups(): Promise<ProductGroup[]> {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getallproductgroup",
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.body) ? data.body : [];
  } catch (error) {
    console.error("Error fetching product groups:", error);
    return [];
  }
}

export default function ProductGroups() {
  const navigate = useNavigate();
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [refresh, setRefresh] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [mainProduct, setMainProduct] = useState("");
  const [addonProduct, setAddonProduct] = useState<string[]>([]);
  const [color, setColor] = useState("#ffffff");
  const [status, setStatus] = useState<boolean>(true);
  const [needsTailoring, setNeedsTailoring] = useState(false);

  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.data.items);
  const products = useSelector((state: RootState) => state.data.products);

  useEffect(() => {
    const fetchAndSetData = async () => {
      const data = await fetchProductGroups();
      dispatch(setProducts(data));
      setProductGroups(data);
      localStorage.setItem(
        "productGroupData",
        JSON.stringify({ data, time: Date.now() })
      );
    };

    const localStorageData = localStorage.getItem("productGroupData");

    if (localStorageData) {
      const parsed = JSON.parse(localStorageData);
      const age = Date.now() - parsed.time;
      if (age < 60 * 60 * 1000 && parsed.data?.length > 0) {
        dispatch(setProducts(parsed.data));
        setProductGroups(parsed.data);
      } else {
        fetchAndSetData();
      }
    } else {
      fetchAndSetData();
    }
    setRefresh(false);
  }, [dispatch, refresh]); // Removed products from dependencies

  // Filter product groups based on search input
  const filteredProductGroups = productGroups.filter((group) =>
    [group[0], group[1], group[2]]
      .map((field) => (field || "").toString().toLowerCase())
      .some((field) => field.includes(search.toLowerCase()))
  );

  async function deleteProductGroup(groupName: string) {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/deleteproductgroup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ groupName }),
        }
      );
      const data = await fetchProductGroups();
      dispatch(setProducts(data));
      setProductGroups(data);
      localStorage.setItem(
        "productGroupData",
        JSON.stringify({ data, time: Date.now() })
      );
      if (response.status === 200) {
        alert("Product group deleted");
        setRefresh(true);
      } else {
        alert("Error deleting product group");
      }
    } catch (error) {
      console.error("Error deleting product group:", error);
      alert("Error: Network issue or server not responding");
    }
  }

  const handleEditGroup = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/updateproductgroup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            groupName,
            mainProducts: mainProduct,
            addonProducts: JSON.stringify(addonProduct),
            status,
          }),
        }
      );
      const data = await fetchProductGroups();
      dispatch(setProducts(data));
      setProductGroups(data);
      localStorage.setItem(
        "productGroupData",
        JSON.stringify({ data, time: Date.now() })
      );
      if (response.status === 200) {
        alert("Product group edited");
        setDialogOpen(false);
        setGroupName("");
        setMainProduct("");
        setAddonProduct([]);
        setStatus(true);
      } else {
        alert("Error editing product group");
      }
    } catch (error) {
      console.error("Error editing product group:", error);
      alert("Error: Network issue or server not responding");
    }
  };

  const handleAddonProductChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setAddonProduct(selectedOptions);
  };

  return (
    <div className="md:p-6 h-full pt-20 bg-gray-50">
      <div className="flex justify-between flex-wrap items-center mb-4">
        <h1 className="text-2xl font-bold">Product Groups</h1>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 !rounded-lg hover:bg-blue-700"
          onClick={() => navigate("/product-group-form")}
        >
          <Plus size={18} /> Add Product Group
        </button>
      </div>
      <div className="bg-white shadow !rounded-lg overflow-x-auto p-5">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search product groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 !rounded-md w-full"
          />
        </div>

        <table className="w-full">
          <thead className="bg-sky-50">
            <tr>
              <th className="px-4 py-3">Group Name</th>
              <th className="px-4 py-3">Main Products</th>
              <th className="px-4 py-3">Addon Products</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductGroups?.length > 0 ? (
              filteredProductGroups.map((group, index) => (
                <tr key={index} className="hover:bg-sky-50">
                  <td className="px-4 py-2">{group[0]}</td>
                  <td className="px-4 py-2">{group[1]}</td>
                  <td className="px-4 py-2">
                    {Array.isArray(group[2])
                      ? group[2].join(", ")
                      : typeof group[2] === "string"
                      ? group[2]
                          .replace(/\\/g, "")
                          .replace(/^\[|\]$/g, "")
                          .replace(/"/g, "")
                      : ""}
                  </td>
                  <td className="px-4 py-2">
                    {group[3] === "TRUE" ? "Available" : "Not Available"}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="border px-2 py-1 !rounded-md"
                      onClick={() => {
                        setEditingGroup(group);
                        setStatus(group[3] === "TRUE");
                        const cleanedAddon = Array.isArray(group[2])
                          ? group[2]
                          : group[2]
                              .replace(/\\/g, "")
                              .replace(/[\[\]"]+/g, "")
                              .split(",")
                              .map((item) => item.trim());
                        setAddonProduct(cleanedAddon);
                        setMainProduct(group[1]);
                        setGroupName(group[0]);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="border px-2 py-1 !rounded-md"
                      onClick={() => deleteProductGroup(group[0])}
                    >
                      <XCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No product groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
          <div className="max-w-4xl w-full mx-4 bg-white p-6 !rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800">
              Edit Product Group
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter Product Name"
                  className="mt-1 block w-full px-4 py-2 border !rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Main Products <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => navigate("/add-product")}
                    className="bg-blue-500 text-white px-3 py-1 !rounded hover:bg-blue-600"
                  >
                    + Product
                  </button>
                  <select
                    value={mainProduct}
                    onChange={(e) => setMainProduct(e.target.value)}
                    className="w-full px-4 py-2 border !rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Main Product</option>
                    {items.map((item, index) => (
                      <option key={index} value={item[0]}>
                        {item[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Addon Products
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => navigate("/add-product")}
                    className="bg-blue-500 text-white px-3 py-1 !rounded hover:bg-blue-600"
                  >
                    + Product
                  </button>
                </div>
                <div className="border !rounded-md p-3 max-h-40 overflow-y-auto space-y-1">
                  {items.map((item, index) => {
                    const isSelected = addonProduct.includes(item[0]);
                    return (
                      <div key={index}>
                        <input
                          type="checkbox"
                          id={`addon-${index}`}
                          value={item[0]}
                          checked={isSelected}
                          className="hidden"
                          onChange={() => {
                            if (isSelected) {
                              setAddonProduct((prev) =>
                                prev.filter((p) => p !== item[0])
                              );
                            } else {
                              setAddonProduct((prev) => [...prev, item[0]]);
                            }
                          }}
                        />
                        <label
                          htmlFor={`addon-${index}`}
                          className={`cursor-pointer block px-3 py-1 !rounded-md border ${
                            isSelected
                              ? "bg-blue-100 text-blue-800 border-blue-400"
                              : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                          }`}
                        >
                          {item[0]}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {addonProduct.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">
                      Selected Addon Products:
                    </p>
                    <ul className="list-disc pl-5">
                      {addonProduct.map((product, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {product}{" "}
                          <button
                            className="ml-2 mt-2 text-red-500 hover:text-red-700"
                            onClick={() => {
                              setAddonProduct(
                                addonProduct.filter((p) => p !== product)
                              );
                            }}
                          >
                            <XCircle size={15} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div
                    className={`w-12 h-6 flex items-center !rounded-full p-1 cursor-pointer ${
                      status ? "bg-blue-500" : "bg-gray-300"
                    }`}
                    onClick={() => setStatus(!status)}
                  >
                    <div
                      className={`w-5 h-5 bg-white !rounded-full shadow-md transform ${
                        status ? "translate-x-6" : "translate-x-0"
                      } transition`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setGroupName("");
                    setMainProduct("");
                    setAddonProduct([]);
                    setStatus(true);
                    setDialogOpen(false);
                  }}
                  className="border px-4 py-2 !rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditGroup}
                  className="bg-blue-600 text-white px-4 py-2 !rounded hover:bg-blue-700"
                >
                  Edit Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
