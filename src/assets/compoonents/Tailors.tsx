import { useState, useEffect } from "react";
import { Plus, Pencil, XCircle } from "lucide-react";
import TailorDialog from "../compoonents/TailorDialog";
import { RootState } from "../Redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setTailorData } from "../Redux/dataSlice";
import { useNavigate } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface Tailor {
  data: string[];
}

// Fetch Tailors
async function fetchTailors(): Promise<Tailor[]> {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/gettailors",
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
    console.error("Error fetching tailors:", error);
    return [];
  }
}

// Delete a Tailor
async function deleteTailor(
  tailorName: string,
  setRefresh: (state: boolean) => void,
  dispatch: any,
  setTailors: (tailors: Tailor[]) => void
) {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletetailor",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tailorName }),
      }
    );

    if (response.ok) {
      alert("Tailor deleted");
      const updatedTailors = await fetchTailors();
      dispatch(setTailorData(updatedTailors));
      setTailors(updatedTailors);
      localStorage.setItem(
        "tailorData",
        JSON.stringify({ data: updatedTailors, time: Date.now() })
      );
      setRefresh(true);
    } else {
      const errorText = await response.text();
      alert(`Error deleting tailor: ${errorText || response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting tailor:", error);
    alert("Network or server error while deleting tailor");
  }
}

export default function Tailors() {
  const navigate = useNavigate();
  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingTailor, setEditingTailor] = useState<Tailor | null>(null);
  const [refresh, setRefresh] = useState(false);

  const dispatch = useDispatch();
  const tailorsFromRedux = useSelector(
    (state: RootState) => state.data.tailors
  );

  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        const cached = localStorage.getItem("tailorData");
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes

        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.data?.length > 0 && now - parsed.time < cacheExpiry) {
            dispatch(setTailorData(parsed.data));
            setTailors(parsed.data);
            return;
          }
        }

        const data = await fetchTailors();
        if (Array.isArray(data)) {
          dispatch(setTailorData(data));
          setTailors(data);
          localStorage.setItem(
            "tailorData",
            JSON.stringify({ data, time: now })
          );
        } else {
          console.error("Fetched tailor data is invalid:", data);
        }
      } catch (error) {
        console.error("Error fetching tailors:", error);
      }
    };

    fetchAndSetData();
    setRefresh(false);
  }, [dispatch, refresh]); // Removed tailorsFromRedux from dependencies

  // Filter tailors based on search input
  const filteredTailors = tailors.filter((tailor) =>
    [tailor[0], tailor[1], tailor[2], tailor[3]]
      .map((field) => (field || "").toString().toLowerCase())
      .some((field) => field.includes(search.toLowerCase()))
  );

  return (
    <div className="md:p-6 pt-20 h-full bg-gray-50">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tailors</h1>
        <button
          className="flex !rounded-md items-center gap-2 bg-blue-600 text-white px-4 py-2"
          onClick={() => navigate("/tailor-dialog")}
        >
          <Plus size={18} /> Add Tailor
        </button>
      </div>
      <div className="bg-white shadow overflow-x-auto rounded-lg p-5">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search tailors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>
        <table className="w-full">
          <thead className="bg-sky-50">
            <tr>
              <th className="px-4 py-3">Tailor Name</th>
              <th className="px-4 py-3">Phone Number</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTailors.length > 0 ? (
              filteredTailors.map((tailor, index) => (
                <tr key={index} className="hover:bg-sky-50">
                  <td className="px-4 py-2">{tailor[0]}</td>
                  <td className="px-4 py-2">{tailor[1]}</td>
                  <td className="px-4 py-2">{tailor[2]}</td>
                  <td className="px-4 py-2">{tailor[3]}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="border px-2 py-1 rounded-md"
                      onClick={() => {
                        setEditingTailor(tailor);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="border px-2 py-1 rounded-md"
                      onClick={() =>
                        deleteTailor(
                          tailor[0],
                          setRefresh,
                          dispatch,
                          setTailors
                        )
                      }
                    >
                      <XCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No tailors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isDialogOpen && (
        <TailorDialog
          setDialogOpen={setDialogOpen}
          setRefresh={setRefresh}
          refresh={refresh}
          editingTailor={editingTailor}
          setEditingTailor={setEditingTailor}
        />
      )}
    </div>
  );
}
