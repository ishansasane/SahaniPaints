import { useState, useEffect } from "react";
import { Plus, Pencil, XCircle } from "lucide-react";
import InteriorDialog from "../compoonents/InteriorDialog";
import { RootState } from "../Redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { setInteriorData } from "../Redux/dataSlice";
import { useNavigate } from "react-router-dom";
import InteriorPage from "./InteriorPage";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface Interior {
  data: string[];
}

async function fetchInteriors(): Promise<string[][]> {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsinteriordata",
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data.body) ? data.body : [];
  } catch (error) {
    console.error("Error fetching interiors:", error);
    return [];
  }
}

export default function Interiors() {
  const navigate = useNavigate();
  const [interiors, setInteriors] = useState<string[][]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingInterior, setEditingInterior] = useState<string[] | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [interiorOpen, setInteriorOpen] = useState(false);
  const [interiorPageData, setInteriorPageData] = useState(null);

  const dispatch = useDispatch();
  const interiorsFromRedux = useSelector(
    (state: RootState) => state.data.interiors
  );

  async function deleteInterior(name: string) {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/deletepaintsinteriordata",
        {
          method: "POST",
          headers: { "content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name }),
        }
      );

      if (response.ok) {
        alert("Interior deleted");
        const updatedInteriors = await fetchInteriors();
        dispatch(setInteriorData(updatedInteriors));
        setInteriors(updatedInteriors);
        localStorage.setItem(
          "interiorData",
          JSON.stringify({ data: updatedInteriors, time: Date.now() })
        );
        setRefresh(true);
      } else {
        const errorText = await response.text();
        alert(`Error deleting interior: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting interior:", error);
      alert("Network or server error while deleting interior");
    }
  }

  useEffect(() => {
    const fetchInteriorsData = async () => {
      try {
        const cached = localStorage.getItem("interiorData");
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000;

        let finalData: string[][] = [];

        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.data?.length > 0 && now - parsed.time < cacheExpiry) {
            finalData = parsed.data;
            dispatch(setInteriorData(finalData));
            setInteriors(finalData);
            return;
          }
        }

        const freshData = await fetchInteriors();
        if (Array.isArray(freshData)) {
          finalData = freshData;
          dispatch(setInteriorData(finalData));
          setInteriors(finalData);
          localStorage.setItem(
            "interiorData",
            JSON.stringify({ data: finalData, time: now })
          );
        }
      } catch (error) {
        console.error("Error fetching interiors:", error);
      }
    };

    fetchInteriorsData();
    setRefresh(false);
  }, [dispatch, refresh]);

  const filteredInteriors = interiors.filter((interior) =>
    [interior[0], interior[1], interior[2], interior[3]]
      .map((field) => (field || "").toLowerCase())
      .some((field) => field.includes(search.toLowerCase()))
  );

  return (
    <div className="md:p-6 pt-20 h-full bg-gray-50">
      <div
        className={`flex flex-wrap justify-between items-center mb-4 ${
          interiorOpen ? "hidden" : ""
        }`}
      >
        <h1 className="text-2xl font-bold">Interiors</h1>
        <button
          className="flex !rounded-md items-center gap-2 bg-blue-600 text-white px-4 py-2"
          onClick={() => {
            setEditingInterior(null);
            setDialogOpen(true);
          }}
        >
          <Plus size={18} /> Add Interior
        </button>
      </div>

      <div
        className={`bg-white shadow rounded-lg overflow-x-auto p-5 ${
          interiorOpen ? "hidden" : ""
        }`}
      >
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search interiors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        <table className="w-full">
          <thead className="bg-sky-50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone Number</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInteriors.length > 0 ? (
              filteredInteriors.map((interior, index) => (
                <tr
                  key={index}
                  className="hover:bg-sky-50"
                  onClick={() => {
                    setInteriorPageData(interior);
                    setInteriorOpen(true);
                  }}
                >
                  <td className="px-4 py-2">{interior[0]}</td>
                  <td className="px-4 py-2">{interior[1]}</td>
                  <td className="px-4 py-2">{interior[2]}</td>
                  <td className="px-4 py-2">{interior[3]}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="border px-2 py-1 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingInterior(interior);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="border px-2 py-1 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteInterior(interior[0]);
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No interiors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {interiorOpen && (
        <InteriorPage
          interiorData={interiorPageData}
          setInteriorOpen={setInteriorOpen}
        />
      )}

      {isDialogOpen && (
        <InteriorDialog
          setDialogOpen={setDialogOpen}
          setRefresh={setRefresh}
          refresh={refresh}
          editingInterior={editingInterior}
          setEditingInterior={setEditingInterior}
        />
      )}
    </div>
  );
}
