import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, MoreVertical } from "lucide-react";
import TaskDialog from "../compoonents/TaskDialog";
import {
  setTasks,
  setProjects,
  setProducts,
  setTaskDialogOpen,
  setProjectFlag,
} from "../Redux/dataSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface Task {
  task: string;
  description: string;
  date: string;
  assignee: string;
  priority: "High" | "Moderate" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  project: string;
}

const fetchTaskData = async () => {
  const response = await fetch(
    "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintstasks"
  );
  const data = await response.json();
  if (data.body) {
    return data.body;
  } else {
    return [];
  }
};

export default function Tasks() {
  const [tasks, settasks] = useState<Task[]>([]);
  const [projectData, setProjectData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [editing, setediting] = useState(null);
  const [deleted, setdeleted] = useState(false);
  const [refresh, setrefresh] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [filter, setFilter] = useState("All Tasks");

  const dispatch = useDispatch();
  const taskData = useSelector((state: RootState) => state.data.tasks);
  const projects = useSelector((state: RootState) => state.data.projects);
  const taskDialogOpen = useSelector(
    (state: RootState) => state.data.taskDialogOpen
  );

  const deleteTask = async (name: string) => {
    await fetchWithLoading(
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

    setdeleted(!deleted);
    setrefresh(true);
  };

  const fetchProjectData = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsprojectdata",
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      const projects = data.body.map((row, index) => {
        const parseSafely = (value, fallback) => {
          try {
            return value ? JSON.parse(value) : fallback;
          } catch {
            return fallback;
          }
        };

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
          allData: parseSafely(row[9], []),
          projectDate: row[10] || "",
          additionalRequests: row[11],
          interiorArray:
            typeof row[12] === "string"
              ? row[12]
                  .replace(/^"(.*)"$/, "$1")
                  .split(",")
                  .map((str) => str.trim())
              : [],
          salesAssociateArray:
            typeof row[13] === "string"
              ? row[13]
                  .replace(/^"(.*)"$/, "$1")
                  .split(",")
                  .map((str) => str.trim())
              : [],
        };
      });

      return projects;
    } catch {
      alert("Failed to fetch projects. Please try again.");
      return [];
    }
  };

  useEffect(() => {
    const fetchAndSetTasks = async () => {
      try {
        const cached = localStorage.getItem("taskData");
        const now = Date.now();

        if (cached) {
          const parsed = JSON.parse(cached);
          const timeDiff = now - parsed.time;

          if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
            const sortedTasks = parsed.data.sort(
              (a, b) => new Date(a[2]).getTime() - new Date(b[2]).getTime()
            );
            dispatch(setTasks(sortedTasks));
            settasks(sortedTasks);
            return;
          }
        }

        const data = await fetchTaskData();
        const sorted = data.sort(
          (a, b) => new Date(a[2]).getTime() - new Date(b[2]).getTime()
        );
        dispatch(setTasks(sorted));
        settasks(sorted);
        localStorage.setItem(
          "taskData",
          JSON.stringify({ data: sorted, time: now })
        );
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    fetchAndSetTasks();
  }, [dispatch, refresh]);

  useEffect(() => {
    const fetchAndSetProjects = async () => {
      try {
        const cached = localStorage.getItem("projectData");
        const now = Date.now();

        if (cached) {
          const parsed = JSON.parse(cached);
          const timeDiff = now - parsed.time;

          if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
            dispatch(setProjects(parsed.data));
            setProjectData(parsed.data);
            return;
          }
        }

        const data = await fetchProjectData();
        dispatch(setProjects(data));
        setProjectData(data);
        localStorage.setItem(
          "projectData",
          JSON.stringify({ data, time: now })
        );
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    if (projectData.length === 0) {
      if (projects.length === 0) fetchAndSetProjects();
      else setProjectData(projects);
    }
  }, [dispatch, projects]);

  // Refresh hook
  useEffect(() => {
    const refreshData = async () => {
      try {
        const taskData = await fetchTaskData();
        const sortedTasks = taskData.sort(
          (a, b) => new Date(a[2]).getTime() - new Date(b[2]).getTime()
        );
        dispatch(setTasks(sortedTasks));
        settasks(sortedTasks);
        localStorage.setItem(
          "taskData",
          JSON.stringify({ data: sortedTasks, time: Date.now() })
        );

        const projectData = await fetchProjectData();
        dispatch(setProjects(projectData));
        setProjectData(projectData);
        localStorage.setItem(
          "projectData",
          JSON.stringify({ data: projectData, time: Date.now() })
        );

        setrefresh(false);
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    };

    if (refresh) {
      refreshData();
    }
  }, [refresh]);

  const filterOptions = [
    { label: "All Tasks", value: "All Tasks" },
    { label: "To Do", value: "To Do" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
  ];

  // Filter tasks based on search query and selected filter
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "All Tasks" || task[7] === filter;
    const matchesSearch = searchQuery
      ? task[0].toLowerCase().includes(searchQuery.toLowerCase()) ||
        task[5].toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 md:mt-0 mt-20 h-screen">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          onClick={() => setDialogOpen(true)}
          style={{ borderRadius: "8px" }}
          className="flex items-center gap-2 bg-blue-600 !rounded-md shadow-2xl text-white px-4 py-2"
        >
          <Plus size={18} /> Add Task
        </button>
      </div>

      <div className="flex flex-wrap gap-2 space-x-4 border-b pb-2 mb-4 lg:gap-4">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            className={`px-4 py-2 !rounded transition ${
              filter === option.value
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-5 !rounded-md shadow overflow-x-auto">
        <input
          type="text"
          placeholder="Search tasks..."
          className="border px-3 py-2 !rounded-md w-full mb-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-sky-50">
            <tr>
              <th className="px-4 py-2">Task</th>
              <th className="px-4 py-2">Priority</th>
              <th className="px-4 py-2">Project</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Assignee</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks != null &&
              filteredTasks.map((task, index) => (
                <tr key={index} className="hover:bg-sky-50">
                  <td className="px-4 py-2">{task[0]}</td>
                  <td
                    className={`font-bold px-4 ${
                      task[6] === "High"
                        ? "text-red-600"
                        : task[6] === "Moderate"
                        ? "text-yellow-400"
                        : "text-green-600"
                    }`}
                  >
                    {task[6]}
                  </td>
                  <td className="px-4 py-2">{task[5]}</td>
                  <td className="px-4 py-2">{task[2]}</td>
                  <td className="px-4 py-2">{task[3]}</td>
                  <td className="px-4 py-2">{task[4]}</td>
                  <td className="px-4 py-2">{task[7]}</td>
                  <td className="px-4 py-2 relative">
                    <button
                      className="p-2 hover:bg-gray-200 !rounded-full"
                      onClick={() =>
                        setOpenDropdown(openDropdown === index ? null : index)
                      }
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openDropdown === index && (
                      <div className="absolute w-32 bg-white shadow-md !rounded-md z-[50] border">
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setOpenDropdown(null);
                            setDialogOpen(true);
                            setediting(task);
                          }}
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-red-100 text-red-600 flex items-center gap-2"
                          onClick={() => {
                            deleteTask(task[0]);
                            setOpenDropdown(null);
                          }}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Dialog with smooth animation */}
      <AnimatePresence>
        {isDialogOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDialogOpen(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <TaskDialog
                onClose={() => setDialogOpen(false)}
                isEditing={editing}
                setediting={setediting}
                name={name}
                setrefresh={setrefresh}
                projectData={projectData}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {taskDialogOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(setTaskDialogOpen(false))}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <TaskDialog
                onClose={() => setDialogOpen(false)}
                isEditing={editing}
                setediting={setediting}
                name={name}
                setrefresh={setrefresh}
                projectData={projectData}
                setTaskDialogOpen={setTaskDialogOpen}
                taskDialogOpen={taskDialogOpen}
                setProjectFlag={setProjectFlag}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
