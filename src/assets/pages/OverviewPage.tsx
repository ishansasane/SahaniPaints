import React, { useEffect, useState } from 'react';
import { setTaskDialogOpen, setProjectFlag } from '../Redux/dataSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TaskDialog from '../compoonents/TaskDialog';

const OverviewPage = ({
  addPayment,
  setAddPayment,
  interiorArray,
  salesAssociateArray,
  setNavState,
  projectData,
  status,
  setStatus,
  tasks,
  tailorsArray,
  setTailorsArray,
  goodsArray,
  setGoodsArray,
  projectDate,
  setPRojectDate,
  projects,
  paymentData
}) => {
  const dueAmount = projectData.totalAmount + projectData.totalTax - projectData.paid;
  const dispatch = useDispatch();
  const taskDialogOpen = useSelector((state) => state.data.taskDialogOpen);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [editing, setediting] = useState(null);

  const addNewTask = () => {
    dispatch(setTaskDialogOpen(true));
    navigate("/tasks");
  };

  const [pending, setPending] = useState(0);
  const [ordered, setOrdered] = useState(0);
  const [received, setReceived] = useState(0);
  const [instock, setInStock] = useState(0);
  const [tailorpending, setTailorPending] = useState(0);
  const [tailorordered, setTailorOrdered] = useState(0);
  const [tailorreceived, setTailorReceived] = useState(0);

  useEffect(() => {
    console.log(status)
  })

  useEffect(() => {
    let pendingCount = 0;
    let orderedCount = 0;
    let receivedCount = 0;
    let instockCount = 0;
    let tailorPendingCount = 0;
    let tailorOrderedCount = 0;
    let tailorReceivedCount = 0;

    goodsArray.forEach(item => {
      switch (item.status) {
        case "Pending":
          pendingCount++;
          break;
        case "Ordered":
          orderedCount++;
          break;
        case "Received":
          receivedCount++;
          break;
        case "In Stock":
          instockCount++;
          break;
        default:
          break;
      }
    });

    tailorsArray.forEach(tailor => {
      switch (tailor.status) {
        case "Pending":
          tailorPendingCount++;
          break;
        case "Ordered":
          tailorOrderedCount++;
          break;
        case "Received":
          tailorReceivedCount++;
          break;
        default:
          break;
      }
    });

    setPending(pendingCount);
    setOrdered(orderedCount);
    setReceived(receivedCount);
    setInStock(instockCount);
    setTailorPending(tailorPendingCount);
    setTailorOrdered(tailorOrderedCount);
    setTailorReceived(tailorReceivedCount);
  }, [goodsArray, tailorsArray]);

  const [paymentReceived, setPaymentReceived] = useState(0);

  useEffect(() => {
    if (!projectData?.projectName || !paymentData?.length) return;

    console.log(paymentData);

    const total = paymentData
      .filter(payment => payment[1] == projectData.projectName)
      .reduce((sum, payment) => {
        const amount = parseFloat(payment[2]);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    setPaymentReceived(total);
  }, [projectData.projectName, paymentData]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 !rounded-xl shadow-sm">
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Project: {projectData.projectName}</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Delivery Date:</label>
          <input
            className="border w-38 border-gray-300 !rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            type="date"
            value={projectDate}
            onChange={(e) => setPRojectDate(e.target.value)}
          />
        </div>
      </div>

      {/* Upper Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="flex flex-col bg-white p-6 !rounded-xl shadow-sm">
          <p className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Client Information</p>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 font-medium">Name</p>
              <p className="max-w-[60%] text-gray-800 break-words">{projectData.customerLink[0]}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-500 font-medium">Phone</p>
              <p className="max-w-[60%] text-gray-800 break-words">{projectData.customerLink[1]}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-500 font-medium">Alternate Phone</p>
              <p className="max-w-[60%] text-gray-800 break-words">{projectData.customerLink[4]}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-500 font-medium">Email</p>
              <p className="max-w-[60%] text-gray-800 break-words">{projectData.customerLink[2]}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-500 font-medium">Address</p>
              <p className="max-w-[60%] text-gray-800 break-words">{projectData.customerLink[3]}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-500 font-medium">Additional Requests</p>
              <p className="max-w-[60%] text-gray-800 break-words">{projectData.additionalRequests}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col bg-white p-6 !rounded-xl shadow-sm">
          <p className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Current Status</p>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <p className="text-sm font-medium text-gray-600">Delivery & Installation</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-300 !rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full sm:w-48"
            >
              <option value="Approved">Approved</option>
              <option value="Goods Pending">Goods Pending</option>
              <option value="Goods Complete">Goods Complete</option>
              <option value="Tailor Complete">Tailor Complete</option>
              <option value="Tailor Pending">Tailor Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-800">Goods Ordered</p>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <p className="text-xs font-medium text-yellow-700 bg-yellow-100 !rounded-full px-3 py-1">Pending: {pending}</p>
                  <p className="text-xs font-medium text-blue-700 bg-blue-100 !rounded-full px-3 py-1">Ordered: {ordered}</p>
                  <p className="text-xs font-medium text-green-700 bg-green-100 !rounded-full px-3 py-1">Received: {received}</p>
                  <p className="text-xs font-medium text-green-700 bg-green-100 !rounded-full px-3 py-1">In Stock: {instock}</p>
                </div>
                <button
                  onClick={() => setNavState("Goods")}
                  className="text-blue-600 border border-blue-600 !rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 transition w-full sm:w-auto"
                >
                  View
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-800">Goods Sent to Tailor</p>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <p className="text-xs font-medium text-yellow-700 bg-yellow-100 !rounded-full px-3 py-1">Pending: {tailorpending}</p>
                  <p className="text-xs font-medium text-blue-700 bg-blue-100 !rounded-full px-3 py-1">Ordered: {tailorordered}</p>
                  <p className="text-xs font-medium text-green-700 bg-green-100 !rounded-full px-3 py-1">Received: {tailorreceived}</p>
                </div>
                <button
                  onClick={() => setNavState("Tailors")}
                  className="text-blue-600 border border-blue-600 !rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 transition w-full sm:w-auto"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="flex flex-col bg-white p-6 !rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <p className="text-lg md:text-xl font-semibold text-gray-800">Payments</p>
            <div className="flex flex-wrap flex-row gap-3 mt-3 sm:mt-0">
              <button
                onClick={() => { setNavState("Payments"); setAddPayment(true)}}
                className="text-white bg-blue-600 !rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
                >
                Add
              </button>
              <button
                onClick={() => setNavState("Payments")}
                className="text-white bg-blue-600 !rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
                >
                View
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-row justify-between items-center border border-gray-200 !rounded-lg p-3 bg-gray-50">
              <div className="w-1 bg-gray-500 h-6 !rounded"></div>
              <p className="text-sm font-medium text-gray-800">Total Project Value</p>
              <p className="text-sm font-semibold text-gray-800">{Math.round((projectData.grandTotal)).toLocaleString("en-IN")}</p>
            </div>
            <div className="flex flex-row justify-between items-center border border-gray-200 !rounded-lg p-3 bg-gray-50">
              <div className="w-1 bg-green-500 h-6 !rounded"></div>
              <p className="text-sm font-medium text-gray-800">Payment Received</p>
              <p className="text-sm font-semibold text-gray-800">{paymentReceived.toLocaleString("en-IN")}</p>
            </div>
            <div className="flex flex-row justify-between items-center border border-gray-200 !rounded-lg p-3 bg-gray-50">
              <div className="w-1 bg-yellow-500 h-6 !rounded"></div>
              <p className="text-sm font-medium text-gray-800">Due</p>
              <p className="text-sm font-semibold text-gray-800">{Math.round((projectData.grandTotal - paymentReceived)).toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tailor Info */}
        <div className="flex flex-col bg-white p-6 !rounded-xl shadow-sm">
          <div className="flex flex-wrap flex-row justify-between items-center mb-6">
            <p className="text-lg md:text-xl font-semibold text-gray-800">Tailor Information</p>
            <button
              onClick={() => setNavState("Tailors")}
              className="text-white bg-blue-600 !rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
            >
              Assign
            </button>
          </div>
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto">
            {tailorsArray && tailorsArray.map((tailor, index) => (
              <div key={index} className="flex flex-col border border-gray-200 !rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-semibold text-blue-600">{tailor.tailorData[0]}</p>
                <p className="text-sm text-gray-600">{tailor.tailorData[1]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interior & Sales */}
        <div className="flex flex-col gap-6">
          {[{
            title: "Interior Information",
            data: interiorArray
          }, {
            title: "Sales Associate Information",
            data: salesAssociateArray
          }].map((section, idx) => (
            <div key={idx} className="flex flex-col bg-white p-6 !rounded-xl shadow-sm">
              <div className="flex flex-wrap flex-row justify-between items-center mb-4">
                <p className="text-lg md:text-xl font-semibold text-gray-800">{section.title}</p>
                <button
                  onClick={() => setNavState("Customer & Project Details")}
                  className="text-white bg-blue-600 !rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
                >
                  View
                </button>
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <p className="text-sm text-gray-800 max-w-[50%] break-words">{section.data[0]}</p>
                <p className="text-sm text-gray-800 max-w-[50%] break-words">{section.data[2]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div className="flex flex-col bg-white p-6 !rounded-xl shadow-sm">
          <div className="flex flex-wrap flex-row justify-between items-center mb-6">
            <p className="text-lg md:text-xl font-semibold text-gray-800">Tasks</p>
            <button
              onClick={addNewTask}
              className="text-white bg-blue-600 !rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
            >
              Create Task
            </button>
          </div>
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto">
            {tasks && tasks.filter(task => task[5] === projectData.projectName).map((task, index) => (
              <div key={index} className="border border-gray-200 !rounded-lg p-3 bg-gray-50 flex flex-col gap-3">
                <div className="flex flex-row justify-between gap-2">
                  <p className={`text-xs font-medium text-white !rounded-full px-3 py-1 ${
                    task[6] === "High" ? "bg-red-500" :
                    task[6] === "Low" ? "bg-green-500" :
                    task[6] === "Moderate" ? "bg-yellow-500" : ""
                  }`}>{task[6]}</p>
                  <p className={`text-xs font-medium text-white !rounded-full px-3 py-1 ${
                    task[7] === "To Do" ? "bg-red-500" :
                    task[7] === "Completed" ? "bg-green-500" :
                    task[7] === "In Progress" ? "bg-yellow-500" : ""
                  }`}>{task[7]}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">{task[0]}</p>
                <p className="text-xs text-gray-600">Created At: {task[3]}</p>
                <p className="text-xs text-gray-600">Description: {task[1]}</p>
                <button
                  onClick={() => { setediting(task); setDialogOpen(true); }}
                  className="border border-blue-600 text-blue-600 !rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 transition w-full sm:w-32"
                >
                  Edit Task
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Dialog Modal */}
      <AnimatePresence>
        {dialogOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(setTaskDialogOpen(false))}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full max-w-sm sm:max-w-lg bg-white !rounded-xl shadow-lg p-6">
                <TaskDialog
                  onClose={() => setDialogOpen(false)}
                  isEditing={editing}
                  setediting={setediting}
                  name={"NA"}
                  setrefresh={setRefresh}
                  projectData={projects}
                  setTaskDialogOpen={setTaskDialogOpen}
                  taskDialogOpen={dialogOpen}
                  setProjectFlag={setProjectFlag}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OverviewPage;