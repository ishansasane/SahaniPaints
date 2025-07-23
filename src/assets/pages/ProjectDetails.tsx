<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap"
/>;

import { Target } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setInteriorData, setSalesAssociateData } from "../Redux/dataSlice";
import { fetchWithLoading } from "../Redux/fetchWithLoading";
import Select from "react-select";

const ProjectDetails = ({
  selectedCustomer,
  interior = [],
  salesdata = [],
  interiorArray = "",
  setInteriorArray,
  salesAssociateArray = "",
  setSalesAssociateArray,
  projectName,
  setProjectName,
  projectReference,
  setProjectReference,
  user,
  setUser,
  projectDate,
  setProjectDate,
  setAdditionalRequests,
  additionalRequests,
  projectAddress,
  setProjectAddress,
  setSalesData,
  setInterior,
}) => {
  // Debugging logs for props
  console.log("Props received:", {
    salesdata,
    interior,
    salesAssociateArray,
    interiorArray,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const interiors = await fetchInteriors();
        const sales = await fetchSalesAssociates();
        setInterior(interiors);
        setSalesData(sales);
      } catch (error) {
        console.error("Failed to load initial interior/sales data:", error);
      }
    };

    loadInitialData();
  }, []);

  async function fetchInteriors() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsinteriordata",
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data.body) ? data.body : [];
    } catch (error) {
      console.error("Error fetching interiors:", error);
      return [];
    }
  }

  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async () => {
    const url =
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintsinteriordata";
    const response = await fetchWithLoading(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, phonenumber, address }),
    });

    if (response.status === 200) {
      const data = await fetchInteriors();
      dispatch(setInteriorData(data));
      setInterior(data);
      localStorage.setItem(
        "interiorData",
        JSON.stringify({ data, time: Date.now() })
      );
      setIsOpen(false);
      setName("");
      setEmail("");
      setPhoneNumber("");
      setAddress("");
      alert("Interior added successfully");
    } else {
      alert("Error saving interior");
    }
  };

  const [isSalesOpen, setIsSalesOpen] = useState(false);

  async function fetchSalesAssociates() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintssalesassociatedata",
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data.body) ? data.body : [];
    } catch (error) {
      console.error("Error fetching sales associates:", error);
      return [];
    }
  }

  const [salesname, salesSetName] = useState("");
  const [salesemail, salesSetEmail] = useState("");
  const [salesphonenumber, salesSetPhoneNumber] = useState("");
  const [salesaddress, salesSetAddress] = useState("");

  const handleSalesSubmit = async () => {
    const url =
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintssalesassociatedata";
    const response = await fetchWithLoading(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: salesname,
        email: salesemail,
        phonenumber: salesphonenumber,
        address: salesaddress,
      }),
    });

    if (response.status === 200) {
      const data = await fetchSalesAssociates();
      dispatch(setSalesAssociateData(data));
      setSalesData(data);
      localStorage.setItem(
        "salesAssociateData",
        JSON.stringify({ data, time: Date.now() })
      );
      setIsSalesOpen(false);
      salesSetName("");
      salesSetEmail("");
      salesSetPhoneNumber("");
      salesSetAddress("");
      alert("Sales Associate added successfully");
    } else {
      alert("Error saving sales associate");
    }
  };

  // Handle sales associate selection
  const handleSalesAssociateChange = (selectedOption) => {
    const selectedValue = selectedOption ? selectedOption.value : "";
    console.log("Selected Sales Associate:", selectedValue);
    console.log("Previous salesAssociateArray:", salesAssociateArray);
    setSalesAssociateArray(selectedValue);
    console.log("New salesAssociateArray:", selectedValue);
  };

  // Handle interior selection
  const handleInteriorChange = (selectedOption) => {
    const selectedValue = selectedOption ? selectedOption.value : "";
    console.log("Selected Interior:", selectedValue);
    console.log("Previous interiorArray:", interiorArray);
    setInteriorArray(selectedValue);
    console.log("New interiorArray:", selectedValue);
  };

  // Debug state changes
  useEffect(() => {
    console.log("salesAssociateArray updated:", salesAssociateArray);
  }, [salesAssociateArray]);

  useEffect(() => {
    console.log("interiorArray updated:", interiorArray);
  }, [interiorArray]);

  // Prepare options for react-select
  const interiorOptions = Array.isArray(interior)
    ? interior.map((data, index) => ({
        value: data.name || data[0] || "",
        label: data.name || data[0] || "Unknown",
      }))
    : [];

  const salesAssociateOptions = Array.isArray(salesdata)
    ? salesdata.map((data, index) => ({
        value: data.name || data[0] || "",
        label: data.name || data[0] || "Unknown",
      }))
    : [];

  return (
    <div className="flex flex-col gap-4 p-6 bg-white !rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl font-inter">
      <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-gray-900 tracking-tight mb-4">
        Project Details
      </h2>

      {/* Reference & Project Name */}
      <div className="flex flex-col sm:flex-row w-full gap-4">
        <div className="flex flex-col w-full sm:w-1/2">
          <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
            Project Name{" "}
            <span className="text-gray-500 text-xs">
              {" "}
              <span className="text-red-500">*</span> (unique name)
            </span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
            value={projectName || ""}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            required
          />
        </div>
        <div className="flex flex-col w-full sm:w-1/2">
          <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
            Reference <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
            value={projectReference || ""}
            onChange={(e) => setProjectReference(e.target.value)}
            placeholder="Reference"
          />
        </div>
      </div>

      {/* Address */}
      {selectedCustomer && (
        <div className="flex flex-col w-full gap-2">
          <div className="flex flex-col w-full">
            <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
              value={projectAddress || ""}
              onChange={(e) => setProjectAddress(e.target.value)}
              placeholder="Address"
            />
          </div>
        </div>
      )}

      {/* Additional Requests */}
      {selectedCustomer && (
        <div className="flex flex-col w-full gap-2">
          <div className="flex flex-col w-full">
            <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
              Any Additional Requests{" "}
              <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <textarea
              placeholder="Additional Requests"
              value={additionalRequests || ""}
              onChange={(e) => setAdditionalRequests(e.target.value)}
              className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50 resize-y min-h-[100px]"
            />
          </div>
        </div>
      )}

      {/* Dropdowns for Interior & Sales Associate */}
      <div className="flex flex-col sm:flex-row w-full gap-4">
        <div className="flex flex-col w-full sm:w-1/2">
          <div className="flex flex-wrap flex-row gap-4 items-center mb-3">
            <label className="text-sm font-poppins font-medium text-gray-700">
              Select Interior
            </label>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              onClick={() => setIsOpen(true)}
            >
              <FaPlus className="w-4 h-4" />
              Add Interior
            </button>
          </div>
          <Select
            options={interiorOptions}
            value={
              interiorOptions.find(
                (option) => option.value === interiorArray
              ) || null
            }
            onChange={handleInteriorChange}
            placeholder="Select Interior Name (optional)"
            className="w-full text-sm font-inter"
            classNamePrefix="react-select"
            isClearable
            isSearchable
            styles={{
              control: (provided) => ({
                ...provided,
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                padding: "0.5rem",
                backgroundColor: "#f9fafb",
                boxShadow: "none",
                "&:hover": {
                  borderColor: "#6366f1",
                },
                "&:focus": {
                  borderColor: "#6366f1",
                  boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)",
                },
              }),
              option: (provided, state) => ({
                ...provided,
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.875rem",
                backgroundColor: state.isSelected
                  ? "#6366f1"
                  : state.isFocused
                  ? "#f3f4f6"
                  : "white",
                color: state.isSelected ? "white" : "#1f2937",
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                },
              }),
              menu: (provided) => ({
                ...provided,
                borderRadius: "0.5rem",
                marginTop: "0.25rem",
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "#6b7280",
              }),
            }}
          />
        </div>

        <div className="flex flex-col w-full sm:w-1/2">
          <div className="flex flex-wrap flex-row gap-4 items-center mb-3">
            <label className="text-sm font-poppins font-medium text-gray-700">
              Select Sales Associate
            </label>
            <button
              onClick={() => setIsSalesOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <FaPlus className="w-4 h-4" />
              Add Sales Associate
            </button>
          </div>
          <Select
            options={salesAssociateOptions}
            value={
              salesAssociateOptions.find(
                (option) => option.value === salesAssociateArray
              ) || null
            }
            onChange={handleSalesAssociateChange}
            placeholder="Select Sales Associate (optional)"
            className="w-full text-sm font-inter"
            classNamePrefix="react-select"
            isClearable
            isSearchable
            styles={{
              control: (provided) => ({
                ...provided,
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                padding: "0.5rem",
                backgroundColor: "#f9fafb",
                boxShadow: "none",
                "&:hover": {
                  borderColor: "#6366f1",
                },
                "&:focus": {
                  borderColor: "#6366f1",
                  boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)",
                },
              }),
              option: (provided, state) => ({
                ...provided,
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.875rem",
                backgroundColor: state.isSelected
                  ? "#6366f1"
                  : state.isFocused
                  ? "#f3f4f6"
                  : "white",
                color: state.isSelected ? "white" : "#1f2937",
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                },
              }),
              menu: (provided) => ({
                ...provided,
                borderRadius: "0.5rem",
                marginTop: "0.25rem",
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "#6b7280",
              }),
            }}
          />
        </div>
      </div>

      {/* Select User */}
      <div className="flex flex-col sm:flex-row w-full gap-4">
        <div className="flex flex-col w-full sm:w-1/2">
          <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
            Select User
          </label>
          <input
            type="text"
            className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
            value={user || ""}
            onChange={(e) => setUser(e.target.value)}
            placeholder="User Name"
          />
        </div>
        <div className="flex flex-col w-full sm:w-1/2">
          <label className="text-sm font-poppins font-medium text-gray-700 mb-1">
            Project Deadline
          </label>
          <input
            type="date"
            className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
            value={projectDate || ""}
            onChange={(e) => setProjectDate(e.target.value)}
          />
        </div>
      </div>

      {/* Add Interior Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60">
          <div className="bg-white p-8 !rounded-2xl shadow-2xl border border-gray-100 w-[90%] sm:w-[80%] md:w-[500px] transition-all duration-300">
            <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-6 tracking-tight">
              Add Interior
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="space-y-4">
                {/* Name (Required) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Phone Number (Required) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Phone Number"
                    value={phonenumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                {/* Address (Required) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-gray-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => {
                    setName("");
                    setEmail("");
                    setPhoneNumber("");
                    setAddress("");
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

      {/* Add Sales Associate Dialog */}
      {isSalesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60">
          <div className="bg-white p-8 !rounded-2xl shadow-2xl border border-gray-100 w-[90%] sm:w-[80%] md:w-[500px] transition-all duration-300">
            <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-6 tracking-tight">
              Add Sales Associate
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSalesSubmit();
              }}
            >
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Name"
                    value={salesname}
                    onChange={(e) => salesSetName(e.target.value)}
                  />
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Email"
                    value={salesemail}
                    onChange={(e) => salesSetEmail(e.target.value)}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Phone Number"
                    value={salesphonenumber}
                    onChange={(e) => salesSetPhoneNumber(e.target.value)}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                    placeholder="Address"
                    value={salesaddress}
                    onChange={(e) => salesSetAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-gray-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => {
                    salesSetName("");
                    salesSetEmail("");
                    salesSetPhoneNumber("");
                    salesSetAddress("");
                    setIsSalesOpen(false);
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

// Error Boundary Component
class ProjectDetailsErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-500 bg-white !rounded-2xl shadow-lg border border-gray-100 font-inter">
          <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-4">
            Something went wrong in Project Details.
          </h2>
          <p className="text-sm mb-4">{this.state.error?.toString()}</p>
          <button
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const WrappedProjectDetails = (props) => (
  <ProjectDetailsErrorBoundary>
    <ProjectDetails {...props} />
  </ProjectDetailsErrorBoundary>
);

export default WrappedProjectDetails;
