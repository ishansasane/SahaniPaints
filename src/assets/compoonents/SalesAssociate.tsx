import { useState, useEffect } from "react";
import { Plus, Pencil, XCircle } from "lucide-react";
import SalesAssociateDialog from "../compoonents/SalesAssociateDialog";
import { RootState } from "../Redux/Store";
import { useSelector, useDispatch } from "react-redux";
import { setSalesAssociateData } from "../Redux/dataSlice";
import { useNavigate } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

async function fetchSalesAssociates(): Promise<string[][]> {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintssalesassociatedata",
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
    console.error("Error fetching sales associates:", error);
    return [];
  }
}

async function deleteSalesAssociate(
  name: string,
  setRefresh: (state: boolean) => void,
  dispatch: any,
  setSalesAssociates: (salesAssociates: SalesAssociate[]) => void
) {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletepaintssalesassociatedata",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      }
    );

    if (response.ok) {
      alert("Sales Associate deleted");

      const updatedData = await fetchSalesAssociates();
      dispatch(setSalesAssociateData(updatedData));
      setSalesAssociates(updatedData);
      localStorage.setItem(
        "salesAssociateData",
        JSON.stringify({ data: updatedData, time: Date.now() })
      );

      setRefresh(true);
    } else {
      const errorText = await response.text();
      alert(
        `Error deleting sales associate: ${errorText || response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error deleting sales associate:", error);
    alert("Network or server error while deleting sales associate");
  }
}

export default function SalesAssociates() {
  const navigate = useNavigate();
  const [salesAssociates, setSalesAssociates] = useState<string[][]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingSalesAssociate, setEditingSalesAssociate] = useState<
    string[] | null
  >(null);
  const [refresh, setRefresh] = useState(false);

  const dispatch = useDispatch();
  const salesAssociatesFromRedux = useSelector(
    (state: RootState) => state.data.salesAssociates
  );

  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        const cached = localStorage.getItem("salesAssociateData");
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000;

        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.data?.length > 0 && now - parsed.time < cacheExpiry) {
            dispatch(setSalesAssociateData(parsed.data));
            setSalesAssociates(parsed.data);
            return;
          }
        }

        const data = await fetchSalesAssociates();
        if (Array.isArray(data)) {
          dispatch(setSalesAssociateData(data));
          setSalesAssociates(data);
          localStorage.setItem(
            "salesAssociateData",
            JSON.stringify({ data, time: now })
          );
        }
      } catch (error) {
        console.error("Error fetching sales associates:", error);
      }
    };

    fetchAndSetData();
    setRefresh(false);
  }, [dispatch, refresh]);

  const filteredSalesAssociates = salesAssociates.filter((sa) =>
    [sa[0], sa[1], sa[2], sa[3]]
      .map((field) => (field || "").toLowerCase())
      .some((field) => field.includes(search.toLowerCase()))
  );

  return (
    <div className="md:p-6 pt-20 h-full bg-gray-50">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sales Associates</h1>
        <button
          className="flex !rounded-md items-center gap-2 bg-blue-600 text-white px-4 py-2"
          onClick={() => {
            setEditingSalesAssociate(null);
            setDialogOpen(true);
          }}
        >
          <Plus size={18} /> Add Sales Associate
        </button>
      </div>

      <div className="bg-white overflow-x-auto shadow rounded-lg p-5">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search sales associates..."
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
            {filteredSalesAssociates.length > 0 ? (
              filteredSalesAssociates.map((sa, index) => (
                <tr key={index} className="hover:bg-sky-50">
                  <td className="px-4 py-2">{sa[0]}</td>
                  <td className="px-4 py-2">{sa[1]}</td>
                  <td className="px-4 py-2">{sa[2]}</td>
                  <td className="px-4 py-2">{sa[3]}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="border px-2 py-1 rounded-md"
                      onClick={() => {
                        setEditingSalesAssociate(sa);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="border px-2 py-1 rounded-md"
                      onClick={() =>
                        deleteSalesAssociate(
                          sa[0],
                          setRefresh,
                          dispatch,
                          setSalesAssociates
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
                  No sales associates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isDialogOpen && (
        <SalesAssociateDialog
          setDialogOpen={setDialogOpen}
          setRefresh={setRefresh}
          refresh={refresh}
          editingSalesAssociate={editingSalesAssociate}
          setEditingSalesAssociate={setEditingSalesAssociate}
        />
      )}
    </div>
  );
}
