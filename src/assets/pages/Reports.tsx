import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { RootState } from "../Redux/store";
import {
  setPaymentData,
  setProjects,
  setProjectFlag,
  setTasks,
} from "../Redux/dataSlice";
import { useDispatch, useSelector } from "react-redux";
import EditProjects from "./EditProjects";
import BankDetails from "./BankDetails";
import TermsAndConditions from "./TermsAndConditions";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

// Utility function to format numbers
const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";
  const number = Number(num);
  const hasDecimals = number % 1 !== 0;
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

function Reports() {
  const dispatch = useDispatch();

  const fetchProjectData = async () => {
    const response = await fetch(
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

    const parseSafely = (value: any, fallback: any) => {
      try {
        return typeof value === "string"
          ? JSON.parse(value)
          : value || fallback;
      } catch (error) {
        console.warn("Invalid JSON:", value, error);
        return fallback;
      }
    };

    const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

    const fixBrokenArray = (input: any): string[] => {
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
            .map((item: string) => item.trim().replace(/^"+|"+$/g, ""));
          return cleaned;
        } catch {
          return [];
        }
      }
    };

    const projects = data.body.map((row: any[]) => ({
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
    }));

    return projects;
  };

  const [payments, setPayments] = useState([]);
  const [projects, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payments");

  const [searchCustomer, setSearchCustomer] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const projectData = useSelector((state: RootState) => state.data.projects);
  const paymentsData = useSelector(
    (state: RootState) => state.data.paymentData
  );
  const taskData = useSelector((state: RootState) => state.data.tasks);

  const [projectPayments, setProjectPayments] = useState<number[]>([]);

  const fetchTaskData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintstasks"
    );
    const data = await response.json();
    if (data.body) {
      return data.body;
    } else {
      return [];
    }
  };

  const [flag, setFlag] = useState(false);
  const [sendProject, setSendProject] = useState(null);
  const [index, setIndex] = useState(null);
  const [Tax, setTax] = useState(0);
  const [Amount, setAmount] = useState(0);
  const [Discount, setDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    const fetchAndSetTasks = async () => {
      try {
        const cached = localStorage.getItem("taskData");
        const now = Date.now();

        if (cached) {
          const parsed = JSON.parse(cached);
          const timeDiff = now - parsed.time;

          if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
            const sortedTasks = parsed.data.sort(
              (a, b) => new Date(a[2]).getTime() - new Date(b[2]).getTime()
            );
            dispatch(setTasks(sortedTasks));
            return;
          }
        }

        const data = await fetchTaskData();
        const sorted = data.sort(
          (a, b) => new Date(a[2]).getTime() - new Date(b[2]).getTime()
        );
        dispatch(setTasks(sorted));
        localStorage.setItem(
          "taskData",
          JSON.stringify({ data: sorted, time: now })
        );
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    fetchAndSetTasks();
  }, [dispatch]);

  const [refresh, setrefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const now = Date.now();

      // ---------- Handle Project Data ----------
      const cachedProjects = localStorage.getItem("projectData");
      let projects = [];

      if (cachedProjects) {
        const parsed = JSON.parse(cachedProjects);
        const timeDiff = now - parsed.time;

        if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
          dispatch(setProjects(parsed.data));
          setProjectsData(parsed.data);
          projects = parsed.data;
        } else {
          projects = await fetchProjectData();
          dispatch(setProjects(projects));
          setProjectsData(projects);
          localStorage.setItem(
            "projectData",
            JSON.stringify({ data: projects, time: now })
          );
        }
      } else {
        projects = await fetchProjectData();
        dispatch(setProjects(projects));
        setProjectsData(projects);
        localStorage.setItem(
          "projectData",
          JSON.stringify({ data: projects, time: now })
        );
      }

      // ---------- Handle Payments ----------
      try {
        const paymentRes = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsPayments",
          {
            credentials: "include",
          }
        );

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          if (paymentData.success === "true") {
            dispatch(setPaymentData(paymentData.message));
            setPayments(paymentData.message);

            // Group payments by project name
            const paymentSums = projects.map((project) => {
              const totalPaid = paymentData.message
                .filter((payment: any[]) => payment[1] == project.projectName)
                .reduce(
                  (acc: number, payment: any[]) =>
                    acc + (parseFloat(payment[2]) || 0),
                  0
                );
              return totalPaid;
            });

            setProjectPayments(paymentSums);
            console.log(paymentSums);
          }
        } else {
          console.error("Failed to fetch payment data:", paymentRes.status);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, [dispatch, flag]);

  const filteredPayments = (payments ?? []).filter(([customer, , , date]) => {
    const matchCustomer = customer
      .toLowerCase()
      .includes(searchCustomer.toLowerCase());

    const matchDate =
      (!dateFrom || dayjs(date).isAfter(dayjs(dateFrom).subtract(1, "day"))) &&
      (!dateTo || dayjs(date).isBefore(dayjs(dateTo).add(1, "day")));

    return matchCustomer && matchDate;
  });

  const totalPaymentAmount = filteredPayments.reduce(
    (acc, curr) => acc + parseFloat(curr[2] || 0),
    0
  );
  // 1. Correct total project value
  const totalProjectValue = projects.reduce((acc, proj) => {
    const projectValue = parseFloat(proj.grandTotal) || 0;
    return acc + projectValue;
  }, 0);

  // 2. Correct total advance from payments matching project names
  const totalAdvance = payments.reduce((acc, payment) => {
    const [, projectName, amount] = payment;
    const isInProjectList = projects.some(
      (proj) => proj.projectName === projectName
    );
    return isInProjectList ? acc + (parseFloat(amount) || 0) : acc;
  }, 0);

  const [discountType, setDiscountType] = useState("cash");
  const [paidAmount, setPaidAmount] = useState(0);

  return (
    <div className="p-6 mt-5 md:!mt-2 bg-gray-100 min-h-screen">
      <h1 className={`text-2xl font-bold mb-6 ${flag ? "hidden" : ""}`}>
        Reports Dashboard
      </h1>

      {/* Tabs */}
      <div className={`${flag ? "hidden" : ""} flex gap-4 mb-6 mt-10`}>
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 rounded  ${
            activeTab === "payments"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300"
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 rounded ${
            activeTab === "projects"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300"
          }`}
        >
          Projects
        </button>
      </div>

      {flag == false && loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {flag == false && activeTab === "payments" && (
            <>
              {/* Filters */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search by customer"
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="border rounded px-4 py-2 w-full"
                />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border rounded px-4 py-2 w-full"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border rounded px-4 py-2 w-full"
                />
              </div>

              {/* Summary */}
              <div className="mb-4 text-lg font-semibold">
                Total Payments: ₹{formatNumber(totalPaymentAmount)}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded shadow">
                  <thead>
                    <tr className="bg-gray-200 text-left">
                      <th className="px-4 py-2">Customer</th>
                      <th className="px-4 py-2">Project</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Mode</th>
                      <th className="px-4 py-2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((pay, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{pay[0]}</td>
                        <td className="px-4 py-2">{pay[1]}</td>
                        <td className="px-4 py-2">
                          ₹{formatNumber(parseFloat(pay[2] || 0))}
                        </td>
                        <td className="px-4 py-2">{pay[3]}</td>
                        <td className="px-4 py-2">{pay[4]}</td>
                        <td className="px-4 py-2">{pay[5]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {flag == false && activeTab === "projects" && (
            <>
              {/* Summary */}
              <div className="mb-4 text-lg font-semibold">
                Total Project Value: ₹{formatNumber(totalProjectValue)} | Total
                Advance: ₹{formatNumber(totalAdvance)}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded shadow">
                  <thead>
                    <tr className="bg-gray-200 text-left">
                      <th className="px-4 py-2">Project Name</th>
                      <th className="px-4 py-2">Customer Name</th>
                      <th className="px-4 py-2">Total Amount</th>
                      <th className="px-4 py-2">Paid</th>
                      <th className="px-4 py-2">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((proj, idx) => (
                      <tr key={idx} className="border-t">
                        <td
                          onClick={() => {
                            setPaidAmount(projectPayments[idx]);
                            setDiscountType(proj.discountType);
                            setTax(proj.totalTax);
                            setAmount(proj.totalAmount);
                            setDiscount(proj.discount);
                            setGrandTotal(proj.grandTotal);
                            setSendProject(proj);
                            setIndex(idx);
                            setFlag(true);
                          }}
                          className="px-4 py-2"
                        >
                          {proj.projectName}
                        </td>
                        <td className="px-4 py-2">{proj.customerLink[0]}</td>
                        <td className="px-4 py-2">
                          ₹{formatNumber(proj.grandTotal)}
                        </td>
                        <td className="px-4 py-2">
                          ₹{formatNumber(projectPayments[idx])}
                        </td>
                        <td className="px-4 py-2">
                          ₹
                          {formatNumber(proj.grandTotal - projectPayments[idx])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
      {flag && (
        <EditProjects
          projectData={sendProject}
          index={index}
          goBack={() => {
            setFlag(false);
            dispatch(setProjectFlag(false));
          }}
          tasks={taskData}
          projects={projectData}
          Tax={Tax}
          setTax={setTax}
          Amount={Amount}
          setAmount={setAmount}
          Discount={Discount}
          setDiscount={setDiscount}
          grandTotal={grandTotal}
          setGrandTotal={setGrandTotal}
          discountType={discountType}
          setDiscountType={setDiscountType}
          Paid={paidAmount}
          setPaid={setPaidAmount}
        />
      )}
    </div>
  );
}

export default Reports;
