/* eslint-disable @typescript-eslint/no-unused-vars */
import { SetStateAction, useEffect, useState, useRef } from "react";
import { ChevronFirst } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/Store.ts";
import { setItemData } from "../Redux/dataSlice.ts";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { fetchWithLoading } from "../Redux/fetchWithLoading.ts";

const getItemsData = async () => {
  const response = await fetchWithLoading(
    "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintssingleproducts"
  );
  const data = await response.json();
  return data.body;
};

const Items = () => {
  const groupTypes = [
    ["Fabric", ["Meter"]],
    ["Area Based", ["Sq. Feet"]],
    ["Running length based", ["Meter", "Feet"]],
    ["Piece based", ["Piece", "Items", "Sets"]],
    ["Fixed length items", ["Piece"]],
    ["Fixed area items", ["Piece", "Roll"]],
    ["Tailoring", ["Parts", "Sq. Feet"]],
  ];
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [deleted, setDeleted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [productName, setProductName] = useState("");
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [groupType, setGroupType] = useState("");
  const [sellingUnit, setSellingUnit] = useState("");
  const [mrp, setMrp] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [publish, setPublish] = useState(false);
  const [accessory, setAccessory] = useState(false);

  const dispatch = useDispatch();
  const itemData = useSelector((state: RootState) => state.data.items);

  const [needsTailoring, setNeedsTailoring] = useState(false);
  const [selectedGroupType, setSelectedGroupType] = useState("");
  const selectedUnits =
    groupTypes.find((type) => type[0] === selectedGroupType)?.[1] || [];

  const [openMenu, setOpenMenu] = useState(-1);
  const menuRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  // State for import modal and drag-and-drop
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [oldProductName, setOldProductName] = useState("");

  const toggleMenu = (index: number) => {
    setOpenMenu(openMenu === index ? -1 : index);
  };

  const editMenu = (item: any) => {
    setIsFormOpen(true);
    setEditing(true);
    setProductName(item[0]);
    setOldProductName(item[0]);
    setDescription(item[1]);
    setSelectedGroupType(item[2]);
    setSellingUnit(item[3]);
    setMrp(item[4]);
    setTaxRate(item[5]);
    if (item[7] == "TRUE") {
      setNeedsTailoring(true);
    } else {
      setNeedsTailoring(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRefs.current.every(
          (ref) => ref && !ref.contains(event.target as Node)
        )
      ) {
        setOpenMenu(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll to make dropdown fully visible when opened
  useEffect(() => {
    if (openMenu !== -1 && menuRefs.current[openMenu]) {
      const dropdown = menuRefs.current[openMenu];
      if (dropdown) {
        const rect = dropdown.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (rect.bottom > viewportHeight) {
          dropdown.scrollIntoView({ behavior: "smooth", block: "end" });
        } else if (rect.top < 0) {
          dropdown.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  }, [openMenu]);

  useEffect(() => {
    const fetchData = async () => {
      const cached = localStorage.getItem("itemData");
      const oneHour = 60 * 60 * 1000;

      if (cached) {
        const { data, time } = JSON.parse(cached);
        if (Date.now() - time < oneHour && Array.isArray(data)) {
          dispatch(setItemData(data));
          setItems(data);
          return;
        }
      }

      const freshData = await getItemsData();
      dispatch(setItemData(freshData));
      setItems(freshData);
      localStorage.setItem(
        "itemData",
        JSON.stringify({ data: freshData, time: Date.now() })
      );
    };

    fetchData();
  }, [isFormOpen, deleted, dispatch]);

  const deleteItem = async (name: string) => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/deletepaintssingleproduct",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ productName: name }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the item");
      }

      const updatedData = await getItemsData();
      dispatch(setItemData(updatedData));
      setItems(updatedData);
      localStorage.setItem(
        "itemData",
        JSON.stringify({ data: updatedData, time: Date.now() })
      );
      setDeleted((prev) => !prev);
      setOpenMenu(-1);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item");
    }
  };

  const duplicateItem = async (item: Array<string>, index: number) => {
    let date = new Date();
    const formattedDate = new Date().toLocaleDateString("en-GB");

    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/addpaintsnewproduct",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            productName: item[0],
            description: item[1],
            groupTypes: item[2],
            sellingUnit: item[3],
            mrp: item[4],
            taxRate: item[5],
            needsTailoring: item[7],
            date: formattedDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to duplicate the item");
      }

      const updatedData = await getItemsData();
      const duplicatedItem = updatedData[updatedData.length - 1];
      const reorderedData = [
        ...items.slice(0, index + 1),
        duplicatedItem,
        ...items.slice(index + 1),
      ];

      dispatch(setItemData(reorderedData));
      setItems(reorderedData);
      localStorage.setItem(
        "itemData",
        JSON.stringify({ data: reorderedData, time: Date.now() })
      );
      setDeleted((prev) => !prev);
      setOpenMenu(-1);
    } catch (err) {
      console.error("Error duplicating item:", err);
      alert("Failed to duplicate item");
    }
  };

  const groupOptions: string[] = [
    "Fabric",
    "Area Based",
    "Running length based",
    "Piece based",
    "Fixed length items",
    "Fixed area items",
    "Tailoring",
  ];

  const sellingUnits: { [key: string]: string[] } = {
    Fabric: ["Meter"],
    "Area Based": ["Sq. Feet", "Sq. Meter"],
    "Running length based": ["Meter", "Feet"],
    "Piece based": ["Piece", "Items", "Sets"],
    "Fixed length items": ["Piece"],
    "Fixed area items": ["Piece", "Roll"],
    Tailoring: ["Parts", "Sq. Feet"],
  };

  const additionalFields: Record<string, string[]> = {
    Fabric: [
      "Coverage in Width",
      "Wastage in Height",
      "Threshold For Parts Calculation",
    ],
    "Area Based": ["Coverage in Area"],
    "Running length based": [],
    "Piece based": [],
    "Fixed length items": ["Length of Item"],
    "Fixed area items": ["Area Covered"],
    Tailoring: [],
  };

  const sideDropdownOptions: Record<string, string[]> = {
    Fabric: ["Inch", "Centimeter", "Meter"],
    "Area Based": ["Sq. Feet", "Sq. Meter"],
    "Running length based": [],
    "Piece based": [],
    "Fixed length items": ["Meter", "Inch", "Centimeter", "Feet"],
    "Fixed area items": ["Sq. Feet", "Sq. Meter"],
    Tailoring: [],
  };

  const [formData, setFormData] = useState({
    productName: "",
    productDetails: "",
    groupType: "",
    sellingUnit: "",
    mrp: "",
    taxRate: "",
    additionalInputs: {},
    sideDropdown: "",
  });

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGroup: string = e.target.value;
    setFormData({
      ...formData,
      groupType: selectedGroup,
      sellingUnit: sellingUnits[selectedGroup]?.[0] || "",
      additionalInputs: additionalFields[selectedGroup]
        ? additionalFields[selectedGroup].reduce(
            (acc: any, field: string) => ({ ...acc, [field]: "" }),
            {}
          )
        : {},
      sideDropdown: sideDropdownOptions[selectedGroup]?.[0] || "",
    });
  };

  const handleAdditionalInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      additionalInputs: { ...formData.additionalInputs, [field]: value },
    });
  };

  const editItemData = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/updatepaintssingleproduct",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            oldProductName,
            productName,
            description,
            groupTypes: selectedGroupType,
            sellingUnit,
            mrp,
            taxRate,
            needsTailoring,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      alert("Item Updated");
      const updatedData = await getItemsData();
      dispatch(setItemData(updatedData));
      setItems(updatedData);
      localStorage.setItem(
        "itemData",
        JSON.stringify({ data: updatedData, time: Date.now() })
      );
      setIsFormOpen(false);
      setEditing(false);
      setOpenMenu(-1);
      setFormData({
        productName: "",
        productDetails: "",
        groupType: "",
        sellingUnit: "",
        mrp: "",
        taxRate: "",
        additionalInputs: {},
        sideDropdown: "",
      });
    } catch (error) {
      console.error("Edit error:", error);
      alert("Something went wrong while updating the item.");
    }
  };

  const handleSubmit = async () => {
    let date = new Date();
    const formattedDate = new Date().toLocaleDateString("en-GB");

    const newItem = {
      id: items.length + 1,
      name: formData.productName,
      description: formData.productDetails,
      costingType: formData.sellingUnit,
      groupType: formData.groupType,
      entryDate: formattedDate,
      additionalInputs: formData.additionalInputs,
      sideDropdown: formData.sideDropdown,
      mrp: formData.mrp,
      taxrate: formData.taxRate,
      needsTailoring: needsTailoring,
    };

    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/addpaintsnewproduct",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            productName: newItem.name,
            description: newItem.description,
            groupTypes: newItem.groupType,
            sellingUnit: newItem.costingType,
            mrp: newItem.mrp,
            taxRate: newItem.taxrate,
            needsTailoring,
            date: formattedDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add new item");
      }

      const updatedData = await getItemsData();
      dispatch(setItemData(updatedData));
      setItems(updatedData);
      localStorage.setItem(
        "itemData",
        JSON.stringify({ data: updatedData, time: Date.now() })
      );
      alert("Item Added");
      setIsFormOpen(false);
      setFormData({
        productName: "",
        productDetails: "",
        groupType: "",
        sellingUnit: "",
        mrp: "",
        taxRate: "",
        additionalInputs: {},
        sideDropdown: "",
      });
      setNeedsTailoring(false);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error adding item");
    }
  };

  // Handle file import
  const handleFileImport = async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setFileError("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const importedItems = jsonData.map((row: any) => {
        let addedDate = "";
        if (row["Added Date"]) {
          try {
            const date = new Date(row["Added Date"]);
            addedDate = isNaN(date.getTime())
              ? new Date().toLocaleDateString("en-GB")
              : date.toLocaleDateString("en-GB");
          } catch {
            addedDate = new Date().toLocaleDateString("en-GB");
          }
        } else {
          addedDate = new Date().toLocaleDateString("en-GB");
        }

        const mrpValue = row["MRP"] != null ? String(row["MRP"]) : "";
        const taxRateValue =
          row["Tax Rate"] != null ? String(row["Tax Rate"]) : "";

        const needsTailoringValue =
          row["Needs Tailoring"] === "Yes" ||
          row["Needs Tailoring"] === true ||
          row["Needs Tailoring"] === "TRUE" ||
          row["Needs Tailoring"] === 1;

        return [
          row["Product Name"] || "",
          row["Description"] || "",
          row["Group Type"] || "",
          row["Costing Type"] || "",
          mrpValue,
          taxRateValue,
          addedDate,
          needsTailoringValue,
        ];
      });

      // ✅ Improved Validation: Case-insensitive + trimmed matching
      const validItems = importedItems.filter((item) => {
        const productName = item[0]?.toString().trim();
        const groupType = item[2]?.toString().trim().toLowerCase();
        const costingType = item[3]?.toString().trim().toLowerCase();

        const validGroup = groupOptions.some(
          (group) => group.toLowerCase() === groupType
        );

        const validSellingUnit =
          validGroup &&
          sellingUnits[
            groupOptions.find((g) => g.toLowerCase() === groupType)!
          ]?.some((unit) => unit.toLowerCase() === costingType);

        return productName && validGroup && validSellingUnit;
      });

      if (validItems.length === 0) {
        setFileError(
          "No valid items found in the Excel file. Please check data format."
        );
        return;
      }

      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/importpaintsproducts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            items: validItems,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to import items");
      }

      const updatedData = await getItemsData();
      dispatch(setItemData(updatedData));
      setItems(updatedData);
      localStorage.setItem(
        "itemData",
        JSON.stringify({ data: updatedData, time: Date.now() })
      );
      setIsImportModalOpen(false);
      setFileError(null);
      alert("Items imported successfully");
    } catch (error) {
      console.error("Error importing file:", error);
      setFileError("Failed to import Excel file");
    }
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileImport(file);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
  };

  // Export table data as PDF
  // Export table data as PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Products List", 14, 20);
    const columns = [
      "Product Name",
      "Description",
      "Costing Type",
      "Group Type",
      "MRP",
      "Tax Rate",
      "Added Date",
      "Needs Tailoring",
    ];
    const rows = items.map((item: any) => [
      item[0] || "",
      item[1] || "",
      item[3] || "",
      item[2] || "",
      item[4] || "",
      item[5] || "",
      item[6] ? new Date(item[6]).toLocaleDateString("en-GB") : "",
      item[7] ? "Yes" : "No",
    ]);
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 30,
      theme: "striped",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [50, 150, 150] },
    });
    doc.save("products-table.pdf");
  };

  // Export table data as Excel
  const handleExportExcel = () => {
    if (!items || items.length === 0) {
      alert("No data available to export.");
      return;
    }

    try {
      const columns = [
        "Product Name",
        "Description",
        "Group Type",
        "Costing Type",
        "MRP",
        "Tax Rate",
        "Added Date",
        "Needs Tailoring",
      ];
      const rows = items.map((item: any) => ({
        "Product Name": item[0] || "",
        Description: item[1] || "",
        "Group Type": item[2] || "",
        "Costing Type": item[3] || "",
        MRP: item[4] != null ? Number(item[4]) || "" : "",
        "Tax Rate": item[5] != null ? Number(item[5]) || "" : "",
        "Added Date": item[6]
          ? new Date(item[6]).toLocaleDateString("en-GB")
          : new Date().toLocaleDateString("en-GB"),
        "Needs Tailoring": item[7] ? "Yes" : "No",
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows, { header: columns });
      worksheet["!cols"] = [
        { wch: 20 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "products-table.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Failed to export Excel file.");
    }
  };

  // Filter items based on search input
  const filteredItems = items.filter((item: any) =>
    [item[0], item[1], item[2], item[3]]
      .map((field) => (field || "").toString().toLowerCase())
      .some((field) => field.includes(search.toLowerCase()))
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-30 md:p-4">
      <div className="container mx-auto">
        <div className="flex justify-between flex-wrap items-center mb-4">
          <div className="flex items-center gap-5">
            {isFormOpen && (
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditing(false);
                }}
                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <ChevronFirst />
              </button>
            )}
            <h1 className="text-2xl font-semibold">Products</h1>
          </div>
          <div className="flex items-center md:!gap-5 flex-wrap gap-2">
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                More Options
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setIsImportModalOpen(true)}
                  >
                    Import Product
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={handleExportPDF}>
                    Export as PDF
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={handleExportExcel}>
                    Export as Excel
                  </button>
                </li>
              </ul>
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => navigate("/add-product")}
            >
              <i className="fas fa-plus"></i> + Add Product
            </button>
          </div>
        </div>

        {/* Import Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Import Excel File</h2>
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setFileError(null);
                    setIsDragging(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <p className="text-gray-600 mb-2">
                  Drag and drop your Excel file here or
                </p>
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer text-blue-500 hover:text-blue-600"
                >
                  click to select a file
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                {fileError && <p className="text-red-500 mt-2">{fileError}</p>}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  Expected columns: Product Name, Description, Group Type,
                  Costing Type, MRP, Tax Rate, Added Date, Needs Tailoring
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setFileError(null);
                    setIsDragging(false);
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isFormOpen && (
          <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Product Details</h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div>
                <label className="block font-medium">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  value={productName}
                  placeholder="Enter Product Name"
                  onChange={(e) => {
                    setProductName(e.target.value);
                  }}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block font-medium">Description</label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter Description"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">
                    Group Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="groupType"
                    value={selectedGroupType}
                    onChange={(e) => setSelectedGroupType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Group Type</option>
                    {groupTypes.map(([label]) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium">
                    Selling Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sellingUnit"
                    value={sellingUnit}
                    onChange={(e) => setSellingUnit(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Selling Unit</option>
                    {selectedUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">MRP</label>
                  <input
                    type="text"
                    name="mrp"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    placeholder="Enter MRP"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium">Tax Rate</label>
                  <input
                    type="text"
                    name="taxRate"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    placeholder="Enter Tax Rate"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Needs Tailoring
                  </label>
                  <div
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                      needsTailoring ? "bg-blue-500" : "bg-gray-300"
                    }`}
                    onClick={() => setNeedsTailoring(!needsTailoring)}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform ${
                        needsTailoring ? "translate-x-6" : "translate-x-0"
                      } transition`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditing(false);
                    setProductName("");
                    setDescription("");
                    setGroupType("");
                    setSellingUnit("");
                    setMrp("");
                    setTaxRate("");
                  }}
                  className="px-4 py-2 border !rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white !rounded-lg"
                  onClick={editItemData}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        <div
          className={`bg-white shadow rounded-lg p-4 mt-4 overflow-x-auto ${
            isFormOpen ? "hidden" : ""
          }`}
          ref={tableRef}
        >
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 bg-sky-50">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Costing Type</th>
                <th className="py-3 px-4">Group Type</th>
                <th className="py-3 px-4">Added Date</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems &&
                filteredItems.map((item: any, index: number) => (
                  <tr key={index} className="border-t relative hover:bg-sky-50">
                    <td onClick={() => editMenu(item)} className="py-2 px-4">
                      {item[0]}
                    </td>
                    <td className="py-2 px-4">{item[1]}</td>
                    <td className="py-2 px-4">{item[3]}</td>
                    <td className="py-2 px-4">{item[2]}</td>
                    <td className="py-2 px-4">
                      {item[6]
                        ? new Date(item[6]).toLocaleDateString("en-GB")
                        : ""}
                    </td>

                    <td className="py-2 px-4 relative">
                      <button
                        onClick={() => toggleMenu(index)}
                        className="p-2 rounded hover:bg-gray-200 text-gray-600 text-xl"
                        aria-expanded={openMenu === index}
                        aria-controls={`menu-${index}`}
                      >
                        ⋮
                      </button>
                      <div
                        id={`menu-${index}`}
                        className={`absolute right-4 top-10 w-32 bg-white shadow-md border rounded-md z-50 transition-all duration-200 ease-in-out ${
                          openMenu === index
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-95 pointer-events-none"
                        }`}
                        ref={(el) => (menuRefs.current[index] = el)}
                      >
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => editMenu(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => duplicateItem(item, index)}
                        >
                          Duplicate
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                          onClick={() => deleteItem(item[0])}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Items;
