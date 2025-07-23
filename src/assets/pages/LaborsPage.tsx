import React, { useEffect, useState } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";
import dayjs from "dayjs";

interface AttendanceEntry {
  date: string;
  site: string;
  records: {
    name: string;
    day: boolean;
    night: boolean;
  }[];
}

const hasPermission = (requiredRoute: string): boolean => {
  try {
    const allowedRoutes = JSON.parse(
      localStorage.getItem("allowed_routes") || "[]"
    );
    if (!Array.isArray(allowedRoutes)) return false;

    return allowedRoutes.includes(
      requiredRoute.replace(/\\/g, "").replace(/\/+$/, "")
    );
  } catch {
    return false;
  }
};

const canEditAttendance = hasPermission("/edit-attendence");

function LaborsPage() {
  const [labors, setLabors] = useState<string[][]>([]);
  const [name, setName] = useState("");
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLabor, setSelectedLabor] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    dayjs().format("MM")
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    dayjs().format("YYYY")
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditLabor, setCurrentEditLabor] = useState<{
    name: string;
    payment: string;
  }>({ name: "", payment: "" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [laborToDelete, setLaborToDelete] = useState<string | null>(null);

  const fetchLabors = () => {
    setLoading(true);
    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsLabourData"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLabors(data.body);
        }
      })
      .catch((err) => console.error("Failed to fetch labors:", err))
      .finally(() => setLoading(false));
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getLabourData"
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.body)) {
        const parsed: AttendanceEntry[] = data.body.map(
          ([date, site, rawEntries]: any) => {
            const records: AttendanceEntry["records"] = rawEntries
              .split("],[")
              .map((s: string) => s.replace(/[\[\]"]/g, ""))
              .map((entry: string) => {
                const [name, day, night] = entry.split(",");
                return {
                  name: name.trim(),
                  day: day === "P",
                  night: night === "P",
                };
              });

            return { date, site, records };
          }
        );

        setAttendanceData(parsed);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };

  useEffect(() => {
    fetchLabors();
    fetchAttendance();
  }, []);

  const handleAdd = () => {
    if (!name.trim()) return alert("Name is required");

    const today = new Date().toISOString().split("T")[0];
    const payload: any = { name: name.trim(), date: today };
    if (payment.trim()) payload.payment = payment.trim();

    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendPaintsLabourData",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert("Labor added successfully!");
          setName("");
          setPayment("");
          fetchLabors();
          setAddDialogOpen(false);
        } else {
          alert("Failed to add labor.");
        }
      })
      .catch((err) => {
        console.error("POST error:", err);
        alert("Something went wrong");
      });
  };

  const handleUpdate = () => {
    if (!currentEditLabor.payment.trim()) return alert("Payment is required");

    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintsLabourData",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentEditLabor.name,
          payment: currentEditLabor.payment.trim(),
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert("Labor payment updated successfully!");
          fetchLabors();
          setEditDialogOpen(false);
        } else {
          alert("Failed to update labor payment.");
        }
      })
      .catch((err) => {
        console.error("UPDATE error:", err);
        alert("Something went wrong");
      });
  };

  const handleDelete = () => {
    if (!laborToDelete) return;

    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintsLabourData",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: laborToDelete }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert("Labor deleted successfully!");
          fetchLabors();
          setDeleteConfirmOpen(false);
          setLaborToDelete(null);
        } else {
          alert("Failed to delete labor.");
        }
      })
      .catch((err) => {
        console.error("DELETE error:", err);
        alert("Something went wrong");
      });
  };

  const openEditDialog = (labor: string[]) => {
    setCurrentEditLabor({
      name: labor[0],
      payment: labor[2] || "",
    });
    setEditDialogOpen(true);
  };

  const openDeleteConfirm = (laborName: string) => {
    setLaborToDelete(laborName);
    setDeleteConfirmOpen(true);
  };

  const openAttendanceDialog = (laborName: string) => {
    setSelectedLabor(laborName);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedLabor(null);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentEditLabor({ name: "", payment: "" });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setLaborToDelete(null);
  };

  const filteredAttendance = attendanceData.filter(
    (entry) =>
      dayjs(entry.date).format("YYYY") === selectedYear &&
      dayjs(entry.date).format("MM") === selectedMonth &&
      entry.records.some((r) => r.name === selectedLabor)
  );

  const getLaborPayment = (laborName: string): number => {
    const entry = labors.find(([name]) => name === laborName);
    const payStr = entry?.[2];
    return payStr ? parseFloat(payStr) : 0;
  };

  const calculateWage = (): number => {
    if (!selectedLabor) return 0;
    const pay = getLaborPayment(selectedLabor);
    let total = 0;

    filteredAttendance.forEach((entry) => {
      const record = entry.records.find((r) => r.name === selectedLabor);
      if (record) {
        if (record.day) total += pay;
        if (record.night) total += pay * 0.5;
      }
    });

    return total;
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between mb-6 items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Labors</h1>
        <button
          onClick={() => setAddDialogOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
        >
          + Add Labor
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 md:px-4 md:py-2 text-left">#</th>
              <th className="border px-2 py-1 md:px-4 md:py-2 text-left">
                Name
              </th>
              <th className="border px-2 py-1 md:px-4 md:py-2 text-left">
                Payment
              </th>
              <th className="border px-2 py-1 md:px-4 md:py-2 text-left">
                Date
              </th>
              <th className="border px-2 py-1 md:px-4 md:py-2 text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : labors.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No labors added yet.
                </td>
              </tr>
            ) : (
              labors.map(([name, date, pay], idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 md:px-4 md:py-2">
                    {idx + 1}
                  </td>
                  <td
                    className="border px-2 py-1 md:px-4 md:py-2 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => openAttendanceDialog(name)}
                  >
                    {name}
                  </td>
                  <td className="border px-2 py-1 md:px-4 md:py-2">
                    {pay ? `₹${pay}` : "--"}
                  </td>
                  <td className="border px-2 py-1 md:px-4 md:py-2">{date}</td>
                  <td className="border px-2 py-1 md:px-4 md:py-2">
                    {canEditAttendance && (
                      <div className="flex gap-1 md:gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog([name, date, pay]);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 md:h-5 md:w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(name);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 md:h-5 md:w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Labor Dialog */}
      {addDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Add New Labor</h2>
            <div className="mb-4">
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Payment (optional)
              </label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                placeholder="e.g. 1000"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setAddDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleAdd}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Dialog */}
      {editDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Update Payment</h2>
            <div className="mb-4">
              <label className="block font-medium mb-1">Labor Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 bg-gray-100"
                value={currentEditLabor.name}
                readOnly
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Payment</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={currentEditLabor.payment}
                onChange={(e) =>
                  setCurrentEditLabor({
                    ...currentEditLabor,
                    payment: e.target.value,
                  })
                }
                placeholder="Enter payment amount"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={closeEditDialog}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleUpdate}
              >
                Update Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete labor:{" "}
              <span className="font-bold">{laborToDelete}</span>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={closeDeleteConfirm}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Dialog */}
      {dialogOpen && selectedLabor && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-3xl shadow-xl max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-semibold mb-4">
              Attendance for {selectedLabor}
            </h2>

            <div className="flex gap-2 mb-4 flex-wrap">
              <select
                className="border px-3 py-2 rounded flex-1 min-w-[120px]"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {["2024", "2025", "2026"].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                className="border px-3 py-2 rounded flex-1 min-w-[120px]"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, "0");
                  return (
                    <option key={month} value={month}>
                      {dayjs().month(i).format("MMMM")}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="overflow-y-auto flex-1 text-sm">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="border px-2 py-1 md:px-3 md:py-2 text-left">
                      Date
                    </th>
                    <th className="border px-2 py-1 md:px-3 md:py-2 text-left">
                      Site
                    </th>
                    <th className="border px-2 py-1 md:px-3 md:py-2 text-left">
                      Day
                    </th>
                    <th className="border px-2 py-1 md:px-3 md:py-2 text-left">
                      Night
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((entry, idx) => {
                    const record = entry.records.find(
                      (r) => r.name === selectedLabor
                    );
                    if (!record) return null;
                    return (
                      <tr key={idx}>
                        <td className="border px-2 py-1 md:px-3 md:py-2">
                          {entry.date}
                        </td>
                        <td className="border px-2 py-1 md:px-3 md:py-2">
                          {entry.site}
                        </td>
                        <td className="border px-2 py-1 md:px-3 md:py-2">
                          {record.day ? "✅" : "❌"}
                        </td>
                        <td className="border px-2 py-1 md:px-3 md:py-2">
                          {record.night ? "✅" : "❌"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 font-semibold">
              Total Wage: ₹{Math.round(calculateWage())}
            </div>

            <div className="mt-4 text-right">
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={closeDialog}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LaborsPage;
