import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const InquiryCard = ({
  project,
  comments,
  inquiryDate,
  followUpDate,
  status,
  handlestatuschange,
  handleDeleteInquiry,
  onCardClick,
  customer,
  inquiryData
}) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [previousStatus, setPreviousStatus] = useState(status);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus === "Not Interested") {
      setPreviousStatus(status);
      setShowDeletePopup(true);
    } else {
      handlestatuschange(project, newStatus);
    }
  };

  const confirmDelete = () => {
    handleDeleteInquiry(project);
    setShowDeletePopup(false);
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    handlestatuschange(project, previousStatus);
  };
  return (
    <>
      <div
        className="max-w-sm w-full bg-gray-50 border border-gray-300 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 p-4 cursor-pointer"
        onClick={onCardClick}
      >
        <div className="space-y-1">
          <h3 className="!text-lg font-bold text-indigo-700 truncate">{project}</h3>
          <p className="!text-sm text-blue-600 font-medium truncate">{customer}</p>
          <p className="!text-sm text-blue-600 font-medium truncate">{inquiryData[1]}</p>
          <p className="text-sm text-gray-500 line-clamp-2">{comments}</p>
        </div>

        <div className="mt-3 space-y-1 text-xs text-gray-700">
          <p>
            Inquiry: <span className="text-teal-600">{inquiryDate}</span>
          </p>
          <p>
            Follow-up: <span className="text-teal-600">{followUpDate}</span>
          </p>
        </div>

        <div className="mt-3">
          <select
            value={status}
            onClick={(e) => e.stopPropagation()}
            onChange={handleStatusChange}
            className="w-full bg-white border border-gray-300 text-sm text-gray-900 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 hover:bg-teal-50 transition-colors duration-200"
          >
            <option value="New Inquiry" className="text-blue-600">
              New Inquiry
            </option>
            <option value="In Progress" className="text-amber-600">
              In Progress
            </option>
            <option value="Convert to Project" className="text-green-600">
              Convert to Project
            </option>
            <option value="Not Interested" className="text-red-600">
              Not Interested
            </option>
          </select>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <AnimatePresence>
        {showDeletePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Do You Want To Delete?
              </h3>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  No
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InquiryCard;