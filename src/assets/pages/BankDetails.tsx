import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../Redux/store";
import { setBankData } from "../Redux/dataSlice";
import { Pencil, Trash2, PlusCircle, ArrowLeft } from "lucide-react";

const BankDetails = () => {
  const [bankDialog, setBankDialog] = useState(false);
  const [editBankData, setEditBankData] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    accountNumber: "",
    ifscCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const bankData = useSelector((state: RootState) => state.data.bankData);

  const fetchBankData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsBankData"
      );
      const data = await response.json();
      return data.body || [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendBankDetails = async () => {
    if (
      !formData.customerName ||
      !formData.accountNumber ||
      !formData.ifscCode
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);
      const date = new Date();
      const newDate = `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()}`;

      const url = editBankData
        ? "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintsBankData"
        : "https://sheeladecor.netlify.app/.netlify/functions/server/sendPaintsBankData";

      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: newDate,
        }),
      });

      if (response.ok) {
        const updatedBankData = await fetchBankData();
        localStorage.setItem(
          "bankData",
          JSON.stringify({
            data: updatedBankData,
            time: Date.now(),
          })
        );
        dispatch(setBankData(updatedBankData));
        resetForm();
        alert(editBankData ? "Bank Details Updated" : "New Bank Details Added");
      } else {
        throw new Error("Failed to save bank details");
      }
    } catch (error) {
      alert(error.message || "Error saving bank details");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBankData = async (customerName: string) => {
    if (!confirm("Are you sure you want to delete this bank record?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintsBankData",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ customerName }),
        }
      );

      if (response.ok) {
        const updatedBankData = await fetchBankData();
        localStorage.setItem(
          "bankData",
          JSON.stringify({
            data: updatedBankData,
            time: Date.now(),
          })
        );
        dispatch(setBankData(updatedBankData));
        alert("Bank record deleted successfully");
      } else {
        throw new Error("Failed to delete bank record");
      }
    } catch (error) {
      alert(error.message || "Error deleting bank data");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      accountNumber: "",
      ifscCode: "",
    });
    setEditBankData(false);
    setBankDialog(false);
  };

  const handleEdit = (data: any) => {
    setFormData({
      customerName: data[0],
      accountNumber: data[1],
      ifscCode: data[2],
    });
    setEditBankData(true);
    setBankDialog(true);
  };

  useEffect(() => {
    const fetchAndCacheBankData = async () => {
      const now = Date.now();
      const cached = localStorage.getItem("bankData");

      if (cached) {
        const parsed = JSON.parse(cached);
        const timeDiff = now - parsed.time;
        if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
          dispatch(setBankData(parsed.data));
          return;
        }
      }

      const data = await fetchBankData();
      dispatch(setBankData(data));
      localStorage.setItem("bankData", JSON.stringify({ data, time: now }));
    };

    fetchAndCacheBankData();
  }, [dispatch]);

  return (
    <div className="w-full  p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mt-5 md:!mt-2 mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Bank Details</h2>
            <p className="text-gray-600">
              Manage your bank account information
            </p>
          </div>

          {!bankDialog && (
            <button
              onClick={() => setBankDialog(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 !rounded-lg shadow transition-colors"
              disabled={isLoading}
            >
              <PlusCircle size={18} />
              Add New Bank
            </button>
          )}
        </div>

        {/* Main Content */}
        {bankDialog ? (
          <div className="bg-white !rounded-xl shadow-md p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <button
                onClick={resetForm}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-xl font-semibold text-gray-800">
                {editBankData ? "Edit Bank Details" : "Add New Bank Details"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  placeholder="Enter Account Name"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 !rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="Enter account number"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 !rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  placeholder="Enter IFSC code"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 !rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 !rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={sendBankDetails}
                className="px-4 py-2 bg-blue-600 text-white !rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-spin">↻</span>
                ) : (
                  <span>{editBankData ? "Update" : "Save"}</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white !rounded-xl shadow-md overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin !rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading bank details...</p>
              </div>
            ) : bankData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IFSC Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(bankData) && bankData.length > 0 ? (
                      bankData.map((data, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {data?.[0] || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data?.[1] || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data?.[2] || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data?.[3] || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => handleEdit(data)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => deleteBankData(data?.[0])}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No bank records available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No bank details found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first bank account.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setBankDialog(true)}
                    className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 !!rounded-xl shadow"
                  >
                    <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                    Add Bank Account
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankDetails;
