import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../Redux/store";
import { setTermsData } from "../Redux/dataSlice";
import { Trash2, PlusCircle } from "lucide-react";

const TermsAndConditions = () => {
  const [terms, setTerms] = useState("");
  const [termsDialog, setTermsDialog] = useState(false);

  const dispatch = useDispatch();
  const termsData = useSelector((state: RootState) => state.data.termsData);

  const fetchTermsData = async () => {
    const response = await fetch(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsTermsData"
    );
    const data = await response.json();
    return data.body || [];
  };

  const sendTermDetails = async () => {
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
      alert("New Terms & Conditions Added");
      const updatedTermsData = await fetchTermsData();
      localStorage.setItem(
        "termData",
        JSON.stringify({ data: updatedTermsData, time: Date.now() })
      );
      dispatch(setTermsData(updatedTermsData));
      setTerms("");
      setTermsDialog(false);
    } else {
      alert("Error adding terms");
    }
  };

  const deleteTermsData = async (terms: string) => {
    const response = await fetch(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintsTermsData",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ terms }),
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
      alert("Error deleting terms");
    }
  };

  useEffect(() => {
    const fetchAndCacheTermData = async () => {
      const now = Date.now();
      const cached = localStorage.getItem("termData");

      if (cached) {
        const parsed = JSON.parse(cached);
        const timeDiff = now - parsed.time;

        if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
          dispatch(setTermsData(parsed.data));
          return;
        }
      }

      const data = await fetchTermsData();
      dispatch(setTermsData(data));
      localStorage.setItem("termData", JSON.stringify({ data, time: now }));
    };

    fetchAndCacheTermData();
  }, [dispatch]);

  return (
    <div className="w-full mt-5 md:!mt-2 p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
          Terms & Conditions
        </h2>
        {!termsDialog && (
          <button
            onClick={() => setTermsDialog(true)}
            className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 !rounded-xl shadow"
          >
            <PlusCircle size={18} />
            Add New
          </button>
        )}
      </div>

      {!termsDialog && (
        <div className="overflow-x-auto border rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">Sr. No</th>
                <th className="px-4 py-3">Terms & Conditions</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(termsData) && termsData.length > 0 ? (
                termsData.map((data, index) => (
                  <tr key={index} className="hover:bg-sky-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 max-w-[600px] break-words">
                      {data?.[0] || "No Term Provided"}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => deleteTermsData(data?.[0])}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-center text-gray-500"
                  >
                    No terms available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {termsDialog && (
        <div className="mt-4 max-w-2xl border rounded-xl p-4 shadow-lg bg-white space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Add Terms & Conditions
          </h3>
          <textarea
            placeholder="Write terms & conditions..."
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={5}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={sendTermDetails}
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTerms("");
                setTermsDialog(false);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsAndConditions;
