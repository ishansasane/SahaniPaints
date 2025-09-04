import { Divide } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setCatalogs, setCompanyData, setDesignData, setItemData } from "../Redux/dataSlice";
import { RootState } from "../Redux/store";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const SearchableSelect = ({
  options,
  value,
  placeholder,
  name,
  mainindex,
  i,
  handleProductGroupChange,
  onDeleteOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option[0].toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        value={isOpen ? searchTerm : value}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 !rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-2 hover:bg-indigo-50/50 text-sm font-inter transition-colors duration-200"
              >
                <span
                  className="cursor-pointer flex-1"
                  onClick={() => {
                    handleProductGroupChange(mainindex, i, option);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option[0]}
                </span>
                {option[0] !== "➕ Add New Space" && onDeleteOption && (
                  <button
                    onClick={(e) => {
                      onDeleteOption(option[0]);
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <FaTrash className="w-3 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm font-inter">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const getItemsData = async () => {
  const response = await fetchWithLoading(
    "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintssingleproducts"
  );
  const data = await response.json();
  return data.body;
};

const ProductFormModal = ({
  isOpen,
  onClose,
  dispatch,
  items,
  setCombinedData,
  availableProductGroups,
  singleItems,
  mainindex,
  i,
  handleProductGroupChange,
}) => {
  const groupTypes = [
    ["Fabric", ["Meter"], ["e.g. Curtains"]],
    ["Area Based", ["Sq.Feet"], ["e.g. Area Based"]],
    ["Running Length based", ["Meter", "Feet"], ["e.g. Track, Border cloth"]],
    ["Piece Based", ["Piece", "Items", "Sets"], ["e.g. Hooks, Tape"]],
    ["Fixed Length Items", ["Piece"], ["e.g. 12 feet rod"]],
    ["Fixed Area Items", ["Piece", "Roll"], ["e.g. 57 sq.ft. wallpaper"]],
    ["Tailoring", ["Parts", "Sq.Feet"], ["e.g. Stitching"]],
  ];

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroupType, setSelectedGroupType] = useState("");
  const [sellingUnit, setSellingUnit] = useState("");
  const [mrp, setMrp] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [needsTailoring, setNeedsTailoring] = useState(false);

  const selectedUnits =
    groupTypes.find((type) => type[0] === selectedGroupType)?.[1] || [];

  const handleGroupTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    const matchedGroup = groupTypes.find(([label]) => label === selected);
    if (matchedGroup) {
      setSelectedGroupType(matchedGroup[0]);
    } else {
      setSelectedGroupType("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let currentItems = items;
    if (!currentItems || currentItems.length === 0) {
      currentItems = await getItemsData();
    }

    const duplicate = currentItems.some(
      (item: any) =>
        item[0]?.trim().toLowerCase() === productName.trim().toLowerCase()
    );

    if (duplicate) {
      alert("Product with this name already exists.");
      onClose();
      return;
    }

    try {
      const d = new Date();
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const date = `${day}/${month}/${year}`;

      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/addpaintsnewproduct",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productName,
            description,
            groupTypes: selectedGroupType,
            sellingUnit,
            mrp,
            taxRate,
            date,
            needsTailoring,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      const result = await response.json();
      const data = await getItemsData();
      dispatch(setItemData(data));
      localStorage.setItem(
        "itemData",
        JSON.stringify({ data, time: Date.now() })
      );

      // Update combinedData to reflect new product
      const updatedCombinedData = [...availableProductGroups, ...data];
      setCombinedData(updatedCombinedData);

      // Automatically select the new product in the field
      const newProduct = data.find(
        (item) => item[0]?.trim().toLowerCase() === productName.trim().toLowerCase()
      );
      if (newProduct && mainindex !== undefined && i !== undefined) {
        handleProductGroupChange(mainindex, i, newProduct);
      }

      alert("Product saved successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60">
      <div className="bg-white p-8 !rounded-2xl shadow-2xl border border-gray-100 w-[90%] sm:w-[600px] transition-all duration-300">
        <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-4 tracking-tight">
          Add New Product
        </h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter Product Name"
              className="w-full p-2 border !rounded-md"
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
              className="w-full p-2 border !rounded-md"
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
                onChange={handleGroupTypeChange}
                className="w-full p-2 border !rounded-md"
                required
              >
                <option value="">Select Group Type</option>
                {groupTypes.map(([label, , examples]) => (
                  <option key={label} value={label}>
                    {label} {examples?.[0] ? `(${examples[0]})` : ""}
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
                className="w-full p-2 border !rounded-md"
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
              <label className="block font-medium">
                MRP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mrp"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="Enter MRP"
                className="w-full p-2 border !rounded-md"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Tax Rate (%)</label>
              <input
                type="text"
                name="taxRate"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="Enter Tax Rate"
                className="w-full p-2 border !rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Needs Tailoring
            </label>
            <div
              className={`w-12 h-6 flex items-center !rounded-full p-1 cursor-pointer ${
                needsTailoring ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() => setNeedsTailoring(!needsTailoring)}
            >
              <div
                className={`w-5 h-5 bg-white !rounded-full shadow-md transform ${
                  needsTailoring ? "translate-x-6" : "translate-x-0"
                } transition`}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border !rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white !rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MaterialSelectionComponent = ({
  selections,
  availableAreas,
  availableProductGroups,
  availableCompanies,
  catalogueData,
  designNo,
  handleAddArea,
  handleRemoveArea,
  handleAreaChange,
  handleAddNewGroup,
  handleProductGroupChange,
  handleCompanyChange,
  handleCatalogueChange,
  handleDesignNoChange,
  handleReferenceChange,
  handleGroupDelete,
  projectData,
  setAvailableAreas,
  singleItems,
}) => {
  const dispatch = useDispatch();
  const [combinedData, setCombinedData] = useState([]);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState({ mainindex: null, i: null });

  const items = useSelector((state: RootState) => state.data.items);

  useEffect(() => {
    const combined = [...availableProductGroups, ...singleItems];
    setCombinedData(combined);
  }, [availableProductGroups, singleItems]);

  const fetchCompanyData = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsCompany",
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data.body) ? data.body : [];
    } catch (error) {
      console.error("Error fetching company data:", error);
      return [];
    }
  };

  const fetchDesignData = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsDesign",
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data.body) ? data.body : [];
    } catch (error) {
      console.error("Error fetching brand data:", error);
      return [];
    }
  };

  const companyData = useSelector((state: RootState) => state.data.companyData);
  const designData = useSelector((state: RootState) => state.data.designData);

  const ONE_HOUR = 3600 * 1000;

  const useInitialFetch = (dispatch, setCompanyData, setDesignData) => {
    useEffect(() => {
      const fetchAndCache = async (key, fetchFn, dispatchFn) => {

        if (key.length != 0) {
          return;
        }else{
          const data = await fetchFn();
          dispatch(dispatchFn(data));          
        }
      };

      fetchAndCache(companyData, fetchCompanyData, setCompanyData);
      fetchAndCache(designData, fetchDesignData, setDesignData);
    }, [dispatch]);
  };

  useInitialFetch(dispatch, setCompanyData, setDesignData);

  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isDesignNoOpen, setIsDesignNoOpen] = useState(false);

  async function fetchCatalogues() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getcatalogues",
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data.body) ? data.body : [];
    } catch (error) {
      console.error("Error fetching catalogues:", error);
      return [];
    }
  }

  const addArea = async (name) => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/addPaintsArea",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ name: name }),
      }
    );

    if (response.status === 200) {
      const newareas = [...availableAreas];
      newareas.push([name]);
      setAvailableAreas(newareas);
      alert("Area Added");
    } else {
      alert("Error");
    }
  };

  const deleteArea = async (name) => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintsArea",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    );
    if (response.ok) {
      const newAreas = availableAreas.filter((a) => a[0] !== name);
      setAvailableAreas(newAreas);
      alert(`"${name}" deleted from dropdown.`);
      alert("Area Deleted");
    } else {
      alert("Error in Deleting Area");
    }
  };

  const [catalogueName, setCatalogueName] = useState("");
  const [catalogueDescription, setCatalogueDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [designName, setDesignName] = useState("");

  const addCatalogue = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/addcatalogue",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          catalogueName: catalogueName,
          description: catalogueDescription,
        }),
      }
    );

    if (response.status === 200) {
      const data = await fetchCatalogues();
      dispatch(setCatalogs(data));
      setCatalogueName("");
      setCatalogueDescription("");
      setIsCatalogueOpen(false);
      alert("Catalogue Added");
    } else {
      alert("Error");
    }
  };

  const addCompany = async () => {
    const date = new Date();
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendPaintsCompany",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ companyName, date }),
      }
    );

    if (response.status === 200) {
      const data = await fetchCompanyData();
      dispatch(setCompanyData(data));
      setIsCompanyOpen(false);
      alert("Company Added");
    } else {
      alert("Error");
    }
  };

  const handleCompanyKeyPress = (e) => {
    if (e.key === "Enter") {
      addCompany();
    }
  };

  const handleCatalogueKeyPress = (e) => {
    if (e.key === "Enter") {
      addCatalogue();
    }
  };

  const handleDeleteArea = (areaName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${areaName}"?`
    );
    if (!confirmed) return;

    const newAreas = availableAreas.filter((a) => a[0] !== areaName);
    setAvailableAreas(newAreas);
    alert(`"${areaName}" deleted from dropdown.`);
  };

  return (
    <div className="flex flex-col gap-6 p-2 md:!p-6 bg-white !rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl font-inter">
      <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-gray-900 tracking-tight mb-4">
        Material Selection
      </h2>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Area Selection */}
        <div className="w-full sm:w-1/4">
          <p className="text-sm sm:text-base">Area</p>
          {Array.isArray(selections) ? (
            selections.map((selection, index) => {
              const currentArea = selection.area || "";
              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4"
                >
                  <div className="flex flex-col gap-2 w-full">
                    <SearchableSelect
                      options={[["➕ Add New Space"], ...availableAreas]}
                      value={currentArea}
                      placeholder="Select Area"
                      name="area"
                      mainindex={index}
                      i={0}
                      handleProductGroupChange={(
                        mainindex,
                        _,
                        selectedOption
                      ) => {
                        if (selectedOption[0] === "➕ Add New Space") {
                          const newArea = prompt("Enter new Area name:");
                          if (newArea && newArea.trim() !== "") {
                            addArea(newArea.trim());
                            handleAreaChange(mainindex, newArea.trim());
                          }
                        } else {
                          handleAreaChange(mainindex, selectedOption[0]);
                        }
                      }}
                      onDeleteOption={deleteArea}
                    />
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 mt-2 sm:mt-0"
                    onClick={() => handleRemoveArea(index)}
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-red-500 text-sm mb-4">No areas available.</p>
          )}
          <button
            className="flex flex-row gap-2 !rounded-md bg-sky-50 hover:bg-sky-100 items-center px-2 py-1 text-sm sm:text-base"
            onClick={handleAddArea}
          >
            <FaPlus className="text-sky-500" />
            Add Area
          </button>
        </div>

        {/* Right Column: Product Group Selection */}
        <div className="w-full lg:w-3/4">
          <div className="flex flex-row items-center justify-between">
            <p className="text-sm font-poppins font-medium text-gray-700">
              Select Product Groups
            </p>
          </div>
          {selections.map((selection, mainindex) => (
            <div
              key={mainindex}
              className="mb-4 border border-gray-100 md:p-4 !rounded-lg shadow-sm bg-gray-50 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3">
                <p className="text-base font-poppins font-medium text-gray-900">
                  {selection.area || "Unnamed Area"}
                </p>
                <button
                  className="mt-2 lg:mt-0 px-4 py-2 bg-indigo-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  onClick={() => handleAddNewGroup(mainindex)}
                >
                  Add New Group
                </button>
              </div>
              {selection.area ? (
                selection.areacollection.map((element, i) => (
                  <div
                    key={i}
                    className="mt-3 border border-gray-100 p-4 !rounded-lg shadow-sm bg-white transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Product Group */}
                      <div className="flex flex-col w-full lg:w-1/5">
                        <div className="flex">
                          <p className="text-sm font-poppins font-medium text-gray-700 mb-1">
                            Product Group / Items
                          </p>
                          <button
                            className="text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
                            onClick={() => {
                              setSelectedIndices({ mainindex, i });
                              setIsProductFormOpen(true);
                            }}
                          >
                            <FaPlus className="w-4 h-4" />
                          </button>
                        </div>
                        <SearchableSelect
                          options={combinedData}
                          value={element.productGroup[0]}
                          i={i}
                          mainindex={mainindex}
                          handleProductGroupChange={handleProductGroupChange}
                          placeholder="Select Product Group"
                          name="productGroup"
                        />
                      </div>

                      {/* Company */}
                      <div className="flex flex-col w-full lg:w-1/5">
                        <div className="flex flex-row items-center gap-3 mb-1">
                          <p className="text-sm font-poppins font-medium text-gray-700">
                            Company
                          </p>
                          <button
                            className="text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
                            onClick={() => setIsCompanyOpen(true)}
                          >
                            <FaPlus className="w-4 h-4" />
                          </button>
                        </div>
                        <SearchableSelect
                          options={companyData}
                          value={element.company[0]}
                          i={i}
                          mainindex={mainindex}
                          handleProductGroupChange={handleCompanyChange}
                          placeholder="Select Company"
                          name="company"
                        />
                      </div>

                      {/* Catalogue */}
                      <div className="flex flex-col w-full lg:w-1/5">
                        <div className="flex flex-row items-center gap-3 mb-1">
                          <p className="text-sm font-poppins font-medium text-gray-700">
                            Catalogue
                          </p>
                          <button
                            className="text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
                            onClick={() => setIsCatalogueOpen(true)}
                          >
                            <FaPlus className="w-4 h-4" />
                          </button>
                        </div>
                        <SearchableSelect
                          options={catalogueData}
                          value={element.catalogue}
                          i={i}
                          mainindex={mainindex}
                          handleProductGroupChange={handleCatalogueChange}
                          placeholder="Select Catalogue"
                          name="catalogue"
                        />
                      </div>

                      {/* Design No */}
                      <div className="flex flex-col w-full lg:w-1/6">
                        <p className="text-sm font-poppins font-medium text-gray-700 mb-3">
                          Design No.
                        </p>
                        <input
                          type="text"
                          placeholder="Design No"
                          value={element.design}
                          onChange={(e) => {
                            handleDesignNoChange(mainindex, i, e.target.value);
                          }}
                          className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                        />
                      </div>

                      {/* Reference */}
                      <div className="flex flex-col w-full lg:w-1/4">
                        <p className="text-sm font-poppins font-medium text-gray-700 mb-3">
                          Reference/Notes
                        </p>
                        <input
                          type="text"
                          value={element.reference}
                          placeholder="Enter reference..."
                          onChange={(e) =>
                            handleReferenceChange(mainindex, i, e.target.value)
                          }
                          className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50"
                        />
                      </div>

                      {/* Delete Button */}
                      <div className="flex flex-col w-full lg:w-auto">
                        <p className="text-sm font-poppins font-medium text-gray-700 mb-1 hidden lg:block"></p>
                        <button
                          onClick={(e) => handleGroupDelete(mainindex, i)}
                          className="text-red-500 hover:text-red-600 transition-colors duration-200 mt-2 lg:mt-0"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 font-inter">
                  Select an area to add product groups
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Company Modal */}
      {isCompanyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60">
          <div className="bg-white p-8 !rounded-2xl shadow-2xl border border-gray-100 w-[90%] sm:w-[400px] transition-all duration-300">
            <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-4 tracking-tight">
              Add Company
            </h3>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={handleCompanyKeyPress}
              className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50 mb-4"
              placeholder="Company Name"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCompanyOpen(false)}
                className="px-5 py-2.5 bg-gray-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addCompany}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Catalogue Modal */}
      {isCatalogueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60">
          <div className="bg-white p-8 !rounded-2xl shadow-2xl border border-gray-100 w-[90%] sm:w-[400px] transition-all duration-300">
            <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-4 tracking-tight">
              Add Catalogue
            </h3>
            <input
              type="text"
              value={catalogueName}
              onChange={(e) => setCatalogueName(e.target.value)}
              onKeyPress={handleCatalogueKeyPress}
              className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50 mb-4"
              placeholder="Catalogue Name"
            />
            <input
              type="text"
              value={catalogueDescription}
              onChange={(e) => setCatalogueDescription(e.target.value)}
              onKeyPress={handleCatalogueKeyPress}
              className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 font-inter bg-gray-50 mb-4"
              placeholder="Description"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCatalogueOpen(false)}
                className="px-5 py-2.5 bg-gray-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addCatalogue}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-poppins font-medium !rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Form Modal */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        dispatch={dispatch}
        items={items}
        setCombinedData={setCombinedData}
        availableProductGroups={availableProductGroups}
        singleItems={singleItems}
        mainindex={selectedIndices.mainindex}
        i={selectedIndices.i}
        handleProductGroupChange={handleProductGroupChange}
      />
    </div>
  );
};

export default MaterialSelectionComponent;