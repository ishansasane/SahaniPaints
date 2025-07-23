import { useEffect } from "react";

const TaskCard = ({ taskData }) => {
  const priorityColors = {
    High: "bg-red-500",
    Moderate: "bg-yellow-500",
    Low: "bg-green-500",
  };

  useEffect(()=>{
    console.log("Task Data:", taskData);
  })

  return (
    <div className="bg-white shadow-sm rounded-xl  p-3 border-l-4 border-gray-100 transition-transform transform hover:scale-102">
      <div className="flex justify-between !gap-0 items-start">
        <div className="flex-col">
          <h3 className="!text-lg font-semibold text-gray-900 truncate">{taskData[0]}</h3>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{taskData[5]}</p>
          <p className="text-xs text-gray-600 mt-0.5"><strong>Date:</strong> {taskData[2]}</p>
        </div>
        <div className="flex flex-col gap-2 items-end text-xs text-gray-600">
          <span className={`px-1.5 py-0.5 text-xs font-medium text-white rounded-full ${priorityColors[taskData[6]]}`}>
            {taskData[6]}
          </span>
          <p className={`font-medium ${taskData[7] === "In Progress" ? "text-yellow-500" : ""} ${taskData[7] === "Completed" ? "text-green-500" : ""} ${taskData[7] === "To Do" ? "text-red-500" : ""}`}>
            Status: {taskData[7]}
          </p>
          <p><strong>To:</strong> {taskData[4]}</p>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;