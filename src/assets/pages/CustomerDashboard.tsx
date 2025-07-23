import React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import {
  setCustomerData,
  setPaymentData,
  setProjects,
} from "../Redux/dataSlice";
import { Link } from "react-router-dom";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

import { fetchWithLoading } from "../Redux/fetchWithLoading";

async function fetchCustomers() {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintscustomerdata",
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.body) ? data.body : [];
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return [];
  }
}

const fetchPaymentData = async () => {
  const response = await fetchWithLoading(
    "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsPayments"
  );
  const data = await response.json();
  return data.message;
};

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
      return typeof value === "string" ? JSON.parse(value) : value || fallback;
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
  }));

  return projects;
};

// PDF Generation Function
const generatePDF = (project: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yOffset = 20;

  const primaryColor = [0, 51, 102];
  const secondaryColor = [33, 33, 33];
  const accentColor = [0, 102, 204];
  const lightGray = [245, 245, 245];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Quotation", pageWidth / 2, 18, { align: "center" });

  // Company Details
  yOffset += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text("SAHANI PAINTS", 15, yOffset);
  yOffset += 5;
  doc.text("123 Business Street, City, Country", 15, yOffset);
  yOffset += 5;
  doc.text(
    "Email: contact@sheeladecor.com | Phone: +123 456 7890",
    15,
    yOffset
  );
  yOffset += 8;

  // Divider
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.4);
  doc.line(15, yOffset, pageWidth - 15, yOffset);
  yOffset += 8;

  // Project & Customer Details Box
  const cleanAddress =
    typeof project.projectAddress === "string"
      ? project.projectAddress.replace(/^"(.*)"$/, "$1")
      : "N/A";
  const addressLines = doc.splitTextToSize(
    `Address: ${cleanAddress}`,
    pageWidth / 2 - 20
  );
  const detailBoxHeight = Math.max(25, 12 + addressLines.length * 5);
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, yOffset, pageWidth - 30, detailBoxHeight, 2, 2, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Project Details", 20, yOffset + 6);
  doc.text("Customer Details", pageWidth / 2 + 5, yOffset + 6);

  yOffset += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text(`Project Name: ${project.projectName || "N/A"}`, 20, yOffset);
  doc.text(
    `Customer: ${
      Array.isArray(project.customerLink) && project.customerLink.length > 0
        ? project.customerLink[0]
        : "N/A"
    }`,
    pageWidth / 2 + 5,
    yOffset
  );
  yOffset += addressLines.length * 5;
  addressLines.forEach((line, i) => {
    doc.text(line, pageWidth / 2 + 5, yOffset + i * 5);
  });
  yOffset += 5;
  doc.text(
    `Date: ${project.projectDate || new Date().toLocaleDateString()}`,
    20,
    yOffset
  );
  yOffset += 10;

  // Table Data
  const tableData: any[] = [];
  let srNo = 1;

  if (Array.isArray(project.allData)) {
    project.allData.forEach((selection: any) => {
      if (Array.isArray(selection.areacollection)) {
        tableData.push([
          {
            content: selection.area || "Unknown Area",
            colSpan: 9,
            styles: {
              fontStyle: "bold",
              fillColor: accentColor,
              textColor: [255, 255, 255],
              fontSize: 9,
            },
          },
        ]);
        selection.areacollection.forEach((collection: any) => {
          if (!Array.isArray(collection.items) || !collection.items.length)
            return;
          const item = collection.items[0];
          const qty = parseFloat(collection.quantities?.[0]) || 0;
          const measurementQty = parseFloat(
            collection.measurement?.quantity || "0"
          );
          const calculatedMRP = (item[4] * measurementQty).toFixed(2);
          tableData.push([
            srNo++,
            `${collection.productGroup?.[0] || "N/A"} * ${
              collection.measurement?.quantity || 0
            }`,
            collection.measurement?.width && collection.measurement?.height
              ? `${collection.measurement.width}x${
                  collection.measurement.height
                } ${collection.measurement.unit || ""}`
              : "N/A",
            `INR ${calculatedMRP}`,
            qty.toString(),
            `INR ${(item[4] * measurementQty * qty).toFixed(2)}`,
            `${item[5] || "0"}%`,
            `INR ${collection.taxAmount?.[0]?.toFixed(2) || "0.00"}`,
            `INR ${collection.totalAmount?.[0]?.toFixed(2) || "0.00"}`,
          ]);
        });
      }
    });
  }

  if (
    Array.isArray(project.additionalItems) &&
    project.additionalItems.length > 0
  ) {
    tableData.push([
      {
        content: "Miscellaneous Items",
        colSpan: 9,
        styles: {
          fontStyle: "bold",
          fillColor: accentColor,
          textColor: [255, 255, 255],
          fontSize: 9,
        },
      },
    ]);
    project.additionalItems.forEach((item: any, index: number) => {
      const qty = parseFloat(item.quantity?.toString() || "0");
      const rate = parseFloat(item.rate?.toString() || "0");
      const netRate = parseFloat(item.netRate?.toString() || "0");
      const tax = parseFloat(item.tax?.toString() || "0");
      const taxAmount = parseFloat(item.taxAmount?.toString() || "0");
      const totalAmount = parseFloat(item.totalAmount?.toString() || "0");

      tableData.push([
        srNo++,
        item.name || `Miscellaneous Item ${index + 1}`,
        item.description || item.remark || "N/A",
        `INR ${rate.toFixed(2)}`,
        qty.toString(),
        `INR ${netRate.toFixed(2)}`,
        `${tax.toFixed(0)}%`,
        `INR ${taxAmount.toFixed(2)}`,
        `INR ${totalAmount.toFixed(2)}`,
      ]);
    });
  }

  // Table
  autoTable(doc, {
    startY: yOffset,
    head: [
      [
        "Sr. No.",
        "Item Name",
        "Description",
        "Rate",
        "Qty",
        "Net Rate",
        "Tax Rate",
        "Tax Amount",
        "Total",
      ],
    ],
    body:
      tableData.length > 0
        ? tableData
        : [
            [
              {
                content: "No product data available.",
                colSpan: 9,
                styles: { halign: "center" },
              },
            ],
          ],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 1.5,
      textColor: secondaryColor,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    alternateRowStyles: { fillColor: lightGray },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 38 },
      2: { cellWidth: 32 },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 12, halign: "center" },
      7: { cellWidth: 12, halign: "right" },
      8: { cellWidth: 22, halign: "right" },
    },
  });

  yOffset = doc.lastAutoTable.finalY + 10;

  // ---- 👇👇👇 Space Check Before Summary Box 👇👇👇 ----
  const summaryBoxHeight = 50;
  if (yOffset + summaryBoxHeight > pageHeight - 20) {
    doc.addPage();
    yOffset = 15;
  }

  // Summary Box
  doc.setFillColor(...lightGray);
  doc.roundedRect(pageWidth - 90, yOffset - 5, 75, 50, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Summary", pageWidth - 85, yOffset);
  yOffset += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...secondaryColor);
  const summaryItems = [
    {
      label: "Total Amount",
      value: `INR ${(project.totalAmount || 0).toFixed(2)}`,
    },
    { label: "Discount", value: `INR ${(project.discount || 0).toFixed(2)}` },
    { label: "Total Tax", value: `INR ${(project.totalTax || 0).toFixed(2)}` },
    {
      label: "Grand Total",
      value: `INR ${(project.totalAmount || 0).toFixed(2)}`,
    },
  ];
  summaryItems.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.text(item.label, pageWidth - 85, yOffset);
    doc.setFont("helvetica", "normal");
    doc.text(item.value, pageWidth - 20, yOffset, { align: "right" });
    yOffset += 8;
  });

  // Footer
  doc.setFillColor(...accentColor);
  doc.rect(0, pageHeight - 25, pageWidth, 1, "F");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Thank you for choosing SAHANI PAINTS!",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );
  doc.setFont("helvetica", "normal");
  doc.text(
    "SAHANI PAINTS - All Rights Reserved",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  // Save
  const safeProjectName = (project.projectName || "Project").replace(
    /[^a-zA-Z0-9]/g,
    "_"
  );
  const safeDate = (
    project.projectDate || new Date().toLocaleDateString()
  ).replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Quotation_${safeProjectName}_${safeDate}.pdf`);
};

const CustomerDashboard = ({
  customerDashboardData,
  setCustomerDashboardData,
  setCustomerDashboard,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [address, setAddress] = useState("");
  const [projectData, setProjectData] = useState([]);
  const [duePayment, setDuePayment] = useState(0);
  const [receivedPayment, setReceivedPayment] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [receivedProjectsPayment, setReceivedProjectsPayment] = useState(0);
  const [perProjectPayment, setPerProjectPayments] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [GST, setGST] = useState("");
  const [payments, setPaymentsArray] = useState([]);

  const dispatch = useDispatch();
  const paymentData = useSelector((state) => state.data.paymentData);
  const projects = useSelector((state) => state.data.projects);

  useEffect(() => {
    setEmail(customerDashboardData[2]);
    setCustomerName(customerDashboardData[0]);
    setPhoneNumber(customerDashboardData[1]);
    setAlternateNumber(customerDashboardData[4]);
    setAddress(customerDashboardData[3]);
  }, [customerDashboardData]);

  useEffect(() => {
    const fetchAndCalculate = async () => {
      const now = Date.now();

      // Fetch Project Data
      let projectList = [];
      const cachedProjects = localStorage.getItem("projectData");

      if (cachedProjects) {
        const parsed = JSON.parse(cachedProjects);
        const timeDiff = now - parsed.time;

        if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
          projectList = parsed.data;
          dispatch(setProjects(parsed.data));
        } else {
          try {
            const data = await fetchProjectData();
            projectList = data;
            dispatch(setProjects(data));
            localStorage.setItem(
              "projectData",
              JSON.stringify({ data, time: now })
            );
          } catch (error) {
            console.error("Failed to fetch projects:", error);
          }
        }
      } else {
        try {
          const data = await fetchProjectData();
          projectList = data;
          dispatch(setProjects(data));
          localStorage.setItem(
            "projectData",
            JSON.stringify({ data, time: now })
          );
        } catch (error) {
          console.error("Failed to fetch projects:", error);
        }
      }
      // Filter & Calculate Project Stats
      let filteredProjects = [];
      if (customerDashboardData[0]) {
        filteredProjects = projectList.filter(
          (p) =>
            p?.customerLink?.[0]?.toString().trim() ===
            customerDashboardData[0]?.toString().trim()
        );

        setProjectData(filteredProjects);
        setActiveOrders(filteredProjects.length);

        let totalAmount = 0;
        let totalTax = 0;
        filteredProjects.forEach((p) => {
          totalTax += parseFloat(p.totalTax) || 0;
          totalAmount += parseFloat(p.totalAmount) || 0;
        });

        setDuePayment(totalAmount);
      }

      // Fetch Payment Data
      let paymentList = [];
      const cachedPayments = localStorage.getItem("paymentData");

      if (cachedPayments) {
        const parsed = JSON.parse(cachedPayments);
        const timeDiff = now - parsed.time;

        if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
          paymentList = parsed.data;
          dispatch(setPaymentData(parsed.data));
        } else {
          try {
            const data = await fetchPaymentData();
            paymentList = data;
            dispatch(setPaymentData(data));
            localStorage.setItem(
              "paymentData",
              JSON.stringify({ data, time: now })
            );
          } catch (error) {
            console.error("Failed to fetch payments:", error);
          }
        }
      } else {
        try {
          const data = await fetchPaymentData();
          paymentList = data;
          dispatch(setPaymentData(data));
          localStorage.setItem(
            "paymentData",
            JSON.stringify({ data, time: now })
          );
        } catch (error) {
          console.error("Failed to fetch payments:", error);
        }
      }

      // Calculate Total & Per-Project Received Payments
      if (customerDashboardData[0] && filteredProjects.length) {
        let totalReceived = 0;
        const projectPayments = filteredProjects.map((project) => {
          const projectTotal = paymentList
            .filter(
              (payment) =>
                payment[1] === project.projectName &&
                payment[0] === customerDashboardData[0]
            )
            .reduce((sum, payment) => {
              const amount = parseFloat(payment[2]);
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0);

          totalReceived += projectTotal;
          return projectTotal;
        });

        setReceivedPayment(totalReceived);
        setReceivedProjectsPayment(totalReceived);
        setPerProjectPayments(projectPayments);
      }
    };

    fetchAndCalculate();
  }, [dispatch, customerDashboardData]);

  async function sendcustomerData() {
    let date = undefined;
    const now = new Date();
    date = now.toISOString().slice(0, 16);

    const api =
      "https://sheeladecor.netlify.app/.netlify/functions/server/updatepaintscustomerdata";

    const response = await fetchWithLoading(api, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: customerName,
        phonenumber: phoneNumber,
        email: email,
        address: address,
        alternatenumber: alternateNumber,
        addedDate: date,
        companyName,
        GST,
      }),
    });

    if (response.status === 200) {
      const data = await fetchCustomers();
      dispatch(setCustomerData(data));
      localStorage.setItem(
        "customerData",
        JSON.stringify({ data, time: Date.now() })
      );
      alert("Customer Updated Successfully");
    } else {
      alert("Error in updating customer");
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-8 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
            {customerName}
          </h1>
          <div className="flex flex-row gap-2 text-xs sm:text-sm text-gray-600">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 !no-underline"
            >
              Dashboard
            </Link>
            <span>•</span>
            <Link
              to="/customers"
              onClick={() => setCustomerDashboard(false)}
              className="text-blue-600 hover:text-blue-800 !no-underline"
            >
              Customers
            </Link>
            <span>•</span>
            <span>{customerName}</span>
          </div>
        </div>
        <button
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-sky-600 text-white text-sm !rounded-lg hover:bg-sky-700 transition-colors"
          onClick={() => setCustomerDashboard(false)}
        >
          Cancel
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="flex flex-col border !rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm sm:text-base text-sky-700 font-medium">
            Active Orders
          </p>
          <p className="text-base sm:text-lg font-semibold">{activeOrders}</p>
        </div>
        <div className="flex flex-col border !rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm sm:text-base text-purple-600 font-medium">
            Total Value of Projects
          </p>
          <p className="text-base sm:text-lg font-semibold">
            ₹{Math.round(duePayment).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex flex-col border !rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm sm:text-base text-green-600 font-medium">
            Payment Received
          </p>
          <p className="text-base sm:text-lg font-semibold">
            ₹{Math.round(receivedProjectsPayment).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex flex-col border !rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm sm:text-base text-red-500 font-medium">
            Payment Due
          </p>
          <p className="text-base sm:text-lg font-semibold">
            ₹
            {Math.round(duePayment - receivedProjectsPayment).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>
      </div>

      {/* Projects Table Section */}
      <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-4">
          Projects
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full hidden md:table border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="py-3 px-4 text-left">Project Name</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Received</th>
                <th className="py-3 px-4 text-left">Due</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Quote</th>
              </tr>
            </thead>
            <tbody>
              {projectData &&
                projectData.map((project, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{project.projectName}</td>
                    <td className="py-3 px-4 text-sm">{project.status}</td>
                    <td className="py-3 px-4 text-sm">
                      ₹{Math.round(project.grandTotal).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      ₹
                      {perProjectPayment != null &&
                        Math.round(perProjectPayment[index]).toLocaleString(
                          "en-IN"
                        )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      ₹
                      {Math.round(
                        project.grandTotal - perProjectPayment[index]
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-sm">{project.projectDate}</td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => generatePDF(project)}
                        className="border px-2 py-1 !rounded-md"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {/* Mobile and Tablet View for Projects */}
          <div className="md:hidden flex flex-col gap-4">
            {projectData &&
              projectData.map((project, index) => (
                <div
                  key={index}
                  className="border !rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="font-medium text-gray-600">
                      Project Name
                    </span>
                    <span>{project.projectName}</span>
                    <span className="font-medium text-gray-600">Status</span>
                    <span>{project.status}</span>
                    <span className="font-medium text-gray-600">Amount</span>
                    <span>
                      ₹{Math.round(project.totalAmount).toLocaleString("en-IN")}
                    </span>
                    <span className="font-medium text-gray-600">Received</span>
                    <span>
                      ₹
                      {perProjectPayment != null &&
                        Math.round(perProjectPayment[index]).toLocaleString(
                          "en-IN"
                        )}
                    </span>
                    <span className="font-medium text-gray-600">Due</span>
                    <span>
                      ₹
                      {Math.round(
                        project.totalAmount - perProjectPayment[index]
                      ).toLocaleString("en-IN")}
                    </span>
                    <span className="font-medium text-gray-600">Date</span>
                    <span>{project.projectDate}</span>
                    <span className="font-medium text-gray-600">Quote</span>
                    <span>
                      <button
                        onClick={() => generatePDF(project)}
                        className="border px-2 py-1 !rounded-md"
                      >
                        <Download size={16} />
                      </button>
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Customer Details Section */}
      <div className="bg-white border !rounded-lg p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-4">
          Customer Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
              Customer <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="border !rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={customerName}
              readOnly
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Email</label>
            <input
              type="text"
              onChange={(e) => setEmail(e.target.value)}
              className="border !rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Phone Number</label>
            <input
              type="text"
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border !rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={phoneNumber}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
              Alternate Phone Number
            </label>
            <input
              type="text"
              onChange={(e) => setAlternateNumber(e.target.value)}
              className="border !rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={alternateNumber}
            />
          </div>
          <div className="flex flex-col sm:col-span-2">
            <label className="text-sm text-gray-600 mb-1">Address</label>
            <input
              type="text"
              onChange={(e) => setAddress(e.target.value)}
              className="border !rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={address}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Company Name</label>
            <input
              type="text"
              placeholder="Company Name"
              onChange={(e) => setCompanyName(e.target.value)}
              className="border !rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={companyName}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">GST IN</label>
            <input
              type="text"
              placeholder="GST Number"
              onChange={(e) => setGST(e.target.value)}
              className="border !rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={GST}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={sendcustomerData}
            className="px-4 py-2 bg-sky-600 text-white text-sm !rounded-lg hover:bg-sky-700 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
