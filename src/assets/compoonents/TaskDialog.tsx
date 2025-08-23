import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { setTaskDialogOpen, setTasks } from "../Redux/dataSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading";
import Select from "react-select";

interface TaskDialogProps {
  onClose: () => void;
  name: string;
  setrefresh: (val: boolean) => void;
  setAdded: (val: boolean) => void;
  isEditing: any;
  setediting: (val: any) => void;
  refresh: boolean;
  projectData: any[];
  taskDialogOpen: boolean;
  setProjectFlag: (val: boolean) => void;
  dashboard?: boolean;
}

const fetchTaskData = async () => {
  const response = await fetchWithLoading(
    "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintstasks"
  );
  const data = await response.json();
  return data.body || [];
};

const TaskDialog = forwardRef<{ submit: () => void }, TaskDialogProps>(
  (
    {
      setAdded,
      onClose,
      isEditing,
      setediting,
      name,
      setrefresh,
      refresh,
      projectData,
      taskDialogOpen,
      setProjectFlag,
      dashboard,
    },
    ref
  ) => {
    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [assignee, setAssignee] = useState("");
    const [project, setProject] = useState("");
    const [priority, setPriority] = useState("Moderate");
    const [status, setStatus] = useState("To Do");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
      if (isEditing) {
        setTaskName(isEditing[0]); // title
        setDescription(isEditing[1]); // description
        setDateTime(isEditing[2]); // due date/time
        setAssignee(isEditing[4]); // assignee
        setProject(isEditing[5]); // project
        setPriority(isEditing[6]); // priority
        setStatus(isEditing[7]); // status
      }
    }, [isEditing]);

    const addTask = async () => {
      if (!dateTime) {
        alert("Please select a due date.");
        return;
      }

      try {
        const existingTasks = await fetchTaskData();
        const isDuplicate = existingTasks.some(
          (task) => task[0]?.toLowerCase() === taskName.toLowerCase()
        );

        if (isDuplicate) {
          alert("Task name already exists.");
          return;
        }

        const date = new Date().toISOString().slice(0, 16);

        const response = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/addPaintstask",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              title: taskName,
              description,
              dateTime,
              date,
              assigneeLink: assignee,
              projectLink: project,
              priority,
              status,
            }),
          }
        );

        if (response.status === 200) {
          alert("Task Added");
          const updatedTasks = await fetchTaskData();
          const sortedTasks = updatedTasks.sort(
            (a, b) => new Date(a[2]).getTime() - new Date(b[2]).getTime()
          );

          dispatch(setTasks(sortedTasks));
          setediting(null);
          setrefresh(!refresh);
          onClose();
        } else {
          alert("Error adding task");
        }
      } catch (error) {
        console.error("Add error:", error);
        alert("Something went wrong while adding the task.");
      }
    };

    const editTask = async () => {
      try {
        const date = isEditing[3]; // created date

        const response = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintstask",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              title: taskName,
              description,
              dateTime,
              date,
              assigneeLink: assignee,
              projectLink: project,
              priority,
              status,
            }),
          }
        );

        if (response.status === 200) {
          alert("Task updated");

          const updatedTasks = await fetchTaskData();
          const sortedTasks = updatedTasks.sort(
            (a, b) => new Date(a[2]).getTime() - new Date(b[2]).getTime()
          );

          dispatch(setTasks(sortedTasks));
          setediting(null);
          setrefresh(true);
          onClose();
        } else {
          alert("Error updating task");
        }
      } catch (error) {
        console.error("Update error:", error);
        alert("Something went wrong while updating the task.");
      }
    };

    const cancel = () => {
      if (taskDialogOpen) {
        dispatch(setProjectFlag(true));
        if (!dispatch) navigate("/projects");
        dispatch(setTaskDialogOpen(false));
      }
      setediting(null);
      onClose();
    };

    useImperativeHandle(ref, () => ({
      submit: () => (isEditing ? editTask() : addTask()),
    }));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50 overflow-x-hidden">
        <div className="relative bg-white shadow-lg rounded-lg p-3 sm:p-4 w-full max-w-[95vw] sm:max-w-md border">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
            📝 {isEditing ? "Edit Task" : "Add Task"}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              isEditing ? editTask() : addTask();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                isEditing ? editTask() : addTask();
              }
            }}
          >
            {/* Task Name */}
            <div className="mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Task Name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm"
                rows={3}
                required
              />
            </div>

            {/* Due Date */}
            <div className="mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Due Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm"
                required
              />
            </div>

            {/* Assignee */}
            <div className="mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Assigned To
              </label>
              <input
                type="text"
                placeholder="Assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm"
              />
            </div>

            {/* Project Selection */}
            <div className="mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Project
              </label>
              <Select
                options={projectData.map((project, index) => ({
                  value: project.projectName,
                  label: project.projectName,
                }))}
                value={project ? { value: project, label: project } : null}
                onChange={(selectedOption) =>
                  setProject(selectedOption ? selectedOption.value : "")
                }
                placeholder="Select Project"
                className="w-full text-xs sm:text-sm font-inter"
                classNamePrefix="react-select"
                isClearable
                isSearchable
                styles={{
                  control: (provided) => ({
                    ...provided,
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    padding: "0.125rem sm:0.25rem",
                    backgroundColor: "#f9fafb",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#6366f1",
                    },
                    "&:focus": {
                      borderColor: "#6366f1",
                      boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)",
                    },
                    fontSize: "0.75rem",
                    minHeight: "2rem",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
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
                    fontSize: "0.75rem",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#6b7280",
                    fontSize: "0.75rem",
                  }),
                }}
              />
            </div>

            {/* Priority */}
            <div className="mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm"
                required
              >
                <option value="High">High</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Status */}
            <div className="mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm"
                required
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex flex-row justify-end gap-2 sm:gap-3 mt-3">
              <button
                type="button"
                onClick={cancel}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-400 text-white rounded text-xs sm:text-sm hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-500 text-white rounded text-xs sm:text-sm hover:bg-blue-600"
              >
                {isEditing ? "Edit Task" : "Add Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

export default TaskDialog;
