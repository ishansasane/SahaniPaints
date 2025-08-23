import { useState, useEffect } from "react";
import Card from "./CardPage";
import DeadlineCard from "../compoonents/DeadlineCard.tsx";
import TaskCard from "../compoonents/TaskCard.tsx";
import InquiryCard from "../compoonents/InquiryCard.tsx";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store.ts";
import {
  setTasks,
  setProjects,
  setPaymentData,
  setProjectFlag,
  setInquiryData,
} from "../Redux/dataSlice.ts";
import TaskDialog from "../compoonents/TaskDialog.tsx";
import { AnimatePresence, motion } from "framer-motion";
import EditProjects from "./EditProjects.tsx";
import { useNavigate } from "react-router-dom";
import BankDetails from "./BankDetails.tsx";
import { fetchWithLoading } from "../Redux/fetchWithLoading.ts";

const fetchTaskData = async () => {
  const response = await fetchWithLoading(
    "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintstasks"
  );
  const data = await response.json();
  if (data.body) {
    return data.body;
  } else {
    return [];
  }
};

const fetchInquiryData = async () => {
  const response = await fetchWithLoading(
    "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsInquiry"
  );
  const data = await response.json();
  if (data.body) {
    return data.body;
  } else {
    return [];
  }
};

const Dashboard: React.FC = () => {
  const [isTaskDialogOpen, setTaskDialogOpen] = useState<boolean>(false);
  const [isInquiryFormOpen, setInquiryFormOpen] = useState<boolean>(false);
  const [isInquiryDialogOpen, setInquiryDialogOpen] = useState<boolean>(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({
    project: "",
    comments: "",
    inquiryDate: "",
    followUpDate: "",
    customer: "",
    phonenumber: "",
  });

  const sendInquiry = async () => {
    const projectName = inquiryForm.project.trim();
    const comment = inquiryForm.comments;
    const inquiryDate = inquiryForm.inquiryDate;
    const followUpDate = inquiryForm.followUpDate;
    const customer = inquiryForm.customer.trim();
    const phonenumber = inquiryForm.phonenumber.trim();

    if (!projectName || !customer || !phonenumber || !inquiryDate) {
      alert(
        "Please fill in project name, customer name, phone number, and inquiry date."
      );
      return;
    }

    const isDuplicate = inquiries.some(
      (inquiry) => inquiry[0]?.toLowerCase() === projectName.toLowerCase()
    );

    if (isDuplicate) {
      alert("An inquiry for this project name already exists.");
      return;
    }

    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendPaintsInquiry",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          phonenumber,
          comment,
          inquiryDate,
          projectDate: followUpDate,
          status: "New Inquiry",
          customer,
        }),
      }
    );

    if (response.status === 200) {
      alert("Inquiry Added");
      setInquiryForm({
        project: "",
        comments: "",
        inquiryDate: "",
        followUpDate: "",
        customer: "",
        phonenumber: "",
      });

      const data = await fetchInquiryData();
      dispatch(setInquiryData(data));
      setInquiryFormOpen(false);
    } else {
      alert("Error in adding inquiry");
    }
  };

  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.data.tasks);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const projects = useSelector((state: RootState) => state.data.projects);
  const paymentData = useSelector((state: RootState) => state.data.paymentData);
  const projectsData = useSelector((state: RootState) => state.data.projects);
  const inquiries = useSelector((state: RootState) => state.data.inquiry);
  const [Amount, setAmount] = useState(0);
  const [Tax, setTax] = useState(0);
  const [projectDiscount, setProjectDiscount] = useState(0);

  const navigate = useNavigate();

  const [index, setIndex] = useState(null);
  const [flag, setFlag] = useState(false);
  const [sendProject, setSendProject] = useState([]);

  const [totalPayment, setTotalPayment] = useState(0);
  const [Discount, setDiscount] = useState(0);

  const [selectedTask, setSelectedTask] = useState([]);

  const [refresh, setRefresh] = useState(true);

  const deleteTask = async (name: string) => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintstask",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ title: name }),
        }
      );

      if (response.status === 200) {
        alert("Task deleted");

        const updatedTasks = await fetchTaskData();
        const sortedTasks = updatedTasks.sort(
          (a, b) => new Date(a[2]).getTime() - new Date(b[2]).getTime()
        );
        dispatch(setTasks(sortedTasks));

        localStorage.setItem(
          "taskData",
          JSON.stringify({ data: sortedTasks, time: Date.now() })
        );

        setSelectedTask(null);

        setRefresh((prev) => !prev);
      } else {
        alert("Error deleting task");
      }
      setTaskDialogOpen(false);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Something went wrong while deleting the task.");
    }
  };

  useEffect(() => {
    const fetchAndCacheInquiries = async () => {
      try {
        if (inquiries.length != 0) {
          if (Array.isArray(inquiries)) {
            return;
          }
        }

        const data = await fetchInquiryData();
        if (Array.isArray(data)) {
          dispatch(setInquiryData(data));
        } else {
          console.error("Invalid inquiry data format:", data);
        }
      } catch (err) {
        console.error("Failed to fetch inquiries:", err);
      }
    };

    fetchAndCacheInquiries();
  }, [dispatch]);

  const [taskDialogOpen, setTaskDialog] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (tasks.length != 0) {
          const filtered = tasks.filter((task) => task[7] !== "Completed");
          setFilteredTasks(filtered);
          return;
        }

        const taskRes = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintstasks",
          {
            credentials: "include",
          }
        );

        if (!taskRes.ok) {
          throw new Error(`HTTP error! Status: ${taskRes.status}`);
        }

        const taskData = await taskRes.json();
        const tasksList = Array.isArray(taskData.body) ? taskData.body : [];

        const filtered = tasksList.filter((task) => task[7] !== "Completed");
        dispatch(setTasks(tasksList));
        setFilteredTasks(filtered);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [dispatch, taskDialogOpen, refresh, tasks]);

  const fetchProjectData = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsprojectdata",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data.body)) {
        throw new Error("Invalid data format: Expected an array in data.body");
      }

      const parseSafely = (value: any, fallback: any) => {
        if (value == null || value === "") return fallback;
        if (typeof value !== "string") return value || fallback;
        try {
          return JSON.parse(value);
        } catch (error) {
          console.warn("Invalid JSON:", value, error);
          return fallback;
        }
      };

      const deepClone = (obj: any) => {
        try {
          return JSON.parse(JSON.stringify(obj));
        } catch {
          return [];
        }
      };

      const fixBrokenArray = (input: any): string[] => {
        if (Array.isArray(input)) return input;
        if (typeof input !== "string" || input === "") return [];

        try {
          const fixed = JSON.parse(input);
          if (Array.isArray(fixed)) return fixed;
          return [];
        } catch {
          try {
            const cleaned = input
              .replace(/^\[|\]$/g, "")
              .split(",")
              .map((item: string) => item.trim().replace(/^"+|"+$/g, ""));
            return cleaned.filter((item) => item);
          } catch {
            return [];
          }
        }
      };

      const projects = data.body
        .map((row: any[], rowIndex: number) => {
          try {
            return {
              projectName: row[0] || "",
              customerLink: parseSafely(row[1], []),
              projectReference: row[2] || "",
              status: row[3] || "",
              totalAmount: parseFloat(row[4]) || 0,
              totalTax: parseFloat(row[5]) || 0,
              paid: parseFloat(row[6]) || 0,
              discount: parseFloat(row[7]) || 0,
              createdBy: row[8] || "",
              allData: deepClone(parseSafely(row[9], [])),
              projectDate: row[10] || "",
              additionalRequests: parseSafely(row[11], []),
              interiorArray: fixBrokenArray(row[12]),
              salesAssociateArray: fixBrokenArray(row[13]),
              additionalItems: deepClone(parseSafely(row[14], [])),
              goodsArray: deepClone(parseSafely(row[15], [])),
              tailorsArray: deepClone(parseSafely(row[16], [])),
              projectAddress: row[17] || "",
              date: row[18] || "",
              grandTotal: row[19],
              discountType: row[20],
              bankDetails: deepClone(parseSafely(row[21], [])),
              termsConditions: deepClone(parseSafely(row[22], [])),
              defaulter: deepClone(row[23]),
            };
          } catch (error) {
            console.error(
              `Error processing project row ${rowIndex}:`,
              row,
              error
            );
            return null;
          }
        })
        .filter((project) => project !== null);

      return projects;
    } catch (error) {
      console.error("Error fetching project data:", error);
      return [];
    }
  };

  const fetchPaymentData = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsPayments"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data.message) ? data.message : [];
    } catch (error) {
      console.error("Error fetching payment data:", error);
      return [];
    }
  };

  const [received, setReceived] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let fetchedProjects = [];

        if (projectsData.length == 0) {
          fetchedProjects = await fetchProjectData();
          dispatch(setProjects(fetchedProjects));
        } else {
          fetchedProjects = projectsData;
        }

        // Step 2: Calculate totals (only for non-defaulters)
        let totalAmount = 0;
        let discount = 0;
        fetchedProjects.forEach((project) => {
          if (project.defaulter === "FALSE") {
            totalAmount += parseFloat(project.grandTotal) || 0;
          }
        });

        setTotalPayment(totalAmount);
        setDiscount(discount);

        // Step 3: Build valid project names
        const validProjectNames = new Set(
          fetchedProjects
            .filter((project) => project.defaulter === "FALSE")
            .map((project) => project.projectName)
        );
        let fetchedPayments = [];
        // Step 4: Fetch payments
        if (paymentData.length == 0) {
          fetchedPayments = await fetchPaymentData();
        } else {
          fetchedPayments = paymentData;
        }
        const paymentDataToUse = Array.isArray(fetchedPayments)
          ? fetchedPayments
          : [];

        // Step 5: Calculate total received
        const totalReceived = paymentDataToUse.reduce((acc, payment) => {
          const projectName = payment?.[1];
          const amount = parseFloat(payment?.[2]);
          return validProjectNames.has(projectName)
            ? acc + (isNaN(amount) ? 0 : amount)
            : acc;
        }, 0);

        setReceived(totalReceived);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch, paymentData, projectsData]);

  const handleMarkAsCompleted = async (status, name) => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintstask",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: name,
            status,
          }),
        }
      );

      if (response.status === 200) {
        alert("Task marked as completed");

        const updatedTasks = await fetchTaskData();
        const sortedTasks = updatedTasks.sort(
          (a, b) => new Date(a[2]).getTime() - new Date(b[2]).getTime()
        );

        dispatch(setTasks(sortedTasks));

        localStorage.setItem(
          "taskData",
          JSON.stringify({ data: sortedTasks, time: Date.now() })
        );
      } else {
        alert("Error updating task");
      }

      setTaskDialogOpen(false);
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error marking task as completed:", error);
      alert("Something went wrong while updating the task.");
    }
  };

  const [editing, setediting] = useState(null);
  const [newrefresh, setrefresh] = useState(false);

  const openProject = (selectedTask) => {
    const name = selectedTask[5];

    const index = projects.findIndex((project) => project.projectName === name);

    setIndex(index);

    if (index !== -1) {
      const matchedProject = projects[index];

      setSendProject(matchedProject);
      setTax(matchedProject.totalTax || 0);
      setAmount(matchedProject.totalAmount || 0);
      setProjectDiscount(matchedProject.discount || 0);
      setTaskDialogOpen(false);
      setFlag(true);
    } else {
      console.warn("No matching project found for:", name);
    }
  };

  const handleInquirySubmit = async () => {
    const projectName = inquiryForm.project;
    const customerName = inquiryForm.customer;
    const comment = inquiryForm.comments;
    const phonenumber = inquiryForm.phonenumber;
    const inquiryDate = inquiryForm.inquiryDate;
    const followUpDate = inquiryForm.followUpDate;

    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendPaintsInquiry",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          phonenumber,
          comment,
          inquiryDate,
          projectDate: followUpDate,
          customer: customerName,
          status: "New Inquiry",
        }),
      }
    );

    if (response.status == 200) {
      const data = await fetchInquiryData();
      dispatch(setInquiryData(data));
      alert("Inquiry Added");
      setInquiryDialogOpen(false);
      setInquiryForm({
        project: "",
        comments: "",
        inquiryDate: "",
        followUpDate: "",
        customer: "",
        phonenumber: "",
      });
    } else {
      alert("Error in Adding Inquiry");
    }
  };

  const handleDeleteInquiry = async (projectName) => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintsInquiry",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ projectName }),
      }
    );

    if (response.status === 200) {
      const data = await fetchInquiryData();
      dispatch(setInquiryData(data));
      alert("Inquiry Deleted");
      setInquiryDialogOpen(false);
    } else {
      alert("Error");
    }
  };

  const handleMarkAsApproved = async (projectName, status) => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintsInquiry",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ projectName, status }),
      }
    );

    if (response.status === 200) {
      const data = await fetchInquiryData();
      dispatch(setInquiryData(data));
      alert("Status changed");
      setInquiryDialogOpen(false);
      navigate("/add-project");
    } else {
      alert("Error");
    }
  };

  const [discountType, setDiscountType] = useState(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isInquiryFormOpen) {
        sendInquiry();
      }
    }
  };

  const handleStatusChange = async (projectName, status) => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintsInquiry",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ projectName, status }),
      }
    );

    if (response.status === 200) {
      const data = await fetchInquiryData();
      dispatch(setInquiryData(data));
      alert("Status changed");
      setInquiryDialogOpen(false);
      if (status == "Convert to Project") {
        navigate("/add-project");
      }
    } else {
      alert("Error");
    }
  };

  return (
    <div className="pt-6 pb-6 md:p-6 md:mt-0 mt-20 bg-gray-100 min-h-screen">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 ${
          flag ? "hidden" : ""
        }`}
      >
        <div className="flex" onClick={() => navigate("/projects")}>
          <Card
            title="Orders"
            value={projects.length}
            color="bg-blue-500"
            className="w-full max-w-sm"
          />
        </div>
        <Card
          title="Total Value"
          value={Math.round(totalPayment)}
          color="bg-purple-500"
          isCurrency
        />
        <div className="flex" onClick={() => navigate("/paymentsPage")}>
          <Card
            title="Payment Received"
            value={Math.round(received)}
            color="bg-green-500"
            isCurrency
          />
        </div>
        <div className="flex" onClick={() => navigate("/duePage")}>
          <Card
            title="Payment Due"
            value={Math.round(totalPayment - received)}
            color="bg-red-500"
            isCurrency
          />
        </div>
      </div>
      <div
        className={`${
          flag ? "hidden" : ""
        } grid grid-cols-1 lg:grid-cols-3 gap-2 mt-2`}
      >
        <div className="bg-white shadow-md !rounded-xl p-6">
          <p
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="md:text-[1.7vw] font-semibold mb-4 text-gray-800"
          >
            Project Deadlines
          </p>
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
            {projects &&
              projects.map((project, index) => (
                <div key={index}>
                  <DeadlineCard
                    setFlag={setFlag}
                    setTax={setTax}
                    setProjectDiscount={setProjectDiscount}
                    setAmount={setAmount}
                    setSendProject={setSendProject}
                    index={index}
                    setIndex={setIndex}
                    project={project}
                    projectName={project.projectName}
                    date={project.projectDate}
                    discountType={discountType}
                    setDiscountType={setDiscountType}
                    clickFunction={() => {
                      setSendProject(project);
                      setIndex(index);
                      setTax(project.totalTax);
                      setAmount(project.totalAmount);
                      setProjectDiscount(project.discount);
                      setDiscountType(project.discountType);
                      setFlag(true);
                    }}
                    clickInverseFunction={() => {
                      setSendProject(project);
                      setIndex(index);
                      setTax(project.totalTax);
                      setAmount(project.totalAmount);
                      setProjectDiscount(project.discount);
                      setDiscountType(project.discountType);
                      setFlag(false);
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
        <div className="bg-white shadow-md !rounded-xl p-3 col-span-2 pr-2">
          <div className="flex flex-row w-full justify-between items-center mb-4">
            <Link to="/tasks" className="!no-underline">
              <p
                style={{ fontFamily: "Poppins, sans-serif" }}
                className="md:text-[1.7vw] font-semibold mb-4 text-gray-800"
              >
                Tasks
              </p>
            </Link>
            <button
              onClick={() => setTaskDialog(true)}
              className="relative group mb-2 px-2 py-1.5 !text-sm text-white hover:bg-sky-700 !rounded-lg shadow-sm bg-sky-600"
            >
              <div className="relative flex items-center justify-center space-x-2">
                <span className="tracking-wide">Add Task</span>
              </div>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[650px] pr-2">
            {filteredTasks &&
              filteredTasks.map((task, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedTask(task);
                    setTaskDialogOpen(true);
                  }}
                >
                  <TaskCard taskData={task} />
                </div>
              ))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {taskDialogOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTaskDialog(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <TaskDialog
                onClose={() => setTaskDialog(false)}
                projectData={projects}
                setTaskDialogOpen={setTaskDialog}
                taskDialogOpen={taskDialogOpen}
                setProjectFlag={setProjectFlag}
                dashboard={true}
                setediting={setediting}
                setrefresh={setRefresh}
                refresh={refresh}
              />
            </motion.div>
          </>
        )}
        {isInquiryFormOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInquiryFormOpen(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white !rounded-lg shadow-md p-6 w-full max-w-md relative border border-gray-200">
                <button
                  onClick={() => setInquiryFormOpen(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
                <h2 className="relative !text-sm font-bold mb-6 text-gray-800 after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-1 after:bg-blue-500 after:!rounded-full">
                  Add Inquiry
                </h2>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-4"
                  onKeyDown={handleKeyDown}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={inquiryForm.project}
                      onChange={(e) =>
                        setInquiryForm({
                          ...inquiryForm,
                          project: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 !rounded-md px-3 py-2 text-sm"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={inquiryForm.customer}
                      onChange={(e) =>
                        setInquiryForm({
                          ...inquiryForm,
                          customer: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 !rounded-md px-3 py-2 text-sm"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={inquiryForm.phonenumber}
                      onChange={(e) =>
                        setInquiryForm({
                          ...inquiryForm,
                          phonenumber: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 !rounded-md px-3 py-2 text-sm"
                      placeholder="Enter Phone Number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Comments
                    </label>
                    <textarea
                      value={inquiryForm.comments}
                      onChange={(e) =>
                        setInquiryForm({
                          ...inquiryForm,
                          comments: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 !rounded-md px-3 py-2 text-sm"
                      placeholder="Enter comments"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Inquiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={inquiryForm.inquiryDate}
                      onChange={(e) =>
                        setInquiryForm({
                          ...inquiryForm,
                          inquiryDate: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 !rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Follow-Up Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={inquiryForm.followUpDate}
                      onChange={(e) =>
                        setInquiryForm({
                          ...inquiryForm,
                          followUpDate: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 !rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setInquiryForm({
                          project: "",
                          comments: "",
                          inquiryDate: "",
                          followUpDate: "",
                          customer: "",
                          phonenumber: "",
                        });
                        setInquiryFormOpen(false);
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 !rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleInquirySubmit}
                      type="submit"
                      className="bg-sky-600 text-white px-4 py-2 !rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
        {isInquiryDialogOpen && selectedInquiry && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white !rounded-lg shadow-md p-6 w-full max-w-md relative border border-gray-200">
              <button
                onClick={() => setInquiryDialogOpen(false)}
                className="absolute top-3 право-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                {" "}
                {selectedInquiry[0]}
              </h2>
              <div className="space-y-3 p-3 text-gray-700 text-sm">
                <p className="flex justify-between">
                  <strong>Status:</strong>
                  <span
                    className={`inline-block px-2 py-1 !rounded text-white ${
                      selectedInquiry[5] == "approved"
                        ? "bg-green-500"
                        : selectedInquiry[5] === "New Inquiry"
                        ? "bg-blue-500"
                        : selectedInquiry[5] === "In Progress"
                        ? "bg-yellow-500"
                        : selectedInquiry[5] === "Convert to Project"
                        ? "bg-purple-500"
                        : selectedInquiry[5] == "Not Intrested"
                        ? "bg-red-500"
                        : "bg-black"
                    }`}
                  >
                    {selectedInquiry[5]}
                  </span>
                </p>
                <hr />
                <p className="flex justify-between">
                  <strong>Customer:</strong> {selectedInquiry[6]}
                </p>
                <hr />
                <p className="flex justify-between">
                  <strong>Phone Number:</strong> {selectedInquiry[1]}
                </p>
                <hr />
                <p className="flex justify-between">
                  <strong>Comments:</strong> {selectedInquiry[3]}
                </p>
                <hr />
                <p className="flex justify-between">
                  <strong>Inquiry Date:</strong> {selectedInquiry[3]}
                </p>
                <hr />
                <p className="flex justify-between">
                  <strong>Follow-Up Date:</strong> {selectedInquiry[4]}
                </p>
                <hr />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => handleDeleteInquiry(selectedInquiry[0])}
                  className="bg-white border !border-red-500 text-red-500 px-4 py-2 !rounded-lg hover:!bg-red-500 hover:!text-white transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() =>
                    handleMarkAsApproved(
                      selectedInquiry[0],
                      "Convert to Project"
                    )
                  }
                  className={`${
                    selectedInquiry[4] == "Convert to Project" ? "hidden" : ""
                  } flex items-center bg-gray-200 text-gray-700 px-4 py-2 !rounded-lg hover:bg-gray-300 transition-colors`}
                >
                  <span className="mr-2">✔</span> Mark As Approved
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
      <div
        className={`bg-white shadow-md !rounded-xl p-6 mt-2 ${
          flag ? "hidden" : ""
        }`}
      >
        <div className="flex justify-between items-center">
          <p
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="md:text-[1.7vw] font-semibold mb-4 text-gray-800"
          >
            Inquiries
          </p>
          <button
            style={{ borderRadius: "6px" }}
            className="mb-2 bg-sky-600 text-white hover:bg-sky-700 px-2 md:text-[1.7vw] py-1"
            onClick={() => setInquiryFormOpen(true)}
          >
            Add Inquiry
          </button>
        </div>
        <div className="flex flex-wrap gap-6 overflow-x-auto pb-4">
          {inquiries.map((inquiry, index) => (
            <div key={index}>
              <InquiryCard
                project={inquiry[0]}
                comments={inquiry[2]}
                inquiryDate={inquiry[3]}
                followUpDate={inquiry[4]}
                status={inquiry[5]}
                customer={inquiry[6]}
                inquiryData={inquiry}
                handlestatuschange={handleStatusChange}
                handleDeleteInquiry={handleDeleteInquiry}
                onCardClick={() => {
                  setSelectedInquiry(inquiry);
                  setInquiryDialogOpen(true);
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {isTaskDialogOpen && selectedTask && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white !rounded-lg shadow-md p-6 w-full max-w-md relative border border-gray-200">
            <button
              onClick={() => setTaskDialogOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              📝 {selectedTask[0]}
            </h2>
            <p className="text-sm text-gray-600 mb-4">By {selectedTask[4]}</p>
            <div className="space-y-3 p-3 text-gray-700 text-sm">
              <p className="flex justify-between">
                <strong>Priority :</strong>{" "}
                <span
                  className={`inline-block px-2 py-1 !rounded text-white ${
                    selectedTask[6].toLowerCase() === "high"
                      ? "bg-red-500"
                      : selectedTask[6].toLowerCase() === "moderate"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {selectedTask[6]}
                </span>
              </p>
              <hr />
              <p className="flex justify-between">
                <strong>Status :</strong>{" "}
                <span
                  className={`inline-block px-2 py-1 !rounded text-white ${
                    selectedTask[7].toLowerCase() === "completed"
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
                >
                  {selectedTask[7]}
                </span>
              </p>
              <hr />
              <p
                onClick={() => openProject(selectedTask)}
                className="flex justify-between"
              >
                <strong>Project :</strong>{" "}
                <span className="text-blue-600">{selectedTask[5]}</span>
              </p>
              <hr />
              <p className="flex justify-between">
                <strong>Assignee :</strong> {selectedTask[4]}
              </p>
              <hr />
              <p className="flex justify-between">
                <strong>Assigned by :</strong> {selectedTask[4]}
              </p>
              <hr />
              <p className="flex justify-between">
                <strong>Due date & time :</strong> {selectedTask[2]},{" "}
                {selectedTask[3]}
              </p>
              <hr />
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => deleteTask(selectedTask[0])}
                className="bg-white border !border-red-500 text-red-500 px-4 py-2 !rounded-lg hover:!bg-red-500 hover:!text-white transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() =>
                  handleMarkAsCompleted("Completed", selectedTask[0])
                }
                className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 !rounded-lg hover:bg-gray-300 transition-colors"
              >
                <span className="mr-2">✔</span> Mark As Completed
              </button>
            </div>
          </div>
        </div>
      )}
      {flag && (
        <EditProjects
          projectData={sendProject}
          index={index}
          goBack={() => {
            setFlag(false);
            dispatch(setProjectFlag(false));
          }}
          tasks={tasks}
          projects={projects}
          Tax={Tax}
          setTax={setTax}
          Amount={Amount}
          setAmount={setAmount}
          Discount={projectDiscount}
          setDiscount={setProjectDiscount}
          setDiscountType={setDiscountType}
          discountType={discountType}
        />
      )}
    </div>
  );
};
export default Dashboard;
