import React, { useEffect, useState, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { setCustomerData } from "../../Redux/dataSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

const EditCustomerDetails = ({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  projectData,
  setCustomers,
}) => {
  const handleCustomerChange = (customerObj) => {
    if (!customerObj) {
      setSelectedCustomer(null);
      setSearchTerm("");
    } else {
      setSelectedCustomer(customerObj);
      setSearchTerm(customerObj[0]);
    }
  };

  useEffect(() => {
    console.log(selectedCustomer);
    setSearchTerm(selectedCustomer ? selectedCustomer[0] : "");
  }, [selectedCustomer]);

  async function fetchCustomers() {
    try {
      const response = await fetch(
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const customerData = useSelector((state: RootState) => state.data.customers);

  async function sendcustomerData() {
    const phonenumber = mobile;
    let date = undefined;
    const now = new Date();
    date = now.toISOString().slice(0, 16);

    const api =
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintscustomerdata";

    const response = await fetch(api, {
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredCustomers = Array.isArray(customers)
    ? customers.filter((customer) =>
        customer[0].toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 !rounded-2xl shadow-lg w-full bg-white border border-gray-100 mt-6 transition-all duration-300 hover:shadow-xl">
      <p className="text-xl sm:text-2xl font-bold text-gray-800">
        Customer Details
      </p>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
        <div className="flex flex-col w-full sm:w-1/2" ref={dropdownRef}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
            <p className="text-sm sm:text-base font-medium text-gray-600">
              Select Customer
            </p>
            <button
              className="flex items-center px-4 py-2 border border-indigo-500 text-indigo-600 font-semibold !rounded-lg bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-600 transition-all duration-200"
              onClick={() => setIsOpen(true)}
            >
              <FaPlus className="mr-2 text-indigo-600" /> Add Customer
            </button>
          </div>
          <div className="relative">
            {/* <input
              type="text"
              className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
              placeholder="Search or select customer"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
            /> */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 !rounded-lg shadow-md max-h-60 overflow-y-auto">
                <div
                  className="p-3 cursor-pointer hover:bg-indigo-50 text-sm sm:text-base text-gray-700 transition-colors duration-150"
                  onClick={() => {
                    handleCustomerChange(null);
                    setIsDropdownOpen(false);
                  }}
                >
                  Select Customer
                </div>
                {filteredCustomers.map((customer, index) => (
                  <div
                    key={index}
                    className="p-3 cursor-pointer hover:bg-indigo-50 text-sm sm:text-base text-gray-700 transition-colors duration-150"
                    onClick={() => {
                      handleCustomerChange(customer);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {customer[0]}
                  </div>
                ))}
              </div>
            )}
          </div>
          <select
            className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-50 text-gray-700 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
            value={selectedCustomer ? JSON.stringify(selectedCustomer) : ""}
            onChange={(e) => {
              if (e.target.value === "") {
                setSelectedCustomer(null);
              } else {
                setSelectedCustomer(JSON.parse(e.target.value));
              }
            }}
          >
            <option value="">Select Customer</option>
            {Array.isArray(customers) && customers.length > 0 ? (
              customers.map((customer, index) => (
                <option key={index} value={JSON.stringify(customer)}>
                  {customer[0] || "Unnamed Customer"}
                </option>
              ))
            ) : (
              <option disabled>No customers available</option>
            )}
          </select>
        </div>

        {projectData.customerLink && selectedCustomer && (
          <div className="flex flex-col w-full sm:w-1/2">
            <p className="text-sm sm:text-base font-medium text-gray-600">
              Email <span className="text-gray-400 text-xs">(optional)</span>
            </p>
            <input
              type="text"
              className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-100 text-gray-600 cursor-not-allowed"
              value={selectedCustomer[2] || ""}
              readOnly
            />
          </div>
        )}
      </div>

      {projectData.customerLink && selectedCustomer && (
        <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
          <div className="flex flex-col w-full sm:w-1/2">
            <p className="text-sm sm:text-base font-medium text-gray-600">
              Phone Number
            </p>
            <input
              type="text"
              className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-100 text-gray-600 cursor-not-allowed"
              value={selectedCustomer[1] || ""}
              readOnly
            />
          </div>
          <div className="flex flex-col w-full sm:w-1/2">
            <p className="text-sm sm:text-base font-medium text-gray-600">
              Alternate Phone Number
              <span className="text-gray-400 text-xs">(optional)</span>
            </p>
            <input
              type="text"
              className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-100 text-gray-600 cursor-not-allowed"
              value={selectedCustomer[4] || ""}
              readOnly
            />
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-6 sm:p-8 !rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md transform transition-all duration-300 scale-100">
            {/* Name (Required) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendcustomerData();
              }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                Add Customer
              </h2>

              {/* Name */}
              <label className="mb-1 text-sm sm:text-base font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                className="border border-gray-200 p-3 !rounded-lg w-full mb-4 text-sm sm:text-base bg-gray-50 text-gray-700"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* Email */}
              <label className="mb-1 text-sm sm:text-base font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                className="border border-gray-200 p-3 !rounded-lg w-full mb-4 text-sm sm:text-base bg-gray-50 text-gray-700"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Mobile Number */}
              <label className="mb-1 text-sm sm:text-base font-medium text-gray-700">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                className="border border-gray-200 p-3 !rounded-lg w-full mb-4 text-sm sm:text-base bg-gray-50 text-gray-700"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />

              {/* Address */}
              <label className="mb-1 text-sm sm:text-base font-medium text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                className="border border-gray-200 p-3 !rounded-lg w-full mb-4 text-sm sm:text-base bg-gray-50 text-gray-700"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              {/* Alternate Number */}
              <label className="mb-1 text-sm sm:text-base font-medium text-gray-700">
                Alternate Number{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                className="border border-gray-200 p-3 !rounded-lg w-full mb-4 text-sm sm:text-base bg-gray-50 text-gray-700"
                placeholder="Alternate Number"
                value={alternateNumber}
                onChange={(e) => setAlternateNumber(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-5 py-2 bg-gray-600 text-white !rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white !rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base font-medium"
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

export default EditCustomerDetails;
