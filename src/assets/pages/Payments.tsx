import React, { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { setPaymentData, setProjects } from "../Redux/dataSlice";
import { useNavigate } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const Payments = () => {
  const fetchPaymentData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsPayments"
    );
    const data = await response.json();
    return data.message;
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editPayments, setEditPayments] = useState(undefined);
  const paymentsData = useSelector(
    (state: RootState) => state.data.paymentData
  );
  const projects = useSelector((state: RootState) => state.data.projects);
  const [payment, setPayment] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [addPayment, setAddPayment] = useState(false);
  const [customer, setCustomer] = useState("");
  const [project, setProject] = useState("");
  const [deleted, setDeleted] = useState(true);
  const [filteredPayments, setFilteredPayments] = useState([]);

  const formatINR = (value: number | string) =>
    Number(value).toLocaleString("en-IN");

  const fetchProjectData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsprojectdata",
      { credentials: "include" }
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
    }));

    return projects;
  };

  useEffect(() => {
    let isMounted = true;
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000;

    const fetchData = async () => {
      try {
        let finalProjects = [];
        if (projects && projects.length > 0) {
          finalProjects = projects;
        } else {
          const cachedProjects = localStorage.getItem("projectData");
          if (cachedProjects) {
            const parsed = JSON.parse(cachedProjects);
            const isValid =
              parsed?.data?.length > 0 && now - parsed.time < cacheExpiry;
            if (isValid) {
              finalProjects = parsed.data;
              dispatch(setProjects(parsed.data));
            }
          }

          if (finalProjects.length === 0) {
            const freshProjects = await fetchProjectData();
            if (Array.isArray(freshProjects)) {
              finalProjects = freshProjects;
              dispatch(setProjects(freshProjects));
              localStorage.setItem(
                "projectData",
                JSON.stringify({ data: freshProjects, time: now })
              );
            }
          }
        }

        let finalPayments = [];
        const cachedPayments = localStorage.getItem("paymentData");
        if (cachedPayments) {
          const parsed = JSON.parse(cachedPayments);
          const isValid =
            parsed?.data?.length > 0 && now - parsed.time < cacheExpiry;
          if (isValid) {
            finalPayments = parsed.data;
            dispatch(setPaymentData(parsed.data));
          }
        }

        if (finalPayments.length === 0) {
          const freshPayments = await fetchPaymentData();
          if (Array.isArray(freshPayments)) {
            finalPayments = freshPayments;
            dispatch(setPaymentData(freshPayments));
            localStorage.setItem(
              "paymentData",
              JSON.stringify({ data: freshPayments, time: now })
            );
          }
        }

        if (finalProjects.length > 0 && finalPayments.length > 0 && isMounted) {
          const projectNames = finalProjects.map((p) => p.projectName);
          const filtered = finalPayments.filter((payment) =>
            projectNames.includes(payment[1])
          );
          setFilteredPayments(filtered);
        }
      } catch (error) {
        console.error("❌ Error fetching project or payment data:", error);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [dispatch, deleted]);

  const deletePayment = async (name, projectname, p, pd, pm, re) => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintsPayment",
      {
        credentials: "include",
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          customerName: name,
          Name: projectname,
          Received: p,
          ReceivedDate: pd,
          PaymentMode: pm,
          Remarks: re,
        }),
      }
    );

    if (response.status === 200) {
      const latestPayments = await fetchPaymentData();
      dispatch(setPaymentData(latestPayments));
      localStorage.setItem(
        "paymentData",
        JSON.stringify({ data: latestPayments, time: Date.now() })
      );
      alert("Deleted");
      setDeleted(!deleted);
    } else {
      alert("Error");
    }
  };

  const addPaymentFunction = async () => {
    const isEdit = editPayments != undefined;
    const url = isEdit
      ? "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintsPayments"
      : "https://sheeladecor.netlify.app/.netlify/functions/server/addPaintsPayment";

    const payload = {
      customerName: customer,
      Name: project,
      Received: payment,
      ReceivedDate: paymentDate,
      PaymentMode: paymentMode,
      Remarks: paymentRemarks,
    };

    try {
      const response = await fetchWithLoading(url, {
        credentials: "include",
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 200) {
        const latestPayments = await fetchPaymentData();
        dispatch(setPaymentData(latestPayments));
        localStorage.setItem(
          "paymentData",
          JSON.stringify({ data: latestPayments, time: Date.now() })
        );
        alert(isEdit ? "Payment updated" : "Payment added");
        setAddPayment(false);
        setPayment(0);
        setPaymentDate("");
        setPaymentMode("");
        setPaymentRemarks("");
        setDeleted(!deleted);
      } else {
        alert("Error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Network or server error");
    }
    setEditPayments(undefined);
  };

  const setCancelPayment = () => {
    setAddPayment(false);
    setEditPayments(undefined);
    setPayment(0);
    setPaymentDate("");
    setPaymentMode("");
    setPaymentRemarks("");
  };

  return (
    <div className="w-full p-4 sm:p-6 flex flex-col min-h-screen">
      <div className="flex mt-5 flex-wrap flex-row justify-between items-center mb-6">
        <h1 className="text-lg sm:text-2xl font-semibold">Payments</h1>
        <button
          onClick={() => navigate("/")}
          className="px-3 py-2 text-sm sm:text-base text-white bg-sky-600 hover:bg-sky-700 !rounded-lg"
        >
          Dashboard
        </button>
      </div>

      <div className="w-full overflow-x-auto border rounded-xl p-3 max-h-[70vh]">
        <table className="w-full text-sm sm:text-base">
          <thead>
            <tr className="font-semibold text-gray-700">
              <th className="p-2 text-left">Sr. No.</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Project</th>
              <th className="p-2 text-left">Mode</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 &&
              filteredPayments.map((payment, index) => (
                <tr className="hover:bg-sky-50" key={index}>
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{formatINR(payment[2])}</td>
                  <td className="p-2">{payment[1]}</td>
                  <td className="p-2">{payment[4]}</td>
                  <td className="p-2">{payment[3] || "-"}</td>
                  <td className="p-2 flex flex-row gap-2">
                    <button
                      onClick={() =>
                        deletePayment(
                          payment[0],
                          payment[1],
                          payment[2],
                          payment[3],
                          payment[4],
                          payment[5]
                        )
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => {
                        setProject(payment[1]);
                        setCustomer(payment[0]);
                        setPayment(payment[2]);
                        setPaymentDate(payment[3]);
                        setPaymentMode(payment[4]);
                        setPaymentRemarks(payment[5]);
                        setEditPayments(payment);
                        setAddPayment(true);
                      }}
                      className="text-sky-700 hover:text-sky-900"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {addPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md sm:max-w-lg bg-white rounded-xl p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-sm sm:text-base">
                  Amount Received <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={payment}
                  className="border rounded-lg p-2 h-10 w-full"
                  onChange={(e) =>
                    setPayment(
                      e.target.value === "" ? 0 : parseFloat(e.target.value)
                    )
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm sm:text-base">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  className="border rounded-lg p-2 h-10 w-full"
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm sm:text-base">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={paymentMode}
                  className="border rounded-lg p-2 h-10 w-full"
                  onChange={(e) => setPaymentMode(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm sm:text-base">
                  Remarks <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={paymentRemarks}
                  className="border rounded-lg p-2 h-10 w-full"
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                />
              </div>
              <div className="flex flex-row justify-end gap-3">
                <button
                  onClick={setCancelPayment}
                  className="border-2 border-sky-700 text-sky-600 bg-white px-3 py-2 rounded-lg hover:bg-sky-50 text-sm sm:text-base"
                >
                  Close
                </button>
                <button
                  onClick={addPaymentFunction}
                  className={`text-white bg-sky-600 hover:bg-sky-700 px-3 py-2 rounded-lg text-sm sm:text-base ${
                    editPayments === undefined ? "" : "hidden"
                  }`}
                >
                  Add Payment
                </button>
                <button
                  onClick={addPaymentFunction}
                  className={`text-white bg-sky-600 hover:bg-sky-700 px-3 py-2 rounded-lg text-sm sm:text-base ${
                    editPayments !== undefined ? "" : "hidden"
                  }`}
                >
                  Edit Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
