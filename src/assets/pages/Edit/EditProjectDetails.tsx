import { Target } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setInteriorData, setSalesAssociateData } from "../../Redux/dataSlice";

const EditProjectDetails = ({
  selectedCustomer,
  interior,
  salesdata,
  interiorArray,
  setInteriorArray,
  salesAssociateArray,
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
  projectData,
  setsalesdata,
}) => {
  async function fetchInteriors() {
    try {
      const response = await fetch(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsinteriordata",
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data.body || [];
    } catch (error) {
      console.error("Error fetching interiors:", error);
      return [];
    }
  }

  async function fetchSalesAssociates() {
    try {
      const response = await fetch(
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

  const [isOpen, setIsOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [interiorSearchTerm, setInteriorSearchTerm] = useState("");
  const [salesSearchTerm, setSalesSearchTerm] = useState("");
  const [isInteriorDropdownOpen, setIsInteriorDropdownOpen] = useState(false);
  const [isSalesDropdownOpen, setIsSalesDropdownOpen] = useState(false);
  const interiorDropdownRef = useRef(null);
  const salesDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const [interiorData, setInterior] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [salesname, salesSetName] = useState("");
  const [salesemail, salesSetEmail] = useState("");
  const [salesphonenumber, salesSetPhoneNumber] = useState("");
  const [salesaddress, salesSetAddress] = useState("");

  const handleInteriorChange = (interiorObj) => {
    if (!interiorObj) {
      setInteriorArray([]);
      setInteriorSearchTerm("");
    } else {
      setInteriorArray(interiorObj);
      setInteriorSearchTerm(interiorObj[0]);
    }
  };

  const handleSalesAssociateChange = (salesObj) => {
    if (!salesObj) {
      setSalesAssociateArray([]);
      setSalesSearchTerm("");
    } else {
      setSalesAssociateArray(salesObj);
      setSalesSearchTerm(salesObj[0]);
    }
  };

  useEffect(() => {
    setInteriorSearchTerm(
      interiorArray && interiorArray[0] ? interiorArray[0] : ""
    );
    setSalesSearchTerm(
      salesAssociateArray && salesAssociateArray[0]
        ? salesAssociateArray[0]
        : ""
    );
  }, [interiorArray, salesAssociateArray]);

  const handleSubmit = async () => {
    const url =
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintsinteriordata";
    const response = await fetch(url, {
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
      setName("");
      setEmail("");
      setPhoneNumber("");
      setAddress("");
      setIsOpen(false);
      alert("Interior added successfully");
    } else {
      alert("Error saving interior");
    }
  };

  const handleSalesSubmit = async () => {
    const url =
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintssalesassociatedata";
    const response = await fetch(url, {
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
      setsalesdata(data);
      localStorage.setItem(
        "salesAssociateData",
        JSON.stringify({ data, time: Date.now() })
      );
      salesSetName("");
      salesSetEmail("");
      salesSetPhoneNumber("");
      salesSetAddress("");
      setIsSalesOpen(false);
      alert("Sales Associate added successfully");
    } else {
      alert("Error saving sales associate");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        interiorDropdownRef.current &&
        !interiorDropdownRef.current.contains(event.target)
      ) {
        setIsInteriorDropdownOpen(false);
      }
      if (
        salesDropdownRef.current &&
        !salesDropdownRef.current.contains(event.target)
      ) {
        setIsSalesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredInteriors = Array.isArray(interior)
    ? interior.filter((data) =>
        data[0].toLowerCase().includes(interiorSearchTerm.toLowerCase())
      )
    : [];

  const filteredSalesAssociates = Array.isArray(salesdata)
    ? salesdata.filter((data) =>
        data[0].toLowerCase().includes(salesSearchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 !rounded-2xl shadow-lg w-full bg-white border border-gray-100 mt-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center gap-2">
        <p className="text-xl sm:text-2xl font-bold text-gray-800">
          Project Details
        </p>
      </div>

      <div className="flex flex-col sm:flex-row w-full gap-6">
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base font-medium text-gray-600">
            Reference <span className="text-gray-400 text-xs">(optional)</span>
          </p>
          <input
            type="text"
            className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
            value={projectReference}
            onChange={(e) => setProjectReference(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base font-medium text-gray-600">
            Project Name{" "}
            <span className="text-gray-400 text-xs">(Unique name)</span>
          </p>
          <input
            type="text"
            className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
      </div>

      {projectData.customerLink && (
        <div className="flex flex-col w-full">
          <p className="text-sm sm:text-base font-medium text-gray-600">
            Address
          </p>
          <input
            type="text"
            className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-100 text-gray-600 cursor-not-allowed"
            value={selectedCustomer[3] || ""}
            readOnly
          />
        </div>
      )}

      {projectData.additionalRequests && (
        <div className="flex flex-col w-full">
          <p className="text-sm sm:text-base font-medium text-gray-600">
            Any Additional Requests{" "}
            <span className="text-gray-400 text-xs">(optional)</span>
          </p>
          <textarea
            value={additionalRequests}
            onChange={(e) => setAdditionalRequests(e.target.value)}
            className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-y min-h-[100px] transition-all duration-200"
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row w-full gap-6">
        <div
          className="flex flex-col w-full sm:w-1/2"
          ref={interiorDropdownRef}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
            <p className="text-sm sm:text-base font-medium text-gray-600">
              Select Interior
            </p>
            <button
              className="flex items-center px-4 py-2 border border-indigo-500 text-indigo-600 font-semibold !rounded-lg bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-600 transition-all duration-200"
              onClick={() => setIsOpen(true)}
            >
              <FaPlus className="mr-2 text-indigo-600" /> Add Interior
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
              placeholder="Search or select interior"
              value={interiorSearchTerm}
              onChange={(e) => {
                setInteriorSearchTerm(e.target.value);
                setIsInteriorDropdownOpen(true);
              }}
              onFocus={() => setIsInteriorDropdownOpen(true)}
            />
            {isInteriorDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 !rounded-lg shadow-md max-h-60 overflow-y-auto">
                <div
                  className="p-3 cursor-pointer hover:bg-indigo-50 text-sm sm:text-base text-gray-700 transition-colors duration-150"
                  onClick={() => {
                    handleInteriorChange(null);
                    setIsInteriorDropdownOpen(false);
                  }}
                >
                  Select Interior Name (optional)
                </div>
                {filteredInteriors.map((data, index) => (
                  <div
                    key={index}
                    className="p-3 cursor-pointer hover:bg-indigo-50 text-sm sm:text-base text-gray-700 transition-colors duration-150"
                    onClick={() => {
                      handleInteriorChange(data);
                      setIsInteriorDropdownOpen(false);
                    }}
                  >
                    {data[0]}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* <select
            className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-50 text-gray-700 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
            value={interiorArray ? JSON.stringify(interiorArray) : ""}
            onChange={(e) =>
              setInteriorArray(e.target.value ? JSON.parse(e.target.value) : [])
            }
          >
            <option value="">Select Interior Name (optional)</option>
            {interior && interior.length > 0 ? (
              interior.map((data, index) => (
                <option key={index} value={JSON.stringify(data)}>
                  {data[0]}
                </option>
              ))
            ) : (
              <option disabled>No interiors available</option>
            )}
          </select> */}
        </div>

        <div className="flex flex-col w-full sm:w-1/2" ref={salesDropdownRef}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
            <p className="text-sm sm:text-base font-medium text-gray-600">
              Select Sales Associate
            </p>
            <button
              className="flex items-center px-4 py-2 border border-indigo-500 text-indigo-600 font-semibold !rounded-lg bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-600 transition-all duration-200"
              onClick={() => setIsSalesOpen(true)}
            >
              <FaPlus className="mr-2 text-indigo-600" /> Add Sales Associate
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
              placeholder="Search or select sales associate"
              value={salesSearchTerm}
              onChange={(e) => {
                setSalesSearchTerm(e.target.value);
                setIsSalesDropdownOpen(true);
              }}
              onFocus={() => setIsSalesDropdownOpen(true)}
            />
            {isSalesDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 !rounded-lg shadow-md max-h-60 overflow-y-auto">
                <div
                  className="p-3 cursor-pointer hover:bg-indigo-50 text-sm sm:text-base text-gray-700 transition-colors duration-150"
                  onClick={() => {
                    handleSalesAssociateChange(null);
                    setIsSalesDropdownOpen(false);
                  }}
                >
                  Select Sales Associate (optional)
                </div>
                {filteredSalesAssociates.map((data, index) => (
                  <div
                    key={index}
                    className="p-3 cursor-pointer hover:bg-indigo-50 text-sm sm:text-base text-gray-700 transition-colors duration-150"
                    onClick={() => {
                      handleSalesAssociateChange(data);
                      setIsSalesDropdownOpen(false);
                    }}
                  >
                    {data[0]}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* <select
            className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-50 text-gray-700 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
            value={salesAssociateArray ? JSON.stringify(salesAssociateArray) : ""}
            onChange={(e) =>
              setSalesAssociateArray(e.target.value ? JSON.parse(e.target.value) : [])
            }
          >
            <option value="">Select Sales Associate (optional)</option>
            {Array.isArray(salesdata) && salesdata.length > 0 ? (
              salesdata.map((data, index) => (
                <option key={index} value={JSON.stringify(data)}>
                  {data[0] || "Unnamed Sales Associate"}
                </option>
              ))
            ) : (
              <option disabled>No sales associates available</option>
            )}
          </select> */}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row w-full gap-6">
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base font-medium text-gray-600">
            Select User
          </p>
          <input
            type="text"
            className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base font-medium text-gray-600">
            Project Deadline
          </p>
          <input
            type="date"
            className="border border-gray-200 p-3 !rounded-lg w-full text-sm sm:text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
            value={projectDate}
            onChange={(e) => setProjectDate(e.target.value)}
          />
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md transform transition-all duration-300 scale-100"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
              Add Interior
            </h2>

            <label className="text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="border border-gray-200 p-3 rounded-lg w-full mb-4 bg-gray-50 text-gray-700"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              className="border border-gray-200 p-3 rounded-lg w-full mb-4 bg-gray-50 text-gray-700"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="border border-gray-200 p-3 rounded-lg w-full mb-4 bg-gray-50 text-gray-700"
              placeholder="Phone Number"
              value={phonenumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <label className="text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="border border-gray-200 p-3 rounded-lg w-full mb-4 bg-gray-50 text-gray-700"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-5 py-2 bg-gray-600 text-white !rounded-lg hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white !rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {isSalesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSalesSubmit();
            }}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md transform transition-all duration-300 scale-100"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
              Add Sales Associate
            </h2>

            <label className="text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="border border-gray-200 p-3 rounded-lg w-full mb-4 bg-gray-50 text-gray-700"
              placeholder="Name"
              value={salesname}
              onChange={(e) => salesSetName(e.target.value)}
            />

            <label className="text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              className="border border-gray-200 p-3 rounded-lg w-full mb-4 bg-gray-50 text-gray-700"
              placeholder="Email"
              value={salesemail}
              onChange={(e) => salesSetEmail(e.target.value)}
            />

            <label className="text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="border border-gray-200 p-3 rounded-lg w-full mb-4 bg-gray-50 text-gray-700"
              placeholder="Phone Number"
              value={salesphonenumber}
              onChange={(e) => salesSetPhoneNumber(e.target.value)}
            />

            <label className="text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="border border-gray-200 p-3 rounded-lg w-full mb-4 bg-gray-50 text-gray-700"
              placeholder="Address"
              value={salesaddress}
              onChange={(e) => salesSetAddress(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-5 py-2 bg-gray-600 text-white !rounded-lg hover:bg-gray-700"
                onClick={() => setIsSalesOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white !rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditProjectDetails;
