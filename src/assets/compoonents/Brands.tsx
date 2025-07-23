import { useState, useEffect } from "react";
import { Plus, Pencil, XCircle } from "lucide-react";
import BrandDialog from "../compoonents/BrandDialog";
import { useDispatch, useSelector } from "react-redux";
import { setBrandData } from "../Redux/dataSlice";
import { RootState } from "../Redux/Store";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

// Fetch brands
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

async function refreshBrands(
  dispatch: any,
  setBrands: (data: string[][]) => void
) {
  try {
    const data = await fetchBrands();
    const now = Date.now();
    if (Array.isArray(data)) {
      dispatch(setBrandData(data));
      setBrands(data);
      localStorage.setItem("brandData", JSON.stringify({ data, time: now }));
    }
  } catch (error) {
    console.error("Error refreshing brand data:", error);
  }
}

async function deleteBrand(
  brandName: string,
  dispatch: any,
  setBrands: (data: string[][]) => void
) {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletepaintsbrand",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ brandName }),
      }
    );

    if (response.ok) {
      alert("Brand deleted");
      await refreshBrands(dispatch, setBrands);
    } else {
      const errorText = await response.text();
      alert(`Error deleting brand: ${errorText || response.statusText}`);
    }
  } catch (error) {
    console.error("Delete brand error:", error);
    alert("Network or server error while deleting brand");
  }
}

export default function Brands() {
  const [brands, setBrands] = useState<string[][]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<string[] | null>(null);
  const [refresh, setRefresh] = useState(false);

  const dispatch = useDispatch();
  const brandData = useSelector((state: RootState) => state.data.brands);

  useEffect(() => {
    const fetchAndSetBrands = async () => {
      try {
        const cached = localStorage.getItem("brandData");
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000;

        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.data?.length > 0 && now - parsed.time < cacheExpiry) {
            dispatch(setBrandData(parsed.data));
            setBrands(parsed.data);
            return;
          }
        }

        const data = await fetchBrands();
        if (Array.isArray(data)) {
          dispatch(setBrandData(data));
          setBrands(data);
          localStorage.setItem(
            "brandData",
            JSON.stringify({ data, time: now })
          );
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchAndSetBrands();
    setRefresh(false);
  }, [dispatch, refresh]);

  const filteredBrands = brands.filter((brand) =>
    [brand[0], brand[1]]
      .map((field) => (field || "").toLowerCase())
      .some((field) => field.includes(search.toLowerCase()))
  );

  return (
    <div className="md:p-6 pt-20 h-full bg-gray-50">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Brands</h1>
        <button
          className="flex !rounded-lg items-center gap-2 bg-blue-600 text-white px-4 py-2"
          onClick={() => {
            setEditingBrand(null);
            setDialogOpen(true);
          }}
        >
          <Plus size={18} /> Add Brand
        </button>
      </div>

      <div className="bg-white overflow-x-auto shadow rounded-lg p-5">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        <table className="w-full">
          <thead className="bg-sky-50">
            <tr>
              <th className="px-4 py-3">Brand Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand, index) => (
                <tr key={index} className="hover:bg-sky-50">
                  <td className="px-4 py-2">{brand[0]}</td>
                  <td className="px-4 py-2">{brand[1]}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="border px-2 py-1 rounded-md"
                      onClick={() => {
                        setEditingBrand(brand);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="border px-2 py-1 rounded-md"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Are you sure you want to delete the brand "${brand[0]}"?`
                        );
                        if (confirmed) {
                          deleteBrand(brand[0], dispatch, setBrands);
                        }
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  No brands found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDialogOpen && (
        <BrandDialog
          setDialogOpen={setDialogOpen}
          setRefresh={setRefresh}
          refresh={refresh}
          editingBrand={editingBrand}
          setEditingBrand={setEditingBrand}
          brandData={brands} // ✅ Pass brand list for duplicate checking
        />
      )}
    </div>
  );
}
