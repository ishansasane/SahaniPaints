import { useState, useEffect } from "react";
import { Plus, Pencil, XCircle } from "lucide-react";
import CatalogueDialog from "../compoonents/CatalogueDialog";
import { useDispatch, useSelector } from "react-redux";
import { setCatalogs } from "../Redux/dataSlice";
import { RootState } from "../Redux/Store";
import { useNavigate } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface Catalogue {
  data: string[];
}

// Fetch catalogues from the server
async function fetchCatalogues(): Promise<Catalogue[]> {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getcatalogues",
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
    console.error("Error fetching catalogues:", error);
    return [];
  }
}

// Delete a catalogue
async function deleteCatalogue(
  catalogueName: string,
  setRefresh: (state: boolean) => void
) {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletecatalogue",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ catalogueName }),
      }
    );

    if (response.ok) {
      alert("Catalogue deleted");
      setRefresh(true);
    } else {
      const errorText = await response.text();
      alert(`Error deleting catalogue: ${errorText || response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting catalogue:", error);
    alert("Network or server error while deleting catalogue");
  }
}

export default function Catalogues() {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingCatalogue, setEditingCatalogue] = useState<Catalogue | null>(
    null
  );
  const [refresh, setRefresh] = useState(false);

  const dispatch = useDispatch();
  const catalogueData = useSelector(
    (state: RootState) => state.data.catalogues
  );

  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        const cached = localStorage.getItem("catalogueData");
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes

        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.data?.length > 0 && now - parsed.time < cacheExpiry) {
            dispatch(setCatalogs(parsed.data));
            setCatalogues(parsed.data);
            return;
          }
        }

        const data = await fetchCatalogues();
        if (Array.isArray(data)) {
          dispatch(setCatalogs(data));
          setCatalogues(data);
          localStorage.setItem(
            "catalogueData",
            JSON.stringify({ data, time: now })
          );
        } else {
          console.error("Fetched catalogue data is invalid:", data);
        }
      } catch (error) {
        console.error("Error fetching catalogues:", error);
      }
    };

    fetchAndSetData();
    setRefresh(false);
  }, [dispatch, refresh]);

  const filteredCatalogues = catalogues.filter((catalogue) =>
    [catalogue[0], catalogue[1]]
      .map((field) => (field || "").toString().toLowerCase())
      .some((field) => field.includes(search.toLowerCase()))
  );

  return (
    <div className="md:p-6 pt-20 h-full bg-gray-50">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Catalogues</h1>
        <button
          className="flex !rounded-md items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md"
          onClick={() => {
            setEditingCatalogue(null);
            setDialogOpen(true);
          }}
        >
          <Plus size={18} /> Add Catalogue
        </button>
      </div>

      <div className="bg-white overflow-x-auto shadow rounded-lg p-5">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search catalogues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        <table className="w-full">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCatalogues.length > 0 ? (
              filteredCatalogues.map((catalogue, index) => (
                <tr key={index} className="hover:bg-blue-50">
                  <td className="px-4 py-2">{catalogue[0]}</td>
                  <td className="px-4 py-2">{catalogue[1]}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="border px-2 py-1 rounded-md"
                      onClick={() => {
                        setEditingCatalogue(catalogue);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="border px-2 py-1 rounded-md"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Are you sure you want to delete the catalogue "${catalogue[0]}"?`
                        );
                        if (confirmed) {
                          deleteCatalogue(catalogue[0], setRefresh);
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
                  No catalogues found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDialogOpen && (
        <CatalogueDialog
          setDialogOpen={setDialogOpen}
          setRefresh={setRefresh}
          refresh={refresh}
          editingCatalogue={editingCatalogue}
          setEditingCatalogue={setEditingCatalogue}
          catalogueData={catalogues} // ✅ Pass catalogue list
        />
      )}
    </div>
  );
}
