import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import AddCustomerDialog from "../compoonents/AddCustomerDialog";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../Redux/store";
import { setCustomerData } from "../Redux/dataSlice";
import { fetchWithLoading } from "../Redux/fetchWithLoading";
import Select from "react-select";

const CustomerDetails = ({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  projectData,
  setCustomers,
}) => {
  const handleCustomerChange = (option) => {
    if (!option) {
      setSelectedCustomer(null);
    } else {
      const customerObj = JSON.parse(option.value);
      setSelectedCustomer(customerObj);
      projectData[0] = option.value;
    }
  };

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

  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [email, setEmail] = useState("");

  const dispatch = useDispatch();
  const customerData = useSelector((state: RootState) => state.data.customers);

  async function sendcustomerData() {
    const phonenumber = mobile;
    let date = undefined;

    const now = new Date();
    date = now.toISOString().slice(0, 16);

    const api =
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintscustomerdata";

    const response = await fetchWithLoading(api, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        phonenumber,
        email,
        address,
        alternatenumber: alternateNumber,
        addedDate: date,
      }),
    });

    if (response.status === 200) {
      const data = await fetchCustomers();

      dispatch(setCustomerData(data));
      setCustomers(data);

      localStorage.setItem(
        "customerData",
        JSON.stringify({ data, time: Date.now() })
      );

      setName("");
      setAddress("");
      setMobile("");
      setEmail("");
      setAlternateNumber("");

      alert("Customer added successfully");
    } else {
      alert("Error in adding customer");
    }

    setIsOpen(false);
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-white !rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl font-inter">
      <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-gray-900 tracking-tight mb-4">
        Customer Details
      </h2>

      <div className="flex md:flex-row flex-col justify-between gap-4">
        {/* Select Customer */}
        <div className="flex flex-col md:w-1/2 w-full">
          <div className="flex flex-wrap flex-row gap-4 items-center mb-3">
            <label className="text-sm font-poppins font-medium text-gray-700">
              Select Customer
            </label>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              onClick={() => setIsOpen(true)}
            >
              <FaPlus className="w-4 h-4" />
              Add Customer
            </button>
          </div>

          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select Customer"
            isClearable
            value={
              selectedCustomer
                ? {
                    label: selectedCustomer[0],
                    value: JSON.stringify(selectedCustomer),
                  }
                : null
            }
            options={
              Array.isArray(customers)
                ? customers.map((customer) => ({
                    label: customer[0],
                    value: JSON.stringify(customer),
                  }))
                : []
            }
            onChange={handleCustomerChange}
            styles={{
              control: (base, state) => ({
                ...base,
                backgroundColor: "#f9fafb", // bg-gray-50
                borderColor: "#e5e7eb", // border-gray-200
                borderRadius: "0.5rem", // rounded-lg
                paddingTop: "0.50rem",
                paddingBottom: "0.50rem",
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
                fontSize: "0.875rem", // text-sm
                fontFamily: "Inter, sans-serif",
                boxShadow: state.isFocused ? "0 0 0 2px #6366f1" : "none", // ring-indigo-500
                "&:hover": {
                  borderColor: "#6366f1", // hover focus:border-indigo-500
                },
              }),
              option: (base, state) => ({
                ...base,
                fontSize: "0.875rem",
                fontFamily: "Inter, sans-serif",
                backgroundColor: state.isFocused ? "#eef2ff" : "#fff", // focus:bg-indigo-100
                color: state.isFocused ? "#1e40af" : "#111827", // text-indigo-800 or text-gray-900
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
              }),
              singleValue: (base) => ({
                ...base,
                fontSize: "0.875rem",
                fontFamily: "Inter, sans-serif",
                color: "#374151", // text-gray-700
              }),
              menu: (base) => ({
                ...base,
                zIndex: 100,
              }),
            }}
          />
        </div>

        {/* Email Field */}
        {selectedCustomer && (
          <div className="flex flex-col md:w-1/2 w-full">
            <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-600 font-inter"
              value={selectedCustomer[2]}
              readOnly
            />
          </div>
        )}
      </div>

      {/* Phone and Alternate Phone */}
      {selectedCustomer && (
        <div className="flex md:flex-row flex-col justify-between gap-4">
          <div className="flex flex-col md:w-1/2 w-full">
            <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-600 font-inter"
              value={selectedCustomer[1]}
              readOnly
            />
          </div>
          <div className="flex flex-col md:w-1/2 w-full">
            <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
              Alternate Phone Number (optional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-600 font-inter"
              value={selectedCustomer[4]}
              readOnly
            />
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60">
          <div className="bg-white w-full max-w-md p-8 !rounded-2xl shadow-2xl border border-gray-100 transition-all duration-300">
            <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-6 tracking-tight">
              Add Customer
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendcustomerData();
              }}
            >
              <div className="space-y-4">
                {/* Name (required) */}
                <div className="flex flex-col">
                  <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Email (optional) */}
                <div className="flex flex-col">
                  <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Mobile (required) */}
                <div className="flex flex-col">
                  <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>

                {/* Address (required) */}
                <div className="flex flex-col">
                  <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                {/* Alternate Number (optional) */}
                <div className="flex flex-col">
                  <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
                    Alternate Number
                  </label>
                  <input
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Alternate Number"
                    value={alternateNumber}
                    onChange={(e) => setAlternateNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-gray-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
