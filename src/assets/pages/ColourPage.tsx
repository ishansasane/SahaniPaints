import React, { useEffect, useState } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";
import { Pencil, Trash } from "lucide-react";

// ✅ Helper to check permission
const hasPermission = (route: string): boolean => {
  try {
    const raw = localStorage.getItem("allowed_routes");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return false;

    const normalized = route.replace(/\\/g, "").replace(/\/+$/, "");
    return parsed.includes(normalized);
  } catch {
    return false;
  }
};

function ColourPage() {
  const [open, setOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [form, setForm] = useState({
    site: "",
    areas: [{ area: "", shadeName: "", shadeCode: "" }],
  });
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState({ site: "", date: "" });

  const canEdit = hasPermission("/edit-colour"); // ✅ Check once

  useEffect(() => {
    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsprojectdata"
    )
      .then((res) => res.json())
      .then((data) => {
        const siteNames = data.body.map((item) => item[0]);
        setSites(siteNames);
      });

    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsColorData"
    )
      .then((res) => res.json())
      .then((data) => {
        const parsed = [];
        data.body.forEach(([siteName, areaCollection, date]) => {
          const matches = areaCollection.match(/\[([^\]]+)\]/g);
          if (matches) {
            matches.forEach((block) => {
              const parts = block
                .replace(/[\[\]]/g, "")
                .split(",")
                .map((p) => p.trim());
              parsed.push({
                site: siteName,
                area: parts[0] || "",
                shadeName: parts[1] || "NA",
                shadeCode: parts[2] || "",
                date,
              });
            });
          }
        });
        setTableData(parsed);
      });
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAreaChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAreas = [...form.areas];
    updatedAreas[index][name] = value;
    setForm((prev) => ({ ...prev, areas: updatedAreas }));
  };

  const addNewArea = () => {
    setForm((prev) => ({
      ...prev,
      areas: [...prev.areas, { area: "", shadeName: "", shadeCode: "" }],
    }));
  };

  const removeArea = (index) => {
    const updatedAreas = [...form.areas];
    updatedAreas.splice(index, 1);
    setForm((prev) => ({ ...prev, areas: updatedAreas }));
  };

  const handleAdd = () => {
    if (form.site && form.areas.every((a) => a.area && a.shadeCode)) {
      const areaString = form.areas
        .map((a) => {
          const shadeName = a.shadeName.trim() || "NA";
          return `[${a.area} , ${shadeName} , ${a.shadeCode}]`;
        })
        .join("");

      const payload = {
        siteName: form.site,
        areaCollection: areaString,
        date: editMode
          ? editTarget.date
          : new Date().toISOString().split("T")[0],
      };

      const url = editMode
        ? "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintsColorData"
        : "https://sheeladecor.netlify.app/.netlify/functions/server/sendPaintsColorData";

      fetchWithLoading(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((res) => {
          alert(res.success ? (editMode ? "Updated!" : "Added!") : res.message);
          window.location.reload();
        });

      setForm({
        site: "",
        areas: [{ area: "", shadeName: "", shadeCode: "" }],
      });
      setEditMode(false);
      setOpen(false);
    }
  };

  const handleEdit = (site, date) => {
    const matched = tableData.filter(
      (item) => item.site === site && item.date === date
    );
    const areas = matched.map((i) => ({
      area: i.area,
      shadeName: i.shadeName === "NA" ? "" : i.shadeName,
      shadeCode: i.shadeCode,
    }));
    setForm({ site, areas });
    setEditTarget({ site, date });
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = (site, date) => {
    if (window.confirm(`Delete entry for ${site} on ${date}?`)) {
      fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintsColorData",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteName: site, date }),
        }
      )
        .then((res) => res.json())
        .then((res) => {
          alert(res.success ? "Deleted!" : res.message);
          window.location.reload();
        });
    }
  };

  const groupedData = tableData.reduce((acc, curr) => {
    const key = `${curr.site}__${curr.date}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">Colour Table</h1>
        <button
          onClick={() => {
            setForm({
              site: "",
              areas: [{ area: "", shadeName: "", shadeCode: "" }],
            });
            setEditMode(false);
            setOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          Add Colour
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 md:px-4 md:py-2">Site Name</th>
              <th className="border px-2 py-1 md:px-4 md:py-2">Area</th>
              <th className="border px-2 py-1 md:px-4 md:py-2">Shade Name</th>
              <th className="border px-2 py-1 md:px-4 md:py-2">Shade Code</th>
              <th className="border px-2 py-1 md:px-4 md:py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedData).map(([key, entries], idx) => {
              const [site, date] = key.split("__");
              return entries.map((entry, index) => (
                <tr key={`${key}-${index}`}>
                  {index === 0 && (
                    <td
                      className="border px-2 py-1 md:px-4 md:py-2"
                      rowSpan={entries.length}
                    >
                      {site}
                    </td>
                  )}
                  <td className="border px-2 py-1 md:px-4 md:py-2">
                    {entry.area}
                  </td>
                  <td className="border px-2 py-1 md:px-4 md:py-2">
                    {entry.shadeName}
                  </td>
                  <td className="border px-2 py-1 md:px-4 md:py-2">
                    {entry.shadeCode}
                  </td>
                  {index === 0 && (
                    <td
                      className="border px-2 py-1 md:px-4 md:py-2"
                      rowSpan={entries.length}
                    >
                      {canEdit && (
                        <div className="flex gap-1 md:gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(site, date)}
                            className="p-1 rounded hover:bg-gray-200"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => handleDelete(site, date)}
                            className="p-1 rounded hover:bg-gray-200"
                            title="Delete"
                          >
                            <Trash className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-semibold mb-4">
              {editMode ? "Edit Colour Data" : "Add New Colour"}
            </h2>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Site Name</label>
              <select
                name="site"
                value={form.site}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select site</option>
                {sites.map((site, idx) => (
                  <option key={idx} value={site}>
                    {site}
                  </option>
                ))}
              </select>
            </div>

            {form.areas.map((area, index) => (
              <div
                key={index}
                className="mb-4 border p-3 rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Area {index + 1}</h3>
                  {index > 0 && (
                    <button
                      onClick={() => removeArea(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  name="area"
                  value={area.area}
                  onChange={(e) => handleAreaChange(index, e)}
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2 text-sm md:text-base"
                  placeholder="Area"
                  required
                />
                <input
                  name="shadeName"
                  value={area.shadeName}
                  onChange={(e) => handleAreaChange(index, e)}
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2 text-sm md:text-base"
                  placeholder="Shade Name (optional)"
                />
                <input
                  name="shadeCode"
                  value={area.shadeCode}
                  onChange={(e) => handleAreaChange(index, e)}
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm md:text-base"
                  placeholder="Shade Code"
                  required
                />
              </div>
            ))}

            <div className="flex justify-between mb-4">
              <button
                onClick={addNewArea}
                className="px-3 py-1 md:px-4 md:py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm md:text-base"
              >
                + Add Another Area
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setOpen(false);
                  setEditMode(false);
                }}
                className="px-3 py-1 md:px-4 md:py-2 border rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-3 py-1 md:px-4 md:py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm md:text-base"
              >
                {editMode ? "Update" : "Add All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColourPage;
