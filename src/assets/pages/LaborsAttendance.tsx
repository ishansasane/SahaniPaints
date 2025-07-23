import React, { useState, useEffect } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";
import Select from "react-select";

function LaborsAttendance() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState([]);
  const [laborNames, setLaborNames] = useState([]);
  const [newLaborName, setNewLaborName] = useState("");
  const [copyFromDate, setCopyFromDate] = useState("");
  const [availableLabors, setAvailableLabors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // New state for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSite, setFilterSite] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

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

  // Function to parse labor data from API
  const parseLaborData = (laborString) => {
    try {
      // Clean the string first
      let cleanedString = laborString
        .replace(/'/g, '"') // Replace single quotes with double quotes
        .replace(/\./g, "") // Remove dots that might be in names
        .replace(/\]\[/g, "],[") // Fix missing commas between arrays
        .trim();

      // Parse the JSON
      const parsedData = JSON.parse(`[${cleanedString}]`);

      // Handle the format: [["name", "dayStatus", "nightStatus"]]
      return parsedData.map((item) => {
        const name = item[0]?.trim() || "";
        const dayStatus = item[1]?.trim().toUpperCase() || "";
        const nightStatus = item[2]?.trim().toUpperCase() || "";
        return { name, dayStatus, nightStatus };
      });
    } catch (error) {
      console.error("Error parsing labor data:", error, "String:", laborString);
      return [];
    }
  };

  // Format labor data for API
  const formatLaborData = (labors) => {
    return labors.map((labor) => [
      labor.name,
      labor.dayStatus.toUpperCase(),
      labor.nightStatus.toUpperCase(),
    ]);
  };

  // Fetch sites data
  useEffect(() => {
    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsprojectdata"
    )
      .then((res) => res.json())
      .then((data) => {
        const siteNames = data.body.map((item) => item[0]);
        setSites(siteNames);
      })
      .catch((error) => console.error("Error fetching site data:", error));
  }, []);

  // Fetch available labors
  useEffect(() => {
    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsLabourData"
    )
      .then((res) => res.json())
      .then((data) => {
        const uniqueLabors = Array.from(
          new Set(data.body.map((item) => item[0]))
        );
        setAvailableLabors(uniqueLabors);
      })
      .catch((error) => console.error("Error fetching labor data:", error));
  }, []);

  // Fetch all attendance data
  const fetchAttendanceData = () => {
    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getLabourData"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const formattedData = data.body.map((item) => ({
            date: item[0],
            site: item[1],
            labors: parseLaborData(item[2]),
          }));
          setAttendanceData(formattedData);
        }
      })
      .catch((error) =>
        console.error("Error fetching attendance data:", error)
      );
  };

  // Load attendance data on component mount
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Load attendance for selected date and site
  useEffect(() => {
    if (selectedSite && selectedDate) {
      const entry = attendanceData.find(
        (item) => item.date === selectedDate && item.site === selectedSite
      );

      if (entry) {
        setLaborNames(
          entry.labors.map((labor) => ({
            name: labor.name,
            dayStatus: labor.dayStatus,
            nightStatus: labor.nightStatus,
          }))
        );
        setIsEditing(true);
      } else {
        setLaborNames([]);
        setIsEditing(false);
      }
    }
  }, [selectedSite, selectedDate, attendanceData]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
  };

  // Add new labor
  const addLabor = () => {
    if (newLaborName.trim() && selectedSite) {
      const newLabor = {
        name: newLaborName.trim(),
        dayStatus: "",
        nightStatus: "",
      };
      setLaborNames([...laborNames, newLabor]);
      setNewLaborName("");
    }
  };

  // Update attendance
  const updateAttendance = (index, shift, value) => {
    const updatedLabors = [...laborNames];
    updatedLabors[index][shift] = value;
    setLaborNames(updatedLabors);
  };

  // Save or update attendance
  const saveAttendance = () => {
    if (selectedSite && selectedDate && laborNames.length > 0) {
      const formattedLabors = formatLaborData(laborNames);

      const payload = {
        date: selectedDate,
        siteName: selectedSite,
        labours: JSON.stringify(formattedLabors).replace(/^\[|\]$/g, ""),
      };

      const url = isEditing
        ? "https://sheeladecor.netlify.app/.netlify/functions/server/updateLabourData"
        : "https://sheeladecor.netlify.app/.netlify/functions/server/sendLabourData";

      fetchWithLoading(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert(
              `Attendance ${isEditing ? "updated" : "saved"} successfully!`
            );
            fetchAttendanceData(); // Refresh attendance data
          } else {
            throw new Error(
              data.message ||
                `Failed to ${isEditing ? "update" : "save"} attendance`
            );
          }
        })
        .catch((error) => {
          console.error("Error saving attendance:", error);
          alert(
            `Failed to ${isEditing ? "update" : "save"} attendance: ${
              error.message
            }`
          );
        });
    }
  };

  // Delete attendance
  const deleteAttendance = () => {
    if (selectedSite && selectedDate) {
      if (
        window.confirm(
          "Are you sure you want to delete this attendance record?"
        )
      ) {
        const payload = {
          date: selectedDate,
          siteName: selectedSite,
        };

        fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/deleteLabourData",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              alert("Attendance deleted successfully!");
              setLaborNames([]);
              setIsEditing(false);
              fetchAttendanceData(); // Refresh attendance data
            } else {
              throw new Error(data.message || "Failed to delete attendance");
            }
          })
          .catch((error) => {
            console.error("Error deleting attendance:", error);
            alert("Failed to delete attendance: " + error.message);
          });
      }
    }
  };

  // Copy names from previous date
  const copyNamesFromPrevious = () => {
    if (copyFromDate && selectedSite) {
      const previousEntry = attendanceData.find(
        (item) => item.date === copyFromDate && item.site === selectedSite
      );

      if (previousEntry) {
        setLaborNames(
          previousEntry.labors.map((labor) => ({
            name: labor.name,
            dayStatus: "",
            nightStatus: "",
          }))
        );
      } else {
        alert("No attendance data found for the selected date and site");
      }
    }
  };

  // Filter attendance records based on search and filter criteria
  const filteredAttendanceData = attendanceData
    .filter((entry) => {
      // Filter by site
      if (filterSite && entry.site !== filterSite) return false;

      // Filter by exact date
      if (filterDate && entry.date !== filterDate) return false;

      // Filter by month (format: "YYYY-MM")
      if (filterMonth && !entry.date.startsWith(filterMonth)) return false;

      return true;
    })
    .map((entry) => {
      // If searching by labor name, filter the labors array to only include matching names
      if (searchTerm) {
        const filteredLabors = entry.labors.filter((labor) =>
          labor.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Return a modified entry with only matching labors, or null if no matches
        return filteredLabors.length > 0
          ? { ...entry, labors: filteredLabors }
          : null;
      }
      return entry;
    })
    .filter((entry) => entry !== null) // Remove entries with no matching labors
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="font-bold text-lg md:text-xl mb-4 md:mb-6">
        Labour Attendance
      </h1>

      {/* Attendance Input Section */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 md:mb-8">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name
            </label>
            <Select
              options={sites.map((site) => ({
                label: site,
                value: site,
              }))}
              value={
                selectedSite
                  ? { label: selectedSite, value: selectedSite }
                  : null
              }
              onChange={(selected) => setSelectedSite(selected?.value || "")}
              placeholder="Select Site"
              isClearable
              className="w-full text-sm md:text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {(canEditAttendance || !isEditing) && (
              <button
                onClick={saveAttendance}
                disabled={
                  !selectedSite ||
                  !selectedDate ||
                  laborNames.length === 0 ||
                  (isEditing && !canEditAttendance)
                }
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm md:text-base"
              >
                {isEditing ? "Update" : "Save"} Attendance
              </button>
            )}
            {isEditing && canEditAttendance && (
              <button
                onClick={deleteAttendance}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-sm md:text-base"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Copy from previous date */}
        <div className="grid grid-cols-1 gap-4 mb-6 bg-gray-50 p-3 md:p-4 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Copy Names From Date
            </label>
            <input
              type="date"
              value={copyFromDate}
              onChange={(e) => setCopyFromDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <button
              onClick={copyNamesFromPrevious}
              disabled={!copyFromDate || !selectedSite}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 text-sm md:text-base"
            >
              Copy Names
            </button>
          </div>
          <div className="text-xs md:text-sm text-gray-500">
            Will copy labor names (without attendance) from selected date
          </div>
        </div>

        {/* Add new labor */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <Select
            options={availableLabors.map((labor) => ({
              label: labor,
              value: labor,
            }))}
            value={
              newLaborName ? { label: newLaborName, value: newLaborName } : null
            }
            onChange={(selected) => setNewLaborName(selected?.value || "")}
            placeholder="Select Labor"
            isClearable
            className="flex-1 text-sm md:text-base"
          />
          <input
            type="text"
            value={newLaborName}
            onChange={(e) => setNewLaborName(e.target.value)}
            placeholder="Or enter labor name"
            className="flex-1 p-2 border rounded text-sm md:text-base"
            onKeyPress={(e) => e.key === "Enter" && addLabor()}
          />
          <button
            onClick={addLabor}
            disabled={!newLaborName.trim()}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm md:text-base"
          >
            Add Labor
          </button>
        </div>

        {/* Attendance table */}
        {laborNames.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm md:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Day</th>
                  <th className="border p-2 text-left">Night</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {laborNames.map((labor, index) => (
                  <tr key={index}>
                    <td className="border p-2">{labor.name}</td>
                    <td className="border p-2">
                      <select
                        value={labor.dayStatus}
                        onChange={(e) =>
                          updateAttendance(index, "dayStatus", e.target.value)
                        }
                        className="w-full p-1 border rounded text-sm md:text-base"
                      >
                        <option value="">Select</option>
                        <option value="P">Present (P)</option>
                        <option value="A">Absent (A)</option>
                      </select>
                    </td>
                    <td className="border p-2">
                      <select
                        value={labor.nightStatus}
                        onChange={(e) =>
                          updateAttendance(index, "nightStatus", e.target.value)
                        }
                        className="w-full p-1 border rounded text-sm md:text-base"
                      >
                        <option value="">Select</option>
                        <option value="P">Present (P)</option>
                        <option value="A">Absent (A)</option>
                      </select>
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => {
                          const updated = [...laborNames];
                          updated.splice(index, 1);
                          setLaborNames(updated);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm md:text-base"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendance Records Section */}
      <div>
        <h2 className="text-sm md:text-xs font-semibold mb-3 md:mb-4">
          Attendance Records
        </h2>

        {/* Search and Filter Controls */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-md mb-4 md:mb-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Labor Name
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by labor name..."
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Site
              </label>
              <Select
                options={[
                  { label: "All Sites", value: "" },
                  ...sites.map((site) => ({ label: site, value: site })),
                ]}
                value={
                  filterSite === ""
                    ? { label: "All Sites", value: "" }
                    : { label: filterSite, value: filterSite }
                }
                onChange={(selected) => setFilterSite(selected?.value || "")}
                placeholder="Select Site"
                isClearable
                className="w-full text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Month
              </label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Note: Clear filters to see all records
          </div>
        </div>

        {filteredAttendanceData.length === 0 ? (
          <p className="text-gray-500 text-xs md:text-sm">
            No matching attendance records found
          </p>
        ) : (
          filteredAttendanceData.map((entry, index) => (
            <div
              key={index}
              className="mb-4 md:mb-6 bg-white p-3 md:p-4 rounded shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 md:mb-3">
                <h5 className="text-sm md:text-base">
                  Date: {formatDate(entry.date)}
                </h5>
                <div className="flex gap-2 items-center">
                  <h5 className="text-sm md:text-base font-medium">
                    Site: {entry.site}
                  </h5>
                  {canEditAttendance && (
                    <button
                      onClick={() => {
                        setSelectedDate(entry.date);
                        setSelectedSite(entry.site);
                        window.scrollTo(0, 0);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm md:text-base"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm md:text-base">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-left">Day</th>
                      <th className="border p-2 text-left">Night</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.labors.map((labor, laborIndex) => (
                      <tr key={laborIndex}>
                        <td className="border p-2">{labor.name}</td>
                        <td className="border p-2">
                          {labor.dayStatus === "P"
                            ? "Present (P)"
                            : "Absent (A)"}
                        </td>
                        <td className="border p-2">
                          {labor.nightStatus === "P"
                            ? "Present (P)"
                            : "Absent (A)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LaborsAttendance;
