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
import { fetchWithLoading } from "../Redux/fetchWithLoading";

// Utility function to format numbers
const formatNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return "0";
  const number = Number(num);
  if (isNaN(number)) return "0";
  const hasDecimals = number % 1 !== 0;
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

function Reports() {
  const dispatch = useDispatch();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const paymentsData = useSelector(
    (state: RootState) => state.data.paymentData
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Handle Payments
        const paymentRes = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsPayments",
          {
            credentials: "include",
          }
        );

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          if (paymentData.success === "true") {
            const payments = paymentData.message || [];
            dispatch(setPaymentData(payments));
            setPayments(payments);
          }
        } else {
          console.error("Failed to fetch payment data:", paymentRes.status);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error in fetchData:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const filteredPayments = payments.filter((payment: any[]) => {
    const customer = payment[0] || "";
    const date = payment[3] || "";

    const matchCustomer = customer
      .toString()
      .toLowerCase()
      .includes(searchCustomer.toLowerCase());

    const matchDate =
      (!dateFrom || dayjs(date).isAfter(dayjs(dateFrom).subtract(1, "day"))) &&
      (!dateTo || dayjs(date).isBefore(dayjs(dateTo).add(1, "day")));

    return matchCustomer && matchDate;
  });

  const totalPaymentAmount = filteredPayments.reduce(
    (acc: number, curr: any[]) => acc + (parseFloat(curr[2]) || 0),
    0
  );

  return (
    <div className="p-6 mt-5 md:!mt-2 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Payments Dashboard</h1>

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
            {filteredPayments.map((pay: any[], idx: number) => (
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
    </div>
  );
}

export default Reports;
