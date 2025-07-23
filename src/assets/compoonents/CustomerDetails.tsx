import { useEffect, useState } from "react";
import AddCustomerDialog from "./AddCustomerDialog";

import { RootState } from "../Redux/store";
import { useSelector, useDispatch } from "react-redux";
import { setCustomerData } from "../Redux/dataSlice";
import { fetchWithLoading } from "../Redux/fetchWithLoading";
interface Customer {
  name: string;
  mobile: string;
  address: string;
}

interface CustomerDetailsProps {
  selectedCustomer: string | null;
  setSelectedCustomer: (customer: string | null) => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  selectedCustomer,
  setSelectedCustomer,
  editing,
  setEditing,
}) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const [customers, setcustomers] = useState<[]>([]);

  const customerData = useSelector((state: RootState) => state.data.customers);
  const dispatch = useDispatch();

  async function fetchCustomers() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintscustomerdata",
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // ✅ Ensure JSON is properly parsed
      return Array.isArray(data.body) ? data.body : []; // ✅ Ensure we return an array
    } catch (error) {
      console.error("Error fetching customer data:", error);
      return [];
    }
  }

  useEffect(() => {
    async function fetchData() {
      const data = await fetchCustomers();
      dispatch(setCustomerData(data));
      setcustomers(customerData);
    }
    if (customerData.length == 0) {
      fetchData();
    } else {
      setcustomers(customerData);
    }
  }, [customerData, dispatch]);

  return (
    <div className="mb-6 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
      <div className="flex gap-4">
        <select
          className="border p-2 rounded w-full"
          value={selectedCustomer || ""}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">Select Customer</option>
          {Array.isArray(customers) &&
            customers.map((customer, index) => (
              <option key={index} value={customer[0]}>
                {customer[0]}
              </option>
            ))}
        </select>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setDialogOpen(true)}
        >
          + Add Customer
        </button>
      </div>

      {isDialogOpen && (
        <AddCustomerDialog
          setDialogOpen={setDialogOpen}
          setCustomers={setcustomers}
          editing={editing}
          setEditing={setEditing}
        />
      )}
    </div>
  );
};

export default CustomerDetails;
