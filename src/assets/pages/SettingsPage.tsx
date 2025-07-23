import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../Redux/store";
import { setTermsData, setBankData } from "../Redux/dataSlice";
import { Trash2, PlusCircle, Pencil, ArrowLeft } from "lucide-react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<"terms" | "bank">("terms");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const dispatch = useDispatch();

  // Fetch data functions
  const fetchTermsData = async () => {
    const response = await fetch(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsTermsData"
    );
    const data = await response.json();
    return data.body || [];
  };

  const fetchBankData = async () => {
    const response = await fetch(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getBankDetails"
    );
    const data = await response.json();
    return data.body || [];
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const now = Date.now();

        // Check and load terms data
        const cachedTerms = localStorage.getItem("termData");
        if (cachedTerms) {
          const parsed = JSON.parse(cachedTerms);
          if (now - parsed.time < 5 * 60 * 1000 && parsed.data.length > 0) {
            dispatch(setTermsData(parsed.data));
          } else {
            const termsData = await fetchTermsData();
            dispatch(setTermsData(termsData));
            localStorage.setItem(
              "termData",
              JSON.stringify({ data: termsData, time: now })
            );
          }
        } else {
          const termsData = await fetchTermsData();
          dispatch(setTermsData(termsData));
          localStorage.setItem(
            "termData",
            JSON.stringify({ data: termsData, time: now })
          );
        }

        // Check and load bank data
        const cachedBank = localStorage.getItem("bankData");
        if (cachedBank) {
          const parsed = JSON.parse(cachedBank);
          if (now - parsed.time < 5 * 60 * 1000 && parsed.data.length > 0) {
            dispatch(setBankData(parsed.data));
          } else {
            const bankData = await fetchBankData();
            dispatch(setBankData(bankData));
            localStorage.setItem(
              "bankData",
              JSON.stringify({ data: bankData, time: now })
            );
          }
        } else {
          const bankData = await fetchBankData();
          dispatch(setBankData(bankData));
          localStorage.setItem(
            "bankData",
            JSON.stringify({ data: bankData, time: now })
          );
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadData();
  }, [dispatch]);

  const TabNavigation = () => (
    <div className="flex border-b border-gray-200">
      <button
        onClick={() => setActiveTab("terms")}
        className={`px-6 py-3 font-medium text-sm ${
          activeTab === "terms"
            ? "border-b-2 border-blue-500 text-blue-600"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
      >
        Terms & Conditions
      </button>
      <button
        onClick={() => setActiveTab("bank")}
        className={`px-6 py-3 font-medium text-sm ${
          activeTab === "bank"
            ? "border-b-2 border-blue-500 text-blue-600"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
      >
        Bank Details
      </button>
    </div>
  );

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin !rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
        <div className="bg-white !rounded-lg shadow overflow-hidden">
          <TabNavigation />
          <div className="p-6">
            {activeTab === "terms" ? <TermsSection /> : <BankSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

const TermsSection = () => {
  const [terms, setTerms] = useState("");
  const [termsDialog, setTermsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const termsData = useSelector((state: RootState) => state.data.termsData);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (termsDialog && e.key === "Enter") {
        e.preventDefault();
        sendTermDetails();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [termsDialog, terms]);

  const fetchTermsData = async () => {
    const response = await fetch(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsTermsData"
    );
    const data = await response.json();
    return data.body || [];
  };

  const sendTermDetails = async () => {
    if (!terms.trim()) {
      alert("Please enter terms & conditions");
      return;
    }

    setIsLoading(true);
    try {
      const date = new Date();
      const newdate = `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()}`;

      const response = await fetch(
        "https://sheeladecor.netlify.app/.netlify/functions/server/sendPaintsTermsData",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ terms, date: newdate }),
        }
      );

      if (response.ok) {
        const updatedTermsData = await fetchTermsData();
        localStorage.setItem(
          "termData",
          JSON.stringify({ data: updatedTermsData, time: Date.now() })
        );
        dispatch(setTermsData(updatedTermsData));
        setTerms("");
        setTermsDialog(false);
        alert("New Terms & Conditions Added");
      } else {
        throw new Error("Failed to add terms");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePaintsTermsData = async (termsText: string) => {
    if (!confirm("Are you sure you want to delete these terms?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintsTermsData",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ terms: termsText }),
        }
      );

      if (response.ok) {
        const updatedTermsData = await fetchTermsData();
        localStorage.setItem(
          "termData",
          JSON.stringify({ data: updatedTermsData, time: Date.now() })
        );
        dispatch(setTermsData(updatedTermsData));
        alert("Terms & Conditions Deleted");
      } else {
        throw new Error("Failed to delete terms");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Terms & Conditions Management
        </h2>
        {!termsDialog && (
          <button
            onClick={() => setTermsDialog(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 !rounded-md shadow-sm"
            disabled={isLoading}
          >
            <PlusCircle size={18} />
            Add New
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin !rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !termsDialog ? (
        <div className="overflow-x-auto border !rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terms Content
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {termsData.length > 0 ? (
                termsData.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-prose">
                      {data[0]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deletePaintsTermsData(data[0])}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                        disabled={isLoading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No terms & conditions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white !rounded-lg shadow p-6 max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Add New Terms & Conditions
          </h3>
          <textarea
            placeholder="Enter terms & conditions here..."
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={8}
            className="w-full border border-gray-300 !rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setTerms("");
                setTermsDialog(false);
              }}
              className="px-4 py-2 border border-gray-300 !rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={sendTermDetails}
              className="px-4 py-2 bg-blue-600 text-white !rounded-md hover:bg-blue-700 flex items-center gap-2"
              disabled={isLoading || !terms.trim()}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Terms"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BankSection = () => {
  const [bankDialog, setBankDialog] = useState(false);
  const [editBankData, setEditBankData] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    accountName: "",
    branch: "",
    pincode: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const bankData = useSelector((state: RootState) => state.data.bankData);

  const fetchBankData = async () => {
    setIsLoading(true);
    try {
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
      !formData.bankName ||
      !formData.accountName ||
      !formData.branch ||
      !formData.pincode ||
      !formData.accountNumber ||
      !formData.ifscCode ||
      !formData.accountType
    ) {
      alert("Please fill all fields");
      return;
    }

    // 🆕 Safely check if bankData exists and is not empty
    const isDuplicate =
      !editBankData &&
      Array.isArray(bankData) &&
      bankData.length > 0 &&
      bankData.some(
        (item) =>
          item[0] === formData.bankName &&
          item[1] === formData.accountName &&
          item[2] === formData.accountNumber
      );

    if (isDuplicate) {
      alert(
        "Bank with the same Bank Name, Account Name and Account Number already exists."
      );
      return;
    }

    setIsLoading(true);
    try {
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
          JSON.stringify({ data: updatedBankData, time: Date.now() })
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

  const deletePaintsBankData = async (bankName, accountName) => {
    if (!confirm("Are you sure you want to delete this bank record?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintsBankData",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ bankName, accountName }),
        }
      );

      if (response.ok) {
        const updatedBankData = await fetchBankData();
        localStorage.setItem(
          "bankData",
          JSON.stringify({ data: updatedBankData, time: Date.now() })
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
      bankName: "",
      accountName: "",
      branch: "",
      pincode: "",
      accountNumber: "",
      ifscCode: "",
      accountType: "",
    });
    setEditBankData(false);
    setBankDialog(false);
  };

  const handleEdit = (data: any) => {
    setFormData({
      bankName: data[0],
      accountName: data[1],
      branch: data[2],
      pincode: data[3],
      accountNumber: data[4],
      ifscCode: data[5],
      accountType: data[6],
    });
    setEditBankData(true);
    setBankDialog(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (bankDialog && e.key === "Enter") {
        e.preventDefault();
        sendBankDetails();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bankDialog, formData]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Bank Account Management
        </h2>
        {!bankDialog && (
          <button
            onClick={() => setBankDialog(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 !rounded-md shadow-sm"
            disabled={isLoading}
          >
            <PlusCircle size={18} />
            Add New Bank
          </button>
        )}
      </div>

      {bankDialog ? (
        <div className="bg-white !rounded-lg shadow p-6 max-w-2xl mx-auto">
          <div className="flex items-center mb-4">
            <button
              onClick={resetForm}
              className="mr-2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <ArrowLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold text-gray-800">
              {editBankData ? "Edit Bank Details" : "Add New Bank Details"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name*
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 !rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Bank Name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name*
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 !rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Account Holder Name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch*
              </label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className="w-full border border-gray-300 !rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter branch"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode*
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full border border-gray-300 !rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter pincode"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number*
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 !rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter account number"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code*
              </label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                className="w-full border border-gray-300 !rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter IFSC code"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type*
              </label>
              <input
                type="text"
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 !rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Account Type"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 !rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={sendBankDetails}
              className="px-4 py-2 bg-blue-600 text-white !rounded-md hover:bg-blue-700 flex items-center gap-2"
              disabled={
                isLoading ||
                !formData.bankName ||
                !formData.accountName ||
                !formData.branch ||
                !formData.pincode ||
                !formData.accountNumber ||
                !formData.ifscCode ||
                !formData.accountType
              }
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {editBankData ? "Updating..." : "Saving..."}
                </>
              ) : editBankData ? (
                "Update Bank"
              ) : (
                "Add Bank"
              )}
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin !rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : bankData.length > 0 ? (
        <div className="overflow-x-auto border !rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Holder Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IFSC Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Type
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bankData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data[1]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data[2]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data[4]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data[5]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data[6]}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(data)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                        disabled={isLoading}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => deletePaintsBankData(data[0], data[1])}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                        disabled={isLoading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white !rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No bank details
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first bank account.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setBankDialog(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium !rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
              Add Bank Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
