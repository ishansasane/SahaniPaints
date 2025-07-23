import React from "react";
import { useDispatch } from "react-redux";
import { setProjects } from "../Redux/dataSlice";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface DeadlineCardProps {
  projectName: string;
  project: any;
  date: string;
  setSendProject: (project: any) => void;
  setIndex: (index: number) => void;
  index: number;
  setTax: (tax: number) => void;
  setAmount: (amount: number) => void;
  setProjectDiscount: (discount: number) => void;
  setFlag: (flag: boolean) => void;
  clickFunction: any;
  clickInverseFunction: any;
}
class CardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("Error inside DeadlineCard:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-1 text-xs text-red-500">
          Error rendering this card.
        </div>
      );
    }
    return this.props.children;
  }
}

const DeadlineCard: React.FC<DeadlineCardProps> = ({
  projectName,
  project,
  date,
  setSendProject,
  setIndex,
  index,
  setTax,
  setAmount,
  setProjectDiscount,
  setFlag,
  clickFunction,
  clickInverseFunction,
}) => {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const nameHash = projectName
    ?.split("")
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const bgGradient = `linear-gradient(135deg, 
    hsl(${nameHash % 360}, 80%, 85%) 0%, 
    hsl(${(nameHash + 30) % 360}, 80%, 85%) 100%)`;

  const goodsArray = project?.goodsArray ?? [];
  const dispatch = useDispatch();

  const fetchProjectData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsprojectdata",
      { credentials: "include" }
    );

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    if (!data.body || !Array.isArray(data.body))
      throw new Error("Invalid data format");

    const parseSafely = (value: any, fallback: any) => {
      try {
        return typeof value === "string"
          ? JSON.parse(value)
          : value || fallback;
      } catch {
        return fallback;
      }
    };

    const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

    const fixBrokenArray = (input: any): string[] => {
      if (Array.isArray(input)) return input;
      if (typeof input !== "string") return [];
      try {
        const fixed = JSON.parse(input);
        if (Array.isArray(fixed)) return fixed;
      } catch {
        return input
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((item: string) => item.trim().replace(/^"+|"+$/g, ""));
      }
      return [];
    };

    const projects = data.body.map((row: any[]) => ({
      projectName: row[0],
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
      projectAddress: row[17],
      date: row[18],
      grandTotal: row[19],
      discountType: row[20],
      bankDetails: deepClone(parseSafely(row[21], [])),
      termsConditions: deepClone(parseSafely(row[22], [])),
    }));

    return projects;
  };

  const markAsCompleted = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/updatepaintsprojectdata",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ projectName, status: "Completed" }),
      }
    );
    if (response.ok) {
      const updatedData = await fetchProjectData();
      dispatch(setProjects(updatedData));
      localStorage.setItem(
        "projectData",
        JSON.stringify({ data: updatedData, time: Date.now() })
      );
      alert("Project marked as completed");
    } else {
      alert("Error updating project status");
    }
  };

  return (
    <CardErrorBoundary>
      <div
        className={`bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-150 border border-gray-100 ${
          project.status === "Completed" ? "hidden" : ""
        }`}
      >
        {/* Gradient Accent Bar */}
        <div className="h-1 w-full" style={{ background: bgGradient }}></div>

        <div className="p-1 space-y-1">
          {/* Header */}
          <div
            onClick={() => clickFunction()}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer"
          >
            <div>
              <p className=" font-semibold text-gray-900 line-clamp-1 hover:text-blue-600">
                {projectName}
              </p>
              <div className="flex items-center gap-1 text-gray-500 ">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formattedDate}</span>
              </div>
            </div>

            <span className="mt-1 sm:mt-0 inline-flex items-center px-1 py-0.5 rounded-full text-[0.6rem] font-medium bg-green-100 text-green-800">
              <span className="w-1.5 h-1.5 mr-1 rounded-full bg-green-500"></span>
              Active
            </span>
          </div>

          {/* Items Section */}
          <div
            onClick={() => clickFunction()}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center"
          >
            <div>
              <div className="flex gap-1 items-center">
                <p className=" font-medium text-gray-500 uppercase">Items :</p>
                <span className="text-[0.8vw] text-gray-400 bg-gray-100 rounded-full px-1">
                  {goodsArray.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {goodsArray.slice(0, 3).map((arr: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.7rem] font-medium bg-white text-gray-700 border border-gray-200"
                  >
                    {arr?.item?.[0] || "Item"}
                  </span>
                ))}

                {goodsArray.length > 3 && (
                  <span className="inline-flex items-center px-1.5 text-[0.7rem] font-medium bg-gray-50 text-gray-500 rounded-full">
                    +{goodsArray.length - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-1 sm:mt-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAsCompleted();
                }}
                style={{ borderRadius: "4px" }}
                className="px-1 py-0.5 !text-sm w-22 text-white bg-blue-500 hover:bg-blue-600"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      </div>
    </CardErrorBoundary>
  );
};

export default DeadlineCard;
