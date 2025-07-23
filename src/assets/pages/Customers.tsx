<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap"
/>;

import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, MoreVertical } from "lucide-react";

import { RootState } from "../Redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setCustomerData } from "../Redux/dataSlice";
import AddCustomerDialog from "../compoonents/AddCustomerDialog";
import { useNavigate } from "react-router-dom";
import CustomerDashboard from "./CustomerDashboard";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface Customer {
  name: string;
  phonenumber: string;
  alternateNumber: string;
  email: string;
  address: string;
  addedDate: string;
}

async function fetchCustomers(): Promise<Customer[]> {
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

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [reset, setreset] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  let count = 0;

  const dispatch = useDispatch();
  const customerData = useSelector((state: RootState) => state.data.customers);

  async function deleteCustomer(name: string) {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletepaintscustomerdata",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name }),
      }
    );

    if (response.status === 200) {
      const data = await fetchCustomers();
      dispatch(setCustomerData(data));
      alert("Customer deleted");
      setreset(!reset);
    } else {
      alert("Error in customer deletion");
    }
  }

  const [customerDashboard, setCustomerDashboard] = useState(false);

  const [customerDashboardData, setCustomerDashboardData] =
    useState<Customer>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Check localStorage first
      const cached = localStorage.getItem("customerData");
      const now = Date.now();

      if (cached && !reset) {
        const parsed = JSON.parse(cached);
        const timeDiff = now - parsed.time;

        // Use cached data if it's fresh (e.g., within 5 minutes)
        if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
          dispatch(setCustomerData(parsed.data));
          setCustomers(parsed.data);
          return;
        }
      }

      // If no cached data or reset triggered, fetch from server
      const data = await fetchCustomers();
      dispatch(setCustomerData(data));
      setCustomers(data);
      localStorage.setItem("customerData", JSON.stringify({ data, time: now }));

      if (reset) {
        setDialogOpen(false);
        setreset(false);
      }
    };

    fetchData();
  }, [reset, dispatch, customerDashboard]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) =>
    customer[0].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`p-6 bg-gray-50 md:mt-0 mt-20 h-screen`}>
      <div
        className={`flex flex-wrap justify-between items-center p-2 mb-4 ${
          customerDashboard ? "hidden" : ""
        }`}
      >
        <h1 className="text-[1.5vw] font-semibold">Customers</h1>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2"
          style={{ borderRadius: "8px" }}
          onClick={() => navigate("/add-customer")}
        >
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div
        className={`bg-white p-5 rounded-md shadow overflow-x-auto ${
          customerDashboard ? "hidden" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setOpenDropdown(null);
        }}
      >
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        <table
          className="w-full border-collapse border border-gray-300"
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown(null);
          }}
        >
          <thead className="bg-sky-50">
            <tr className="text-gray-600">
              <th className="px-4 py-2">Customer Name</th>
              <th className="px-4 py-2">Mobile</th>
              <th className="px-4 py-2">Alternate Number</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-6 py-2 w-1/5">Address</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer, index) => (
                <tr
                  key={index}
                  className="hover:bg-sky-50"
                  onClick={() => {
                    setCustomerDashboardData(customer);
                    setCustomerDashboard(true);
                  }}
                >
                  <td className="px-4 py-2">{customer[0]}</td>
                  <td className="px-4 py-2">{customer[1]}</td>
                  <td className="px-6 py-2">{customer[4]}</td>
                  <td className="px-4 py-2">{customer[2]}</td>
                  <td className="px-4 py-2">{customer[3]}</td>
                  <td className="px-4 py-2 relative">
                    <button
                      className="p-2 hover:bg-gray-200 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === index ? null : index);
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openDropdown === index && (
                      <div
                        ref={dropdownRef}
                        className="absolute bg-white shadow-md rounded-md z-[50] border flex flex-col"
                      >
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setEditing(customer);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit size={16} /> edit
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-red-100 text-red-600 flex items-center gap-2"
                          onClick={() => deleteCustomer(customer[0])}
                        >
                          <Trash2 size={16} /> delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isDialogOpen && (
        <AddCustomerDialog
          setDialogOpen={setDialogOpen}
          editing={editing}
          setEditing={setEditing}
          reset={reset}
          setReset={setreset}
        />
      )}
      {customerDashboard && (
        <CustomerDashboard
          setCustomerDashboardData={setCustomerDashboardData}
          customerDashboardData={customerDashboardData}
          setCustomerDashboard={setCustomerDashboard}
        />
      )}
    </div>
  );
}
