import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { setProjects } from "../Redux/dataSlice";
import { RootState } from "../Redux/store";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const InteriorPage = ({ interiorData, setInteriorOpen }) => {
  const dispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.data.projects);
  const [interiorProjects, setInteriorProjects] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);

  const fetchProjectData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsprojectdata",
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.body || !Array.isArray(data.body)) {
      throw new Error("Invalid data format: Expected an array in data.body");
    }

    const parseSafely = (value, fallback) => {
      try {
        return typeof value === "string"
          ? JSON.parse(value)
          : value || fallback;
      } catch (error) {
        console.warn("Invalid JSON:", value, error);
        return fallback;
      }
    };

    const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

    const fixBrokenArray = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input !== "string") return [];

      try {
        const fixed = JSON.parse(input);
        if (Array.isArray(fixed)) return fixed;
        return [];
      } catch {
        try {
          const cleaned = input
            .replace(/^\[|\]$/g, "")
            .split(",")
            .map((item) => item.trim().replace(/^"+|"+$/g, ""));
          return cleaned;
        } catch {
          return [];
        }
      }
    };

    const projects = data.body.map((row) => ({
      projectName: row[0],
      customerLink: parseSafely(row[1], []),
      projectReference: row[2] || "",
      status: row[3] || "",
      totalAmount: parseFloat(row[4]) || 0,
      totalTax: parseFloat(row[5]) || 0,
      paid: parseFloat(row[6]) || 0,
      discount: parseFloat(row[7]) || 0,
      createdBy: row[8] || "",
      allData: deepClone(parseSafely(row[9], [])),
      projectDate: row[10] || "",
      additionalRequests: parseSafely(row[11], []),
      interiorArray: fixBrokenArray(row[12]),
      salesAssociateArray: fixBrokenArray(row[13]),
      additionalItems: deepClone(parseSafely(row[14], [])),
      goodsArray: deepClone(parseSafely(row[15], [])),
      tailorsArray: deepClone(parseSafely(row[16], [])),
      projectAddress: row[17],
      date: row[18],
      grandTotal: row[19],
      discountType: row[20],
      bankDetails: deepClone(parseSafely(row[21], [])),
      termsConditions: deepClone(parseSafely(row[22], [])),
    }));

    return projects;
  };

  useEffect(() => {
    let timeoutId;

    const fetchProjects = async () => {
      try {
        const cached = localStorage.getItem("projectData");
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes

        let finalData = [];

        if (cached) {
          const parsed = JSON.parse(cached);
          const isCacheValid =
            parsed?.data?.length > 0 && now - parsed.time < cacheExpiry;

          if (isCacheValid) {
            finalData = parsed.data;
            dispatch(setProjects(finalData));
          }
        }

        const freshData = await fetchProjectData();
        if (Array.isArray(freshData)) {
          finalData = freshData;
          dispatch(setProjects(finalData));
          localStorage.setItem(
            "projectData",
            JSON.stringify({ data: freshData, time: now })
          );
        } else {
          console.warn("Fetched project data is not an array:", freshData);
        }

        if (finalData.length > 0 && interiorData?.[0]) {
          const filtered = finalData.filter(
            (project) => project?.interiorArray?.[0] === interiorData[0]
          );
          setTotalProjects(filtered.length);
          setInteriorProjects(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        const fallbackCache = localStorage.getItem("projectData");
        if (fallbackCache) {
          const parsed = JSON.parse(fallbackCache);
          if (parsed?.data?.length > 0) {
            dispatch(setProjects(parsed.data));
            if (interiorData?.[0]) {
              const filtered = parsed.data.filter(
                (project) => project?.interiorArray?.[0] === interiorData[0]
              );
              setInteriorProjects(filtered);
            }
          }
        }
      }
    };

    // Initial fetch
    fetchProjects();

    // 👇 Listen to tab visibility changes (like coming back to this page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        timeoutId = setTimeout(fetchProjects, 100); // Delay to allow transition
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, [dispatch, interiorData]);

  return (
    <div className="flex flex-col gap-4 w-full p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800">
            {interiorData[0]}
          </h1>
          <div className="flex flex-row gap-2 items-center text-xs sm:text-sm md:text-base text-gray-600">
            <button
              onClick={() => setInteriorOpen(false)}
              className="hover:text-sky-600 transition-colors"
            >
              Interiors
            </button>
            <span>•</span>
            <span>{interiorData[0]}</span>
          </div>
        </div>
        <button
          onClick={() => setInteriorOpen(false)}
          className="px-4 py-2 bg-sky-600 text-white !rounded-lg hover:bg-sky-700 transition-colors w-full sm:w-auto text-sm sm:text-base"
        >
          Cancel
        </button>
      </div>

      {/* Interior Details Section */}
      <div className="flex flex-col gap-3 border rounded-xl p-4 sm:p-6 bg-white shadow-sm w-full">
        <h2 className="text-base sm:text-lg md:text-xl font-medium text-gray-800">
          Interior Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm md:text-base">
          <p className="text-gray-500 font-medium">Name</p>
          <p className="text-gray-800 break-words">{interiorData[0]}</p>
          <p className="text-gray-500 font-medium">Email</p>
          <p className="text-gray-800 break-words overflow-hidden">
            {interiorData[1]}
          </p>
          <p className="text-gray-500 font-medium">Phone no.</p>
          <p className="text-gray-800 break-words">{interiorData[2]}</p>
          <p className="text-gray-500 font-medium">Address</p>
          <p className="text-gray-800 break-words">{interiorData[3]}</p>
          <p className="text-gray-500 font-medium">Total Projects</p>
          <p className="text-gray-800">{totalProjects}</p>
        </div>
      </div>

      {/* Projects Table Section */}
      <div className="w-full flex flex-col p-4 border rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border-gray-300 px-3 py-2 text-left font-medium">
                  Sr.No
                </th>
                <th className="border-gray-300 px-3 py-2 text-left font-medium">
                  Project Name
                </th>
                <th className="border-gray-300 px-3 py-2 text-left font-medium">
                  Amount
                </th>
                <th className="border-gray-300 px-3 py-2 text-left font-medium">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {interiorProjects.length > 0 ? (
                interiorProjects.map((data, index) => (
                  <tr key={index} className="hover:bg-sky-50 transition-colors">
                    <td className="border-gray-300 px-3 py-2">{index + 1}</td>
                    <td className="border-gray-300 px-3 py-2 break-words">
                      {data.projectName}
                    </td>
                    <td className="border-gray-300 px-3 py-2">
                      {data.totalAmount}
                    </td>
                    <td className="border-gray-300 px-3 py-2 break-words">
                      {data.projectDate}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center px-3 py-2 text-gray-600"
                  >
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InteriorPage;
