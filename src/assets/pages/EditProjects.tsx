/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import OverviewPage from "./OverviewPage";
import {
  setTermsData,
  setBankData,
  setPaymentData,
  setSalesAssociateData,
  setInteriorData,
  setCustomerData,
  setProducts,
  setCatalogs,
  setProjects,
  setItemData,
  setProjectFlag,
  setTasks,
  setTailorData,
} from "../Redux/dataSlice";
import CustomerDetails from "./CustomerDetails";
import ProjectDetails from "./ProjectDetails";
import EditCustomerDetails from "./Edit/EditCustomerDetails";
import EditProjectDetails from "./Edit/EditProjectDetails";
import MaterialSelectionComponent from "./MaterialSelectionComponent";
import MeasurementSection from "./MeasurementSections";
import QuotationTable from "./QuotationTable";
import { Disc, Edit } from "lucide-react";
import { FaPlus, FaTrash } from "react-icons/fa";
import PaymentsSection from "./PaymentSection";
import TailorsSection from "./TailorsSection";
import { AnimatePresence, motion } from "framer-motion";
import TaskDialog from "../compoonents/TaskDialog";
import { useCallback } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const EditProjects = ({
  Paid,
  setPaid,
  discountType,
  setDiscountType,
  grandTotal,
  setGrandTotal,
  projectData,
  index,
  goBack,
  projects,
  Tax,
  setTax,
  Amount,
  setAmount,
  Discount,
  setDiscount,
}) => {
  const [currentStatus, setCurrentStatus] = useState("Unsent");
  const [navState, setNavState] = useState("Overview");
  const [status, changeStatus] = useState("approved");

  const dispatch = useDispatch();
  const customerData = useSelector((state: RootState) => state.data.customers);
  const interiorData = useSelector((state: RootState) => state.data.interiors);
  const salesAssociateData = useSelector(
    (state: RootState) => state.data.salesAssociates
  );
  const products = useSelector((state: RootState) => state.data.products);
  const items = useSelector((state: RootState) => state.data.items);
  const paymentData = useSelector((state: RootState) => state.data.paymentData);
  const tailors = useSelector((state: RootState) => state.data.tailors);

  const catalogueData = useSelector((state: RootState) => state.data.catalogs);
  const Tasks = useSelector((state: RootState) => state.data.tasks);
  let availableCompanies = ["D Decor", "Asian Paints", "ZAMAN"];
  const designNo = ["514", "98", "123"];

  const [customers, setcustomers] = useState<[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [singleitems, setsingleitems] = useState([]);

  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);

  const [interior, setinterior] = useState([]);
  const [salesdata, setsalesdata] = useState([]);
  const [availableProductGroups, setAvailableProductGroups] = useState([]);

  const termData = useSelector((state: RootState) => state.data.termsData);
  const bankData = useSelector((state: RootState) => state.data.bankData);

  const [terms, setTerms] = useState("NA");
  const [bank, setBank] = useState("NA");

  const [additionalItems, setAdditionaItems] = useState<additional[]>([]);

  const [editPayments, setEditPayments] = useState(undefined);

  useEffect(() => {
    setDiscountType(discountType);
    setBank(projectData.bankDetails || "NA");
    setTerms(projectData.termsCondiditions || "NA");
    changeStatus(projectData.status || "Approved");
  }, []);

  interface additional {
    name: string;
    quantity: number;
    rate: number;
    netRate: number;
    tax: number;
    taxAmount: number;
    totalAmount: number;
    remark: string;
  }
  const [availableAreas, setAvailableAreas] = useState([]);

  interface AreaSelection {
    area: string;
    areacollection: collectionArea[];
  }

  interface measurements {
    unit;
    width;
    height;
    quantity;
    newquantity;
  }
  interface collectionArea {
    productGroup;
    items: [];
    company;
    catalogue;
    designNo;
    reference;
    measurement: measurements;
    totalAmount: [];
    totalTax: [];
    quantities: [];
  }

  interface ProductGroup {
    groupName: string;
    mainProducts: string;
    addonProducts: string;
    color: string;
    needsTailoring: boolean;
  }
  interface Goods {
    pg;
    date;
    status;
    orderID;
    remark;
    mainindex;
    groupIndex;
    item;
  }

  interface Tailor {
    pg;
    rate;
    tailorData;
    status;
    remark;
    mainindex;
    groupIndex;
    item;
  }
  const units = ["Inches (in)", "Centimeter (cm)", "Meters (m)", "Feet (ft)"];

  const [selections, setSelections] = useState<AreaSelection[]>([]);
  const [interiorArray, setInteriorArray] = useState([]);
  const [salesAssociateArray, setSalesAssociateArray] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [projectReference, setProjectReference] = useState("");
  const [user, setUser] = useState("");
  const [projectDate, setPRojectDate] = useState("");
  const [additionalRequests, setAdditionalRequests] = useState("");
  const [projectAddress, setProjectAddress] = useState("");

  const fetchTaskData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintstasks"
    );
    const data = await response.json();
    return data.body;
  };

  const getItemsData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintssingleproducts"
    );

    const data = await response.json();

    return data.body;
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintscustomerdata",
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data.body) ? data.body : [];
    } catch (error) {
      console.error("Error fetching customer data:", error);
      return [];
    }
  };

  async function fetchAllAreas() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsAreas",
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
      console.error("Error fetching Areas:", error);
      return [];
    }
  }

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

  async function fetchInteriors() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsinteriordata",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.body;
    } catch (error) {
      console.error("Error fetching interiors:", error);
      return [];
    }
  }

  async function fetchSalesAssociates() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintssalesassociatedata",
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
      console.error("Error fetching sales associates:", error);
      return [];
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function fetchProductGroups(): Promise<ProductGroup[]> {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getallproductgroup",
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
      console.error("Error fetching product groups:", error);
      return [];
    }
  }
  const fetchTermsData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsTermsData"
    );
    const data = await response.json();
    return data.body || [];
  };
  const fetchBankData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsBankData"
    );
    const data = await response.json();
    return data.body || [];
  };
  useEffect(() => {
    const fetchAndCacheBankData = async () => {
      if (bankData.length > 0) {
        return;
      } else {
        const data = await fetchBankData();
        dispatch(setBankData(data));
      }
    };

    fetchAndCacheBankData();
  }, [dispatch]);

  useEffect(() => {
    const fetchAndCacheTermData = async () => {
      if (termData.length > 0) {
        return;
      } else {
        const data = await fetchTermsData();
        dispatch(setTermsData(data));
      }
    };

    fetchAndCacheTermData();
  }, [dispatch]);

  useEffect(() => {
    const clonedSelections = Array.isArray(projectData.allData)
      ? JSON.parse(JSON.stringify(projectData.allData))
      : [];

    const clonedAdditionalItems = Array.isArray(projectData.additionalItems)
      ? JSON.parse(JSON.stringify(projectData.additionalItems))
      : [];
    setSelections(clonedSelections);
    setAdditionaItems(clonedAdditionalItems);
    setSelectedCustomer(projectData.customerLink);
    setUser(projectData.createdBy);
    setPRojectDate(projectData.projectDate);
    setAdditionalRequests(projectData.additionalRequests);
    setInteriorArray(projectData.interiorArray);
    setSalesAssociateArray(projectData.salesAssociateArray);
    setProjectReference(projectData.projectReference);
    setProjectAddress(projectData.projectAddres);
    setProjectName(projectData.projectName);
    setProjectReference(projectData.projectReference);
  }, [projectData]);

  // interior data
  useEffect(() => {
    const loadData = async () => {
      if (interiorData.length > 0) {
        setinterior(interiorData);
        return;
      } else {
        const data = await fetchInteriors();
        dispatch(setInteriorData(data));
        setinterior(data);
      }
    };
    loadData();
  }, [dispatch]);

  // items
  useEffect(() => {
    const loadData = async () => {
      if (items.length > 0) {
        setsingleitems(items);
      } else {
        const data = await getItemsData();
        dispatch(setItemData(data));
        setsingleitems(data);
      }
    };
    loadData();
  }, [dispatch]);

  // product groups
  useEffect(() => {
    const loadData = async () => {
      if (products.length > 0) {
        setProductGroups(products);
      } else {
        const data = await fetchProductGroups();
        setProductGroups(data);
        dispatch(setProducts(data));
      }
    };
    loadData();
  }, [dispatch]);

  // catalogues
  useEffect(() => {
    const loadData = async () => {
      if (catalogueData.length > 0) {
        return;
      } else {
        const data = await fetchCatalogues();
        dispatch(setCatalogs(data));
      }
    };
    loadData();
  }, [dispatch]);

  // sales associates
  useEffect(() => {
    const loadData = async () => {
      if (salesAssociateData.length > 0) {
        setsalesdata(salesAssociateData);
      } else {
        const data = await fetchSalesAssociates();
        setsalesdata(data);
        dispatch(setSalesAssociateData(data));
      }
    };
    loadData();
  }, [dispatch]);

  // customers
  useEffect(() => {
    const loadData = async () => {
      if (customerData.length > 0) {
        setcustomers(customerData);
      } else {
        const data = await fetchCustomers();
        setcustomers(data);
        dispatch(setCustomerData(data));
      }
    };
    loadData();
  }, [dispatch]);

  const handleAreaChange = (mainindex, newArea) => {
    // Clone the selections array to avoid direct mutation of state
    const updatedSelections = [...selections];

    // Check if the area exists and update its value
    if (updatedSelections[mainindex]) {
      updatedSelections[mainindex].area = newArea; // Set the new area for the selected index
    }

    // Update the state with the new selections array
    setSelections(updatedSelections);
  };

  const handleProductGroupChange = (
    mainindex: number,
    i: number,
    product: any
  ) => {
    const updatedSelections = [...selections];

    // Ensure areacollection exists
    if (!updatedSelections[mainindex].areacollection) {
      updatedSelections[mainindex].areacollection = [];
    }

    // Ensure the group object exists at index i
    if (!updatedSelections[mainindex].areacollection[i]) {
      updatedSelections[mainindex].areacollection[i] = {
        productGroup: null,
        items: [],
        catalogue: [],
        company: null,
        designNo: null,
        reference: null,
        measurement: {
          unit: "Centimeter (cm)",
          width: undefined,
          height: undefined,
          quantity: undefined,
        },
        totalAmount: [],
        totalTax: [],
        quantities: [],
      };
    }

    updatedSelections[mainindex].areacollection[i].productGroup = product;

    let newMatchedItems: any[] = [];

    // === Case 1: Single Product Item
    if (
      Array.isArray(product) &&
      product.length > 6 &&
      typeof product[6] === "string" &&
      product[6].includes("T")
    ) {
      newMatchedItems = [product];
    }

    // === Case 2 & 3: Product Group (type 1 or 2)
    else if (Array.isArray(product) && product.length >= 3) {
      let mainProduct = product[1];
      let addonProducts: string[] = [];

      // try to parse product[2] as JSON (type 2)
      try {
        addonProducts = JSON.parse(product[2]);
      } catch {
        // not JSON? assume it's a string => treat as type 1, make array
        addonProducts = [product[2]];
      }

      const allProductNames = [mainProduct, ...addonProducts];

      newMatchedItems = allProductNames
        .map((name) => items.find((item) => item[0] === name))
        .filter(Boolean);
    }

    // === Fallback: push as is
    if (newMatchedItems.length === 0) {
      newMatchedItems = [product];
    }

    updatedSelections[mainindex].areacollection[i].items = newMatchedItems;
    setSelections(updatedSelections);

    // === Update goodsArray
    const filteredGoods = goodsArray.filter(
      (g) => !(g.mainindex === mainindex && g.groupIndex === i)
    );

    const newGoods = newMatchedItems.map((item) => ({
      mainindex,
      groupIndex: i,
      pg: product,
      date: "",
      status: "Pending",
      orderID: "",
      remark: "NA",
      item: item,
    }));

    setGoodsArray([...filteredGoods, ...newGoods]);

    // === Update tailorsArray
    const filteredTailors = tailorsArray.filter(
      (t) => !(t.mainindex === mainindex && t.groupIndex === i)
    );

    const newTailors = newMatchedItems
      .filter((item) => item[7] == true)
      .map((item) => ({
        mainindex,
        groupIndex: i,
        pg: product,
        rate: 0,
        tailorData: [""],
        status: "Pending",
        remark: "NA",
        item: item,
      }));

    setTailorsArray([...filteredTailors, ...newTailors]);
  };
  const handleCatalogueChange = (mainindex, i, catalogue) => {
    const updatedSelections = [...selections];

    if (!updatedSelections[mainindex].areacollection) {
      updatedSelections[mainindex].areacollection = [];
    }

    if (!updatedSelections[mainindex].areacollection[i]) {
      updatedSelections[mainindex].areacollection[i] = {
        productGroup: null,
        items: [""],
        catalogue: [],
        company: null,
        designNo: null,
        reference: null,
        measurement: {
          unit: "Centimeter (cm)",
          width: undefined,
          height: undefined,
          quantity: undefined,
        },
        additionalItems: [],
        totalAmount: [],
        totalTax: [],
      };
    }

    updatedSelections[mainindex].areacollection[i].catalogue = catalogue[0]
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);

    setSelections(updatedSelections);
  };

  const handleCompanyChange = (
    mainindex: number,
    i: number,
    company: string
  ) => {
    const updatedSelections = [...selections];

    if (!updatedSelections[mainindex].areacollection) {
      updatedSelections[mainindex].areacollection = [];
    }

    if (!updatedSelections[mainindex].areacollection[i]) {
      updatedSelections[mainindex].areacollection[i] = {
        productGroup: null,
        items: [""],
        catalogue: null,
        company: null,
        designNo: null,
        reference: null,
        measurement: {
          unit: "Centimeter (cm)",
          width: undefined,
          height: undefined,
          quantity: undefined,
        },
        additionalItems: [],
        totalAmount: [],
        totalTax: [],
      };
    }

    updatedSelections[mainindex].areacollection[i].company = company;
    setSelections(updatedSelections);
  };

  const handleDesignNoChange = (mainindex: number, i: number, designNo) => {
    const updatedSelections = [...selections];

    if (!updatedSelections[mainindex].areacollection) {
      updatedSelections[mainindex].areacollection = [];
    }

    if (!updatedSelections[mainindex].areacollection[i]) {
      updatedSelections[mainindex].areacollection[i] = {
        productGroup: null,
        items: [""],
        catalogue: null,
        company: null,
        designNo: null,
        reference: null,
        measurement: {
          unit: "Centimeter (cm)",
          width: undefined,
          height: undefined,
          quantity: undefined,
        },
        additionalItems: [],
        totalAmount: [],
        totalTax: [],
      };
    }

    updatedSelections[mainindex].areacollection[i].designNo = designNo;
    setSelections(updatedSelections);
  };

  const handleReferenceChange = (mainindex: number, i: number, reference) => {
    const updatedSelection = [...selections];

    if (!updatedSelection[mainindex].areacollection) {
      updatedSelection[mainindex].areacollection = [];
    }

    if (!updatedSelection[mainindex].areacollection[i]) {
      updatedSelection[mainindex].areacollection[i] = {
        productGroup: null,
        items: [""],
        catalogue: null,
        company: null,
        designNo: null,
        reference: null,
        measurement: {
          unit: "Centimeter (cm)",
          width: undefined,
          height: undefined,
          quantity: undefined,
        },
        additionalItems: [],
        totalAmount: [],
        totalTax: [],
      };
    }

    updatedSelection[mainindex].areacollection[i].reference = reference;

    setSelections(updatedSelection);
  };

  const handleAddNewGroup = (mainindex: number, productGroupString = "") => {
    const updatedSelections = [...selections];

    if (!updatedSelections[mainindex]?.areacollection) {
      updatedSelections[mainindex].areacollection = [];
    }

    const groupIndex = updatedSelections[mainindex].areacollection.length;

    const productGroupArray = productGroupString
      ? productGroupString.split(",")
      : [];

    const relevantPG =
      productGroupArray.length > 2 ? productGroupArray.slice(1, -2) : [];

    const matchedItems = relevantPG
      .map((pgName) => items.find((item) => item[0] === pgName))
      .filter((item) => Array.isArray(item));

    updatedSelections[mainindex].areacollection.push({
      productGroup: productGroupArray,
      company: "",
      catalogue: [],
      designNo: "",
      reference: "",
      measurement: {
        unit: "Centimeter (cm)",
        width: undefined,
        height: undefined,
        quantity: undefined,
      },
      items: matchedItems,
      additionalItems: [],
      totalAmount: [],
      totalTax: [],
    });

    setSelections(updatedSelections);

    const newGoods = matchedItems.map((item) => ({
      mainindex,
      groupIndex,
      pg: productGroupArray,
      date: "",
      status: "Pending",
      orderID: "",
      remark: "NA",
      item: item,
    }));

    const newTailors = matchedItems
      .filter((item) => item[7] == true)
      .map((item) => ({
        mainindex,
        groupIndex,
        pg: productGroupArray,
        rate: 0,
        tailorData: [""],
        status: "Pending",
        remark: "NA",
        item: item,
      }));

    setGoodsArray((prev) => [...prev, ...newGoods]);
    setTailorsArray((prev) => [...prev, ...newTailors]);
  };

  const handleGroupDelete = (mainindex: number, groupIndex: number) => {
    // 1. Remove the group from selections
    const updatedSelection = [...selections];
    if (updatedSelection[mainindex].areacollection[groupIndex]) {
      updatedSelection[mainindex].areacollection.splice(groupIndex, 1);
    }
    setSelections(updatedSelection);

    // 2. Remove matching entries from goodsArray
    const updatedGoods = goodsArray.filter(
      (g) => !(g.mainindex === mainindex && g.groupIndex === groupIndex)
    );
    setGoodsArray(updatedGoods);

    // 3. Remove matching entries from tailorsArray
    const updatedTailors = tailorsArray.filter(
      (t) => !(t.mainindex === mainindex && t.groupIndex === groupIndex)
    );
    setTailorsArray(updatedTailors);
  };

  const handleAddArea = () => {
    setSelections([...selections, { area: "", areacollection: [] }]);
  };

  const handleRemoveArea = (index: number) => {
    // Remove area from selections
    const updatedSelections = selections.filter((_, i) => i !== index);
    setSelections(updatedSelections);

    // Remove related goods and tailors
    const updatedGoodsArray = goodsArray.filter((g) => g.mainindex !== index);
    const updatedTailorsArray = tailorsArray.filter(
      (t) => t.mainindex !== index
    );

    // Decrement mainindex for all entries after the removed index
    const normalizedGoods = updatedGoodsArray.map((g) =>
      g.mainindex > index ? { ...g, mainindex: g.mainindex - 1 } : g
    );

    const normalizedTailors = updatedTailorsArray.map((t) =>
      t.mainindex > index ? { ...t, mainindex: t.mainindex - 1 } : t
    );

    setGoodsArray(normalizedGoods);
    setTailorsArray(normalizedTailors);
  };

  const handlewidthchange = (mainindex: number, index: number, width) => {
    const updatedSelection = [...selections];
    updatedSelection[mainindex].areacollection[index].measurement.width = width;
    setSelections(updatedSelection);
  };
  const handleheightchange = (mainindex: number, index: number, height) => {
    const updatedSelection = [...selections];
    updatedSelection[mainindex].areacollection[index].measurement.height =
      height;
    setSelections(updatedSelection);
  };

  const recalculateTotals = (
    updatedSelections: AreaSelection[],
    additionalItems: Additional[]
  ) => {
    const selectionTaxArray = updatedSelections.flatMap((selection) =>
      selection.areacollection.flatMap((col) =>
        isNaN(Number(col.totalTax)) ? 0 : Number(col.totalTax)
      )
    );

    const selectionAmountArray = updatedSelections.flatMap((selection) =>
      selection.areacollection.flatMap((col) =>
        isNaN(Number(col.totalAmount)) ? 0 : Number(col.totalAmount)
      )
    );

    const additionalTaxArray = additionalItems.map((item) =>
      isNaN(Number(item.taxAmount)) ? 0 : Number(item.taxAmount)
    );

    const additionalAmountArray = additionalItems.map((item) =>
      isNaN(Number(item.totalAmount)) ? 0 : Number(item.totalAmount)
    );

    const totalTax = Math.round(
      [...selectionTaxArray, ...additionalTaxArray].reduce(
        (acc, curr) => acc + (isNaN(curr) ? 0 : curr),
        0
      )
    );

    const totalAmount = Math.round(
      [...selectionAmountArray, ...additionalAmountArray].reduce(
        (acc, curr) => acc + (isNaN(curr) ? 0 : curr),
        0
      )
    );

    return { totalTax, totalAmount };
  };

  const handlequantitychange = (
    mainIndex: number,
    index: number,
    quantity: number
  ) => {
    const updatedSelections = [...selections];
    const areaCol = updatedSelections[mainIndex].areacollection[index];

    areaCol.measurement.quantity = 1;

    if (!areaCol.quantities) areaCol.quantities = [];
    if (!areaCol.totalTax) areaCol.totalTax = [];
    if (!areaCol.totalAmount) areaCol.totalAmount = [];

    // Step 1: Calculate pre-tax total
    let preTaxTotal = 0;
    areaCol.items?.forEach((item, i) => {
      const itemQty = parseInt(areaCol.quantities?.[i]) || 0;
      const itemRate = parseInt(item[4]) || 0;
      preTaxTotal += quantity * itemQty * itemRate;
    });

    // Step 2: Calculate effective discount %
    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = Discount;
    } else if (discountType === "cash" && preTaxTotal > 0) {
      effectiveDiscountPercent = (Discount / preTaxTotal) * 100;
    }

    // Step 3: Apply discount and tax per item
    areaCol.items = areaCol.items?.map((item, i) => {
      const itemQty = parseInt(areaCol.quantities?.[i]) || 0;
      const itemRate = parseFloat(item[4]) || 0;
      const itemTaxPercent = parseFloat(item[5]) || 0;

      const baseAmount = quantity * itemQty * itemRate;
      const discountAmount = (baseAmount * effectiveDiscountPercent) / 100;
      const discountedAmount = baseAmount - discountAmount;

      const taxAmount = parseFloat(
        ((discountedAmount * itemTaxPercent) / 100).toFixed(2)
      );
      const totalAmount = parseFloat((discountedAmount + taxAmount).toFixed(2));

      areaCol.totalTax[i] = taxAmount;
      areaCol.totalAmount[i] = totalAmount;

      return [...item.slice(0, 6), taxAmount, totalAmount];
    });

    setSelections(updatedSelections);

    // Step 4: Calculate accurate subtotal (without tax)
    const selectionSubtotals = updatedSelections.flatMap((sel) =>
      sel.areacollection.flatMap(
        (col) =>
          col.items?.reduce((acc, itm, idx) => {
            const areaQty = 1;
            const itemQty = parseFloat(col.quantities?.[idx]) || 0;
            const itemRate = parseFloat(itm[4]) || 0;
            return acc + areaQty * itemQty * itemRate;
          }, 0) || 0
      )
    );

    const additionalSubtotals = additionalItems.map(
      (item) => item.quantity * item.rate
    );
    const subtotal = [...selectionSubtotals, ...additionalSubtotals].reduce(
      (a, b) => a + b,
      0
    );
    setAmount(Math.round(subtotal)); // ✅ Subtotal without tax

    // Step 5: Calculate total tax and grand total
    const { totalTax, totalAmount } = recalculateTotals(
      updatedSelections,
      additionalItems
    );
    setTax(Math.round(totalTax));
    setGrandTotal(Math.round(totalAmount)); // ✅ Grand Total with tax
  };

  const handleunitchange = (mainindex: number, index: number, unit) => {
    const updatedSelection = [...selections];
    updatedSelection[mainindex].areacollection[index].measurement.unit = unit;
    setSelections(updatedSelection);
  };
  const [quantities, setQuantities] = useState({});
  const [Received, setReceived] = useState(0);

  const handleQuantityChange = async (
    key: string,
    value: string,
    mainIndex: number,
    collectionIndex: number,
    quantity: string,
    num1: number, // rate
    num2: number, // tax %
    itemIndex: number
  ) => {
    const updatedSelections = structuredClone(selections); // ✅ Deep clone
    const areaCol =
      updatedSelections[mainIndex].areacollection[collectionIndex];

    const quantityNum = 1;
    const valueNum = parseFloat(value) || 0;

    if (!areaCol.quantities) areaCol.quantities = [];
    if (!areaCol.totalTax) areaCol.totalTax = [];
    if (!areaCol.totalAmount) areaCol.totalAmount = [];

    areaCol.quantities[itemIndex] = value;

    const baseCost = num1 * quantityNum * valueNum;

    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = Discount;
    } else if (discountType === "cash") {
      effectiveDiscountPercent = baseCost > 0 ? (Discount / baseCost) * 100 : 0;
    }

    const discountAmount = (baseCost * effectiveDiscountPercent) / 100;
    const discountedCost = baseCost - discountAmount;

    const taxAmount = Math.round((discountedCost * (num2 || 0)) / 100);
    const totalWithTax = Math.round(discountedCost + taxAmount);

    areaCol.totalTax[itemIndex] = taxAmount;
    areaCol.totalAmount[itemIndex] = totalWithTax;

    setSelections(updatedSelections); // ✅ React now sees the change

    const { totalTax, totalAmount } = recalculateTotals(
      updatedSelections,
      additionalItems
    );
    setTax(Math.round(totalTax));
    setAmount(Math.round(totalAmount));

    let discountAmt = 0;
    if (discountType === "percent") {
      discountAmt = (totalAmount * Discount) / 100;
    } else if (discountType === "cash") {
      discountAmt = Discount;
    }

    const grandTotal = parseFloat(totalAmount.toFixed(2));
    setGrandTotal(Math.round(grandTotal));

    calculateSummary(updatedSelections);
  };

  const handleItemQuantityChange = (i: number, quantity: string) => {
    const updated = [...additionalItems];
    const item = updated[i];

    const parsedQuantity = parseFloat(quantity) || 0;
    item.quantity = parsedQuantity;

    // Step 1: Calculate totalBeforeDiscount using all additional items
    const totalBeforeDiscount = updated.reduce(
      (acc, itm) => acc + itm.quantity * itm.rate,
      0
    );

    // Step 2: Determine effective discount percentage
    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = Discount;
    } else if (discountType === "cash" && totalBeforeDiscount > 0) {
      effectiveDiscountPercent = (Discount / totalBeforeDiscount) * 100;
    }

    // Step 3: Apply discount to this specific item
    const baseNetRate = parsedQuantity * item.rate;
    const discountAmount = (baseNetRate * effectiveDiscountPercent) / 100;
    const discountedNetRate = baseNetRate - discountAmount;

    // Step 4: Apply tax on discounted net rate
    const taxAmount = parseFloat(
      ((discountedNetRate * (item.tax || 0)) / 100).toFixed(2)
    );
    const totalAmount = parseFloat((discountedNetRate + taxAmount).toFixed(2));

    item.netRate = parseFloat(discountedNetRate.toFixed(2));
    item.taxAmount = taxAmount;
    item.totalAmount = totalAmount;

    updated[i] = item;

    setAdditionaItems(updated);

    // Step 5: Calculate subtotal (Amount) — this is base price without any tax
    const selectionSubtotals = selections.flatMap((selection) =>
      selection.areacollection.flatMap(
        (col) =>
          col.items?.reduce((acc, item, idx) => {
            const areaQty = 1;
            const itemQty = parseFloat(col.quantities?.[idx]) || 0;
            const itemRate = parseFloat(item[4]) || 0;
            return acc + areaQty * itemQty * itemRate;
          }, 0) || 0
      )
    );

    const additionalSubtotals = updated.map((itm) => itm.quantity * itm.rate);

    const pureSubtotal = [...selectionSubtotals, ...additionalSubtotals].reduce(
      (acc, val) => acc + val,
      0
    );

    setAmount(Math.round(pureSubtotal)); // ✅ Subtotal without tax

    // Step 6: Recalculate grand total and tax
    const { totalTax, totalAmount: grandSubtotal } = recalculateTotals(
      selections,
      updated
    );
    setTax(Math.round(totalTax));
    setGrandTotal(Math.round(grandSubtotal)); // ✅ Grand total including tax
  };

  const handleAddMiscItem = () => {
    setAdditionaItems((prev) => [
      ...prev,
      {
        name: "",
        quantity: 0,
        rate: 0,
        netRate: 0,
        tax: 0,
        taxAmount: 0,
        totalAmount: 0,
        remark: "",
      },
    ]);
  };

  // Delete item by index
  const handleDeleteMiscItem = (itemIndex: number) => {
    const updated = [...additionalItems];
    updated.splice(itemIndex, 1);
    setAdditionaItems(updated);

    // Step 1: Recalculate Subtotal (pure base price, no tax)
    const selectionSubtotals = selections.flatMap((selection) =>
      selection.areacollection.flatMap(
        (col) =>
          col.items?.reduce((acc, item, idx) => {
            const areaQty = 1;
            const itemQty = parseFloat(col.quantities?.[idx]) || 0;
            const itemRate = parseFloat(item[4]) || 0;
            return acc + areaQty * itemQty * itemRate;
          }, 0) || 0
      )
    );

    const additionalSubtotals = updated.map((itm) => itm.quantity * itm.rate);

    const pureSubtotal = [...selectionSubtotals, ...additionalSubtotals].reduce(
      (acc, val) => acc + val,
      0
    );

    setAmount(Math.round(pureSubtotal)); // ✅ Subtotal without tax

    // Step 2: Recalculate Tax and Total (including tax)
    const { totalTax, totalAmount } = recalculateTotals(selections, updated);
    setTax(Math.round(totalTax));

    // Step 3: Optional: Apply Discount Amount for Display (not used in calculation here)
    let discountAmt = 0;
    if (discountType === "percent") {
      discountAmt = parseFloat(((pureSubtotal * Discount) / 100).toFixed(2));
    } else if (discountType === "cash") {
      discountAmt = Discount;
    }

    // Step 4: Set Grand Total (already includes discount inside recalculateTotals if you coded it there)
    setGrandTotal(Math.round(totalAmount));
  };
  const [itemTax, setItemTax] = useState(0);
  const [itemTotal, setItemTotal] = useState(0);

  const handleItemNameChange = (i, value) => {
    const updated = [...additionalItems];
    updated[i].name = value;
    setAdditionaItems(updated);
  };

  const recalculateItemTotals = (items: Additional[]) => {
    let totalTax = 0;
    let totalAmount = 0;

    // Calculate total before tax to determine effective cash discount if needed
    const totalBeforeDiscount = items.reduce(
      (acc, item) => acc + item.quantity * item.rate,
      0
    );

    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = Discount;
    } else if (discountType === "cash" && totalBeforeDiscount > 0) {
      effectiveDiscountPercent = (Discount / totalBeforeDiscount) * 100;
    }

    const updatedItems = items.map((item) => {
      const baseNet = item.quantity * item.rate;
      const discountAmount = (baseNet * effectiveDiscountPercent) / 100;
      const discountedNet = baseNet - discountAmount;

      const taxAmt = parseFloat(
        ((discountedNet * (item.tax || 0)) / 100).toFixed(2)
      );
      const totalAmt = parseFloat((discountedNet + taxAmt).toFixed(2));

      totalTax += taxAmt;
      totalAmount += totalAmt;

      return {
        ...item,
        netRate: parseFloat(discountedNet.toFixed(2)),
        taxAmount: Math.round(taxAmt),
        totalAmount: Math.round(totalAmt),
      };
    });

    setAdditionaItems(updatedItems);
    setItemTax(Math.round(totalTax));
    setItemTotal(Math.round(totalAmount));
  };

  const handleItemRateChange = (i: number, rate: string) => {
    const updated = [...additionalItems];
    const item = updated[i];

    item.rate = parseFloat(rate) || 0;
    const baseNet = item.quantity * item.rate;

    // Step 1: Calculate total before discount (for cash discount % conversion)
    const totalBeforeDiscount = updated.reduce(
      (acc, itm) => acc + itm.quantity * itm.rate,
      0
    );

    // Step 2: Determine effective discount %
    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = Discount;
    } else if (discountType === "cash" && totalBeforeDiscount > 0) {
      effectiveDiscountPercent = (Discount / totalBeforeDiscount) * 100;
    }

    // Step 3: Apply discount and compute tax
    const discountAmount = (baseNet * effectiveDiscountPercent) / 100;
    const discountedNet = baseNet - discountAmount;

    item.netRate = parseFloat(discountedNet.toFixed(2));
    item.taxAmount = parseFloat(
      ((discountedNet * (item.tax || 0)) / 100).toFixed(2)
    );
    item.totalAmount = parseFloat((item.netRate + item.taxAmount).toFixed(2));

    updated[i] = item;

    setAdditionaItems(updated);

    // ===== Recalculate Subtotal (Without Tax) =====
    const selectionSubtotals = selections.flatMap((selection) =>
      selection.areacollection.flatMap(
        (col) =>
          col.items?.reduce((acc, item, idx) => {
            const areaQty = 1;
            const itemQty = parseFloat(col.quantities?.[idx]) || 0;
            const itemRate = parseFloat(item[4]) || 0;
            return acc + areaQty * itemQty * itemRate;
          }, 0) || 0
      )
    );

    const additionalSubtotals = updated.map((itm) => itm.quantity * itm.rate);

    const subTotalOnly = [...selectionSubtotals, ...additionalSubtotals].reduce(
      (acc, val) => acc + val,
      0
    );

    setAmount(Math.round(subTotalOnly)); // ✅ Subtotal without tax

    const { totalTax, totalAmount } = recalculateTotals(selections, updated);
    setTax(Math.round(totalTax));
    setGrandTotal(Math.round(totalAmount)); // ✅ Grand total including tax
  };

  const handleItemTaxChange = (i: number, tax: string) => {
    const updated = [...additionalItems];
    const item = updated[i];

    item.tax = parseFloat(tax) || 0;
    const baseNet = item.quantity * item.rate;

    // Step 1: Calculate total before discount (for cash discount % conversion)
    const totalBeforeDiscount = updated.reduce(
      (acc, itm) => acc + itm.quantity * itm.rate,
      0
    );

    // Step 2: Determine effective discount %
    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = Discount;
    } else if (discountType === "cash" && totalBeforeDiscount > 0) {
      effectiveDiscountPercent = (Discount / totalBeforeDiscount) * 100;
    }

    // Step 3: Apply discount and compute tax
    const discountAmount = (baseNet * effectiveDiscountPercent) / 100;
    const discountedNet = baseNet - discountAmount;

    item.netRate = parseFloat(discountedNet.toFixed(2));
    item.taxAmount = parseFloat(
      ((discountedNet * (item.tax || 0)) / 100).toFixed(2)
    );
    item.totalAmount = parseFloat((item.netRate + item.taxAmount).toFixed(2));

    updated[i] = item;

    setAdditionaItems(updated);

    // ===== Recalculate Subtotal (Without Tax) =====
    const selectionSubtotals = selections.flatMap((selection) =>
      selection.areacollection.flatMap(
        (col) =>
          col.items?.reduce((acc, item, idx) => {
            const areaQty = 1;
            const itemQty = parseFloat(col.quantities?.[idx]) || 0;
            const itemRate = parseFloat(item[4]) || 0;
            return acc + areaQty * itemQty * itemRate;
          }, 0) || 0
      )
    );

    const additionalSubtotals = updated.map((itm) => itm.quantity * itm.rate);

    const subTotalOnly = [...selectionSubtotals, ...additionalSubtotals].reduce(
      (acc, val) => acc + val,
      0
    );

    setAmount(Math.round(subTotalOnly)); // ✅ Subtotal without tax

    const { totalTax, totalAmount } = recalculateTotals(selections, updated);
    setTax(Math.round(totalTax));
    setGrandTotal(Math.round(totalAmount)); // ✅ Grand total including tax
  };
  const handleItemRemarkChange = (i, remark) => {
    const updated = [...additionalItems];
    updated[i].remark = remark;
    setAdditionaItems(updated);
  };

  const [goodsArray, setGoodsArray] = useState<Goods[]>([]);
  const [tailorsArray, setTailorsArray] = useState<Tailor[]>([]);

  useEffect(() => {
    const deepClone = (data) => JSON.parse(JSON.stringify(data));
    setAdditionaItems(deepClone(projectData.additionalItems));
    setGoodsArray(deepClone(projectData.goodsArray));
    setTailorsArray(deepClone(projectData.tailorsArray));
  }, [projectData]);

  const [selectedMainIndex, setSelectedMainIndex] = useState(null);
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState(null);

  const setGoodsDate = (index, date) => {
    let newarray = [...goodsArray];
    newarray[index].date = date;
    setGoodsArray(newarray);
  };
  const setGoodsStatus = (index, status) => {
    let newarray = [...goodsArray];
    newarray[index].status = status;
    setGoodsArray(newarray);
  };
  const setGoodsOrderID = (index, orderID) => {
    let newarray = [...goodsArray];
    newarray[index].orderID = orderID;
    setGoodsArray(newarray);
  };
  const setGoodsRemark = (index, remark) => {
    let newarray = [...goodsArray];
    newarray[index].remark = remark;
    setGoodsArray(newarray);
  };

  const [payment, setPayment] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");

  const [addPayment, setAddPayment] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchPaymentData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsPayments"
    );
    const data = await response.json();
    return data.message;
  };

  const fetchTailorData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/gettailors"
    );
    const data = await response.json();
    return data.body;
  };

  const hasFetchedPayments = useRef(false);
  const [added, setAdded] = useState(false);

  // === PAYMENT DATA ===
  useEffect(() => {
    let isMounted = true;
    const fetchPayment = async () => {
      try {
        const cachedPayments = paymentData;

        if (cachedPayments.length > 0) {
          setPayment(paymentData);
        } else {
          const fresh = await fetchPaymentData();
          dispatch(setPaymentData(fresh));
          setPayment(fresh);
        }
        const totalReceived = paymentData.reduce((sum, record) => {
          if (record[1] === projectData.projectName) {
            const amount = parseFloat(record[2]);
            return sum + (isNaN(amount) ? 0 : amount);
          }
          return sum;
        }, 0);

        setReceived(totalReceived);
      } catch (error) {
        console.error("❌ Failed to fetch payment data:", error);
      }
    };

    if (!added) fetchPayment();

    return () => {
      isMounted = false;
    };
  }, [added, dispatch, projectData.projectName]);

  // === TAILOR DATA ===
  useEffect(() => {
    const fetchTailors = async () => {
      try {
        if (tailors.length > 0) {
          setTailorsArray(tailors);
        } else {
          const fresh = await fetchTailorData();
          dispatch(setTailorData(fresh));
          setTailorsArray(fresh);
        }
      } catch (error) {
        console.error("❌ Failed to fetch tailor data:", error);
      }
    };

    fetchTailors();
  }, [dispatch, tailors]);

  useEffect(() => {
    const getAreas = async () => {
      try {
        const response = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsAreas"
        );
        const data = await response.json();
        setAvailableAreas(data.body || []); // Even if empty, it's fine
      } catch (error) {
        console.error("Error fetching areas:", error);
        setAvailableAreas([]); // Optional: set empty array in case of error
      }
    };

    getAreas();
  }, []); // Only run once when component mounts

  // Only re-run when availableAreas length changes

  const addPaymentFunction = async () => {
    const isEdit = editPayments != null;

    const url = isEdit
      ? "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintsPayments"
      : "https://sheeladecor.netlify.app/.netlify/functions/server/addPaintsPayment";

    const payload = {
      customerName: projectData.customerLink[0],
      Name: projectData.projectName,
      Received: payment,
      ReceivedDate: paymentDate,
      PaymentMode: paymentMode,
      Remarks: paymentRemarks,
    };

    try {
      const response = await fetchWithLoading(url, {
        credentials: "include",
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(isEdit ? "Payment updated" : "Payment added");

        // ✅ Reset form states
        setAddPayment(false);
        setPayment(0);
        setPaymentDate("");
        setPaymentMode("");
        setPaymentRemarks("");
        setAdded((prev) => !prev); // trigger useEffect if needed

        // ✅ Refresh payment data
        const latestPayments = await fetchPaymentData();
        dispatch(setPaymentData(latestPayments));
      } else {
        alert("Error submitting payment");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Network or server error");
    }
  };

  const deletePayment = async (p, pd, pm, re) => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintsPayment",
      {
        credentials: "include",
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          customerName: projectData.customerLink[0],
          Name: projectData.projectName,
          Received: p,
          ReceivedDate: pd,
          PaymentMode: pm,
          Remarks: re,
        }),
      }
    );

    if (response.status == 200) {
      const latestPayments = await fetchPaymentData();
      dispatch(setPaymentData(latestPayments));
      alert("Deleted");
      if (added) {
        setAdded(false);
      } else {
        setAdded(true);
      }
    } else {
      alert("Error");
    }
  };

  const [taskFilter, setTaskFilter] = useState("All Tasks");
  const statusArray = ["Pending", "Ordered", "Received", "In Stock"];

  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    if (
      !Array.isArray(Tasks) ||
      Tasks.length === 0 ||
      !projectData?.projectName
    ) {
      setFilteredTasks([]); // If no tasks or no project, show empty list
      return;
    }

    const filtered = Tasks.filter(
      (task) => task[5] === projectData.projectName
    ).filter((task) => {
      if (taskFilter === "All Tasks") return true;
      return task[7] === taskFilter;
    });

    setFilteredTasks(filtered);
  }, [taskFilter, projectData, Tasks]);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editing, setediting] = useState<[]>(null);

  const [name, setName] = useState("");

  useEffect(() => {
    async function taskData() {
      if (Tasks.length == 0) {
        const data = await fetchTaskData();
        dispatch(setTasks(data));
      }
    }
    taskData();
  }, [dispatch, taskDialogOpen]);

  const deleteTask = async (name: string) => {
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
    if (response.ok) {
      const data = await fetchTaskData();
      dispatch(setTasks(data));
      alert("Task Deleted");
    } else {
      alert("Error in Deleting Task");
    }
  };

  const bankDetails = ["123123", "!23123", "!2312331"];
  const termsCondiditions = ["asdasd", "asasda"];

  const updateTailorData = (index, data) => {
    const formattedData = data.split(",").map((item) => item.trim()); // split and trim spaces
    const newtailors = [...tailorsArray];
    newtailors[index].tailorData = formattedData;
    setTailorsArray(newtailors);
  };

  const updateTailorRate = (index, data) => {
    const newtailors = [...tailorsArray];
    newtailors[index].rate = data;
    setTailorsArray(newtailors);
  };
  const updateTailorStatus = (index, data) => {
    const newtailors = [...tailorsArray];
    newtailors[index].status = data;
    setTailorsArray(newtailors);
  };
  const updateTailorRemark = (index, data) => {
    const newtailors = [...tailorsArray];
    newtailors[index].remark = data;
    setTailorsArray(newtailors);
  };

  const setCancelPayment = () => {
    if (editPayments) {
      setPayment(0);
      setPaymentDate("");
      setPaymentMode("");
      setPaymentRemarks("NA");
      setAddPayment(false);
    } else {
      setAddPayment(false);
    }
  };

  const handleDiscountChange = (
    newDiscount: number,
    newDiscountType: string
  ) => {
    setDiscount(newDiscount);
    setDiscountType(newDiscountType);

    const updatedSelections = [...selections];
    const updatedAdditionalItems = [...additionalItems];

    let totalBaseAmount = 0;

    // === First: Calculate total base (pre-tax, pre-discount) ===
    updatedSelections.forEach((selection) => {
      selection.areacollection.forEach((areaCol) => {
        const areaQuantity = 1;

        let areaBase = 0;
        areaCol.items?.forEach((item, i) => {
          const itemQty = parseFloat(areaCol.quantities?.[i]) || 0;
          const itemRate = parseFloat(item[4]) || 0;
          areaBase += areaQuantity * itemQty * itemRate;
        });

        areaCol._baseAmount = areaBase; // Store temporarily
        totalBaseAmount += areaBase;
      });
    });

    const additionalBase = updatedAdditionalItems.reduce(
      (acc, item) => acc + item.quantity * item.rate,
      0
    );

    totalBaseAmount += additionalBase;

    // === Calculate discount ratio ===
    const isPercent = newDiscountType === "percent";
    const discountPercent = isPercent
      ? newDiscount
      : totalBaseAmount > 0
      ? (newDiscount / totalBaseAmount) * 100
      : 0;

    const discountRatio = discountPercent / 100;

    // === Apply to Selections ===
    updatedSelections.forEach((selection) => {
      selection.areacollection.forEach((areaCol) => {
        const areaQuantity = 1;
        const areaBase = areaCol._baseAmount || 0;

        if (!areaCol.totalTax) areaCol.totalTax = [];
        if (!areaCol.totalAmount) areaCol.totalAmount = [];

        areaCol.items = areaCol.items?.map((item, i) => {
          const itemQty = parseFloat(areaCol.quantities?.[i]) || 0;
          const itemRate = parseFloat(item[4]) || 0;
          const itemTaxPercent = parseFloat(item[5]) || 0;

          const baseAmount = areaQuantity * itemQty * itemRate;

          const itemDiscount = baseAmount * discountRatio;
          const discountedAmount = baseAmount - itemDiscount;

          const taxAmount = parseFloat(
            ((discountedAmount * itemTaxPercent) / 100).toFixed(2)
          );
          const totalAmount = parseFloat(
            (discountedAmount + taxAmount).toFixed(2)
          );

          areaCol.totalTax[i] = taxAmount;
          areaCol.totalAmount[i] = totalAmount;

          return [
            ...item.slice(0, 6),
            Math.round(taxAmount),
            Math.round(totalAmount),
          ];
        });
      });
    });

    // === Apply to Additional Items ===
    updatedAdditionalItems.forEach((item) => {
      const baseNet = item.quantity * item.rate;
      const itemDiscount = baseNet * discountRatio;
      const discountedNet = baseNet - itemDiscount;

      item.netRate = parseFloat(discountedNet.toFixed(2));
      item.taxAmount = parseFloat(
        ((discountedNet * (item.tax || 0)) / 100).toFixed(2)
      );
      item.totalAmount = parseFloat((item.netRate + item.taxAmount).toFixed(2));
    });

    // === Final Totals Calculation ===
    const selectionTaxArray = updatedSelections.flatMap((selection) =>
      selection.areacollection.flatMap((col) => col.totalTax || [])
    );

    const selectionAmountArray = updatedSelections.flatMap((selection) =>
      selection.areacollection.flatMap((col) => col.totalAmount || [])
    );

    const additionalTaxArray = updatedAdditionalItems.map(
      (item) => parseFloat(item.taxAmount?.toString()) || 0
    );

    const additionalAmountArray = updatedAdditionalItems.map(
      (item) => parseFloat(item.totalAmount?.toString()) || 0
    );

    const totalTax = parseFloat(
      [...selectionTaxArray, ...additionalTaxArray]
        .reduce((acc, val) => acc + val, 0)
        .toFixed(2)
    );

    const totalAmount = parseFloat(
      [...selectionAmountArray, ...additionalAmountArray]
        .reduce((acc, val) => acc + val, 0)
        .toFixed(2)
    );

    setSelections(updatedSelections);
    setAdditionaItems(updatedAdditionalItems);
    setTax(Math.round(totalTax));
    setAmount(Math.round(totalBaseAmount));
    setGrandTotal(Math.round(totalAmount));
    setGrandTotal(Math.round(parseFloat(totalAmount.toFixed(2))));
  };

  const fetchProjectData = async () => {
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

    if (!data.body || !Array.isArray(data.body)) {
      throw new Error("Invalid data format: Expected an array in data.body");
    }

    const parseSafely = (value: any, fallback: any) => {
      try {
        return typeof value === "string"
          ? JSON.parse(value)
          : value || fallback;
      } catch (error) {
        console.warn("Invalid JSON:", value, error);
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
        return [];
      } catch {
        try {
          const cleaned = input
            .replace(/^\[|\]$/g, "")
            .split(",")
            .map((item: string) => item.trim().replace(/^"+|"+$/g, ""));
          return cleaned;
        } catch {
          return [];
        }
      }
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

  const sendProjectData = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/updatepaintsprojectdata",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            projectName: projectData.projectName,
            customerLink: JSON.stringify(selectedCustomer),
            projectReference,
            status,
            totalAmount: Amount,
            totalTax: Tax,
            paid: Paid,
            discount: Discount,
            createdBy: user,
            allData: JSON.stringify(selections),
            projectDate,
            additionalRequests,
            interiorArray: JSON.stringify(interiorArray),
            salesAssociateArray: JSON.stringify(salesAssociateArray),
            additionalItems: JSON.stringify(additionalItems),
            goodsArray: JSON.stringify(goodsArray),
            tailorsArray: JSON.stringify(tailorsArray),
            projectAddress: JSON.stringify(projectAddress),
            grandTotal,
            discountType,
            bankDetails: JSON.stringify(bank),
            termsConditions: JSON.stringify(terms),
          }),
        }
      );

      if (response.status === 200) {
        alert("Project Edited");
        const updatedData = await fetchProjectData();
        dispatch(setProjects(updatedData));
        localStorage.setItem(
          "projectData",
          JSON.stringify({ data: updatedData, time: Date.now() })
        );
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        alert("Error: Failed to add project");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Error: Network issue or server not responding");
    }
  };
  const [editableMRP, setEditableMRP] = useState({});

  const calculateSummary = (updatedSelections) => {
    let newSubtotal = 0;
    let newTax = 0;
    let newTotal = 0;

    updatedSelections.forEach((selection) => {
      selection.areacollection.forEach((collection) => {
        const taxArr = collection.totalTax || [];
        const totalArr = collection.totalAmount || [];

        newTax += taxArr.reduce((sum, val) => sum + (val || 0), 0);
        newTotal += totalArr.reduce((sum, val) => sum + (val || 0), 0);
      });
    });

    newSubtotal = newTotal - newTax;

    setAmount(newSubtotal);
    setTax(newTax);
    setGrandTotal(newTotal);
  };

  const handleMRPChange = (
    mainIndex,
    collectionIndex,
    value,
    measurementQuantity,
    taxRate,
    qty,
    itemIndex
  ) => {
    const updatedSelections = structuredClone(selections);
    const newMRP = parseFloat(value.toString() || "0");

    const collection =
      updatedSelections[mainIndex].areacollection[collectionIndex];
    collection.items[itemIndex][4] = newMRP;

    const subtotal = newMRP * qty;

    // Apply discount
    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = Discount;
    } else if (discountType === "cash") {
      effectiveDiscountPercent = subtotal > 0 ? (Discount / subtotal) * 100 : 0;
    }

    const discountAmount = (subtotal * effectiveDiscountPercent) / 100;
    const discountedSubtotal = subtotal - discountAmount;

    const taxAmount = (discountedSubtotal * parseFloat(taxRate || 0)) / 100;
    const totalWithTax = discountedSubtotal + taxAmount;

    collection.totalTax[itemIndex] = parseFloat(taxAmount.toFixed(2));
    collection.totalAmount[itemIndex] = parseFloat(totalWithTax.toFixed(2));

    setSelections(updatedSelections);

    // Recalculate overall summary
    const selectionAmountArray = updatedSelections.flatMap((selection) =>
      selection.areacollection.flatMap((col) =>
        col.items.reduce((acc, item, idx) => {
          const itemQty = parseFloat(col.quantities?.[idx] || 0);
          const itemRate = parseFloat(item[4] || 0);
          return acc + itemQty * itemRate;
        }, 0)
      )
    );

    const additionalAmountArray = additionalItems.map(
      (item) => item.quantity * item.rate
    );

    const subTotalOnly = [
      ...selectionAmountArray,
      ...additionalAmountArray,
    ].reduce((acc, val) => acc + val, 0);

    setAmount(Math.round(subTotalOnly));

    const { totalTax, totalAmount } = recalculateTotals(
      updatedSelections,
      additionalItems
    );
    setTax(Math.round(totalTax));
    setGrandTotal(Math.round(totalAmount));
  };

  return (
    <div className="md:p-6 ">
      <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <p className=" font-semibold">Order Overview</p>
          <button
            onClick={goBack}
            className="mb-4 px-3 py-1 text-white bg-red-500 !rounded"
          >
            ← Back
          </button>
        </div>
        <div className="flex flex-wrap gap-1 flex-col md:flex-row w-full max-w-full justify-between mb-2 sm:mb-3 bg-sky-50 px-1 sm:!px-4 py-1 sm:!py-4  !rounded-lg">
          <button
            className={`w-full bg-blue-200 !rounded-md p-2 sm:w-auto text-sm sm:text-base ${
              navState === "Overview" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Overview")}
          >
            Overview
          </button>
          <button
            className={`w-full p-2  bg-blue-200 !rounded-md sm:w-auto text-sm sm:text-base ${
              navState === "Customer & Project Details"
                ? "text-sky-700 font-semibold"
                : ""
            }`}
            onClick={() => setNavState("Customer & Project Details")}
          >
            Customer & Project Details
          </button>
          <button
            className={`w-full  bg-blue-200 p-2 !rounded-md sm:w-auto text-sm sm:text-base ${
              navState === "Material Selection"
                ? "text-sky-700 font-semibold"
                : ""
            }`}
            onClick={() => setNavState("Material Selection")}
          >
            Material Selection
          </button>
          <button
            className={`w-full  bg-blue-200 p-2 !rounded-md sm:w-auto text-sm sm:text-base ${
              navState === "Measurement" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Measurement")}
          >
            Measurement
          </button>
          <button
            className={`w-full  bg-blue-200 p-2 !rounded-md sm:w-auto text-sm sm:text-base ${
              navState === "Quotation" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Quotation")}
          >
            Quotation
          </button>
          <button
            className={`w-full  bg-blue-200 p-2 !rounded-md sm:w-auto text-sm sm:text-base ${
              navState === "Goods" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Goods")}
          >
            Goods
          </button>
          <button
            className={`w-full  bg-blue-200 p-2 !rounded-md sm:w-auto text-sm sm:text-base ${
              navState === "Tailors" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Tailors")}
          >
            Tailors
          </button>
          <button
            className={`w-full bg-blue-200 p-2 !rounded-md sm:w-auto text-sm sm:text-base ${
              navState === "Payments" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Payments")}
          >
            Payments
          </button>
          <button
            className={`w-full bg-blue-200 !rounded-md p-2 sm:w-auto text-sm sm:text-base ${
              navState === "Tasks" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Tasks")}
          >
            Tasks
          </button>
        </div>
        {navState == "Overview" && (
          <div className="flex flex-col justify-between">
            <OverviewPage
              projectData={projectData}
              status={status}
              setStatus={changeStatus}
              tasks={Tasks}
              setNavState={setNavState}
              tailorsArray={tailorsArray}
              setTailorsArray={setTailorsArray}
              goodsArray={goodsArray}
              setGoodsArray={setGoodsArray}
              projectDate={projectDate}
              setPRojectDate={setPRojectDate}
              interiorArray={interiorArray}
              salesAssociateArray={salesAssociateArray}
              projects={projects}
              setAddPayment={setAddPayment}
              addPayment={addPayment}
              paymentData={paymentData}
            />
            <div className="flex flex-row justify-between mt-3">
              <button
                onClick={() => setNavState("Tasks")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Customer & Project Details")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState == "Customer & Project Details" && (
          <div className="flex flex-col gap-3">
            <EditCustomerDetails
              customers={customers}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              projectData={projectData}
              setcustomers={setcustomers}
            />
            <EditProjectDetails
              selectedCustomer={selectedCustomer}
              interior={interior}
              salesdata={salesdata}
              interiorArray={interiorArray}
              setInteriorArray={setInteriorArray}
              salesAssociateArray={salesAssociateArray}
              setSalesAssociateArray={setSalesAssociateArray}
              projectName={projectName}
              setProjectName={setProjectName}
              projectReference={projectReference}
              setProjectReference={setProjectReference}
              user={user}
              setUser={setUser}
              projectDate={projectDate}
              setProjectDate={setPRojectDate}
              setAdditionalRequests={setAdditionalRequests}
              additionalRequests={additionalRequests}
              projectData={projectData}
              setSalesData={setsalesdata}
            />
            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Overview")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Material Selection")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState == "Material Selection" && (
          <div className="flex flex-col gap-3">
            <MaterialSelectionComponent
              selections={selections}
              availableAreas={availableAreas}
              availableProductGroups={availableProductGroups}
              availableCompanies={availableCompanies}
              catalogueData={catalogueData}
              designNo={designNo}
              handleAddArea={handleAddArea}
              handleRemoveArea={handleRemoveArea}
              handleAreaChange={handleAreaChange}
              handleAddNewGroup={handleAddNewGroup}
              handleProductGroupChange={handleProductGroupChange}
              handleCompanyChange={handleCompanyChange}
              handleCatalogueChange={handleCatalogueChange}
              handleDesignNoChange={handleDesignNoChange}
              handleReferenceChange={handleReferenceChange}
              handleGroupDelete={handleGroupDelete}
              projectData={projectData}
              setAvailableAreas={setAvailableAreas}
              singleItems={singleitems}
            />
            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Customer & Project Details")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Measurement")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState == "Measurement" && (
          <div className="flex flex-col gap-3">
            <MeasurementSection
              selections={selections}
              units={units}
              handleRemoveArea={handleRemoveArea}
              handleReferenceChange={handleReferenceChange}
              handleunitchange={handleunitchange}
              handlewidthchange={handlewidthchange}
              handleheightchange={handleheightchange}
              handlequantitychange={handlequantitychange}
              handleGroupDelete={handleGroupDelete}
            />
            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Material Selection")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Quotation")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState === "Quotation" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col p-6 sm:p-8 !rounded-2xl shadow-lg w-full bg-white border border-gray-100 transition-all duration-300 hover:shadow-xl">
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                Quotation
              </p>
              <div className="flex flex-col gap-6 w-full">
                {selections.map((selection, mainindex) => (
                  <div key={mainindex} className="w-full">
                    <p className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
                      {selection.area}
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs sm:text-sm min-w-[600px] sm:min-w-full">
                        <thead>
                          <tr className="flex flex-col sm:flex-row justify-between w-full bg-gray-50 p-3 border-b border-gray-200 font-semibold text-gray-600 hidden sm:flex">
                            <td className="w-full sm:w-[10%] py-2 text-center">
                              Sr. No.
                            </td>
                            <td className="w-full sm:w-[45%] py-2">
                              Product Name
                            </td>
                            <td className="w-full sm:w-[45%] py-2">Size</td>
                            <td className="w-full sm:w-[20%] py-2 text-center">
                              MRP
                            </td>
                            <td className="w-full sm:w-[20%] py-2 text-center">
                              Quantity
                            </td>
                            <td className="w-full sm:w-[20%] py-2 text-center">
                              Subtotal
                            </td>
                            <td className="w-full sm:w-[20%] py-2 text-center">
                              Tax Rate (%)
                            </td>
                            <td className="w-full sm:w-[20%] py-2 text-center">
                              Tax Amount
                            </td>
                            <td className="w-full sm:w-[20%] py-2 text-center">
                              Total
                            </td>
                          </tr>
                        </thead>
                        <tbody>
                          {selection.areacollection &&
                          selection.areacollection.length > 0 ? (
                            selection.areacollection.map(
                              (collection, collectionIndex) => {
                                if (!Array.isArray(collection.items)) {
                                  return (
                                    <tr key={`error-${collectionIndex}`}>
                                      <td
                                        colSpan={9}
                                        className="text-center text-red-500 text-xs sm:text-sm py-3"
                                      >
                                        No items found for collection{" "}
                                        {collectionIndex + 1}
                                      </td>
                                    </tr>
                                  );
                                }

                                return collection.items.map(
                                  (item, itemIndex) => {
                                    const key = `${mainindex}-${collectionIndex}-${itemIndex}`;
                                    const qty =
                                      collection.quantities?.[itemIndex] || 0;

                                    return (
                                      <tr
                                        key={key}
                                        className="flex flex-col sm:flex-row justify-between w-full border-b border-gray-100 p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-150"
                                      >
                                        <td className="w-full sm:w-[10%] text-xs sm:text-sm py-2 sm:text-center before:content-['Sr._No.:_'] sm:before:content-none before:font-semibold before:pr-2 text-gray-700">
                                          {itemIndex + 1}
                                        </td>
                                        <td className="w-full sm:w-[45%] text-xs sm:text-sm py-2 before:content-['Product_Name:_'] sm:before:content-none before:font-semibold before:pr-2 text-gray-700">
                                          {item[0]}
                                        </td>
                                        <td className="w-full sm:w-[45%] text-xs sm:text-sm py-2 before:content-['Size:_'] sm:before:content-none before:font-semibold before:pr-2 text-gray-700">
                                          {collection.measurement.width +
                                            " x " +
                                            collection.measurement.height +
                                            " " +
                                            collection.measurement.unit}
                                        </td>
                                        <td
                                          className="w-full sm:w-[20%] py-2 sm:text-center
                                          before:content-['MRP:_'] sm:before:content-none
                                          before:font-semibold before:pr-2"
                                        >
                                          <input
                                            type="text"
                                            inputMode="decimal"
                                            value={
                                              editableMRP[
                                                `${mainindex}-${collectionIndex}-${itemIndex}`
                                              ] ??
                                              (item[4] !== undefined
                                                ? Math.round(
                                                    item[4]
                                                  ).toLocaleString("en-IN")
                                                : "")
                                            }
                                            onChange={(e) => {
                                              const formattedVal =
                                                e.target.value.replace(
                                                  /,/g,
                                                  ""
                                                ); // Remove commas
                                              const num =
                                                parseFloat(formattedVal) || 0;

                                              setEditableMRP((prev) => ({
                                                ...prev,
                                                [`${mainindex}-${collectionIndex}-${itemIndex}`]:
                                                  num.toLocaleString("en-IN"),
                                              }));

                                              handleMRPChange(
                                                mainindex,
                                                collectionIndex,
                                                num,
                                                collection.measurement.quantity,
                                                item[5],
                                                collection.quantities?.[
                                                  itemIndex
                                                ] || 0,
                                                itemIndex
                                              );
                                            }}
                                            onBlur={() => {
                                              setEditableMRP((prev) => {
                                                const newState = { ...prev };
                                                delete newState[
                                                  `${mainindex}-${collectionIndex}-${itemIndex}`
                                                ];
                                                return newState;
                                              });
                                            }}
                                            className="border border-gray-200 w-max sm:w-4/5 px-3 py-2 !rounded-lg text-xs sm:text-sm bg-gray-50
             focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                            onWheel={(e) =>
                                              e.currentTarget.blur()
                                            }
                                          />
                                        </td>

                                        <td className="w-full sm:w-[20%] py-2 before:content-['Quantity:_'] sm:before:content-none before:font-semibold before:pr-2">
                                          <div className="flex flex-col">
                                            <input
                                              type="text"
                                              value={
                                                collection.quantities?.[
                                                  itemIndex
                                                ] || ""
                                              }
                                              onChange={(e) =>
                                                handleQuantityChange(
                                                  key,
                                                  e.target.value,
                                                  mainindex,
                                                  collectionIndex,
                                                  collection.measurement
                                                    .quantity,
                                                  item[4],
                                                  item[5],
                                                  itemIndex
                                                )
                                              }
                                              className="border border-gray-200 w-max sm:w-4/5 px-3 py-2 !rounded-lg text-xs sm:text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                            />
                                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                              {item[3]}
                                            </p>
                                          </div>
                                        </td>
                                        <td className="w-full sm:w-[20%] text-xs sm:text-sm py-2 sm:text-center before:content-['Subtotal:_'] sm:before:content-none before:font-semibold before:pr-2 text-gray-700">
                                          {Math.round(
                                            item[4] * qty
                                          ).toLocaleString("en-IN")}
                                        </td>
                                        <td className="w-full sm:w-[20%] py-2 sm:text-center before:content-['Tax_Rate_(%):_'] sm:before:content-none before:font-semibold before:pr-2">
                                          <input
                                            type="text"
                                            value={item[5] || ""}
                                            onChange={(e) => {
                                              const newTaxRate =
                                                parseFloat(e.target.value) || 0;

                                              const updatedSelections = [
                                                ...selections,
                                              ];
                                              const areaCollection =
                                                updatedSelections[mainindex]
                                                  .areacollection[
                                                  collectionIndex
                                                ];

                                              // ✅ Safely update tax rate
                                              const newItem = [
                                                ...areaCollection.items[
                                                  itemIndex
                                                ],
                                              ];
                                              newItem[5] = newTaxRate;
                                              areaCollection.items[itemIndex] =
                                                newItem;

                                              const mrp = newItem[4] || 0;
                                              const quantity =
                                                areaCollection.quantities?.[
                                                  itemIndex
                                                ] || 0;
                                              const subtotal = mrp * quantity;
                                              const taxAmount =
                                                (subtotal * newTaxRate) / 100;
                                              const totalAmount =
                                                subtotal + taxAmount;

                                              areaCollection.totalTax[
                                                itemIndex
                                              ] = taxAmount;
                                              areaCollection.totalAmount[
                                                itemIndex
                                              ] = totalAmount;

                                              setSelections(updatedSelections);

                                              // ✅ Update summary
                                              calculateSummary(
                                                updatedSelections
                                              );
                                            }}
                                            className="border border-gray-200 w-max sm:w-4/5 px-3 py-2 !rounded-lg text-xs sm:text-sm bg-gray-50
      focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                          />
                                        </td>

                                        <td className="w-full sm:w-[20%] text-xs sm:text-sm py-2 sm:text-center before:content-['Tax_Amount:_'] sm:before:content-none before:font-semibold before:pr-2 text-gray-700">
                                          {collection.totalTax[itemIndex]
                                            ? Math.round(
                                                collection.totalTax[itemIndex]
                                              ).toLocaleString("en-IN")
                                            : "0"}
                                        </td>
                                        <td className="w-full sm:w-[20%] text-xs sm:text-sm py-2 sm:text-center before:content-['Total:_'] sm:before:content-none before:font-semibold before:pr-2 text-gray-700">
                                          {collection.totalAmount[itemIndex]
                                            ? Math.round(
                                                collection.totalAmount[
                                                  itemIndex
                                                ]
                                              ).toLocaleString("en-IN")
                                            : "0"}
                                        </td>
                                      </tr>
                                    );
                                  }
                                );
                              }
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan={9}
                                className="text-center py-3 text-gray-500 text-xs sm:text-base"
                              >
                                No product data available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border border-gray-100 p-4 sm:p-6 md:p-8 rounded-2xl w-full flex flex-col mt-4 bg-white shadow-md transition-all duration-300 hover:shadow-lg">
                <p className="text-sm sm:text-base md:text-lg font-bold text-gray-700 mb-3 sm:mb-4">
                  Miscellaneous
                </p>
                <div className="flex w-full flex-col">
                  <div className="flex flex-row justify-between items-center mb-3 sm:mb-4">
                    <button
                      className="flex flex-row gap-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-500 text-indigo-600 px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200"
                      onClick={handleAddMiscItem}
                    >
                      <FaPlus className="text-indigo-600 w-4 h-4" />
                      Add Item
                    </button>
                  </div>
                  <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="w-full bg-white text-xs min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs sm:text-sm font-semibold border-b border-gray-200">
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                            SR
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4">
                            Item Name
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                            Quantity
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                            Rate
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                            Net Rate
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                            Tax (%)
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                            Tax Amount
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                            Total Amount
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4">Remark</th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="w-full">
                        {additionalItems.map((item, i) => (
                          <tr
                            key={i}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm text-gray-700">
                              {i + 1}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700">
                              <input
                                onChange={(e) =>
                                  handleItemNameChange(i, e.target.value)
                                }
                                className="w-full min-w-[120px] border border-gray-200 rounded-lg px-2 sm:px-3 py-2 text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                value={item.name || ""}
                                type="text"
                              />
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-700">
                              <input
                                onChange={(e) =>
                                  handleItemQuantityChange(i, e.target.value)
                                }
                                className="w-full min-w-[60px] border border-gray-200 rounded-lg px-2 sm:px-3 py-2 text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                value={item.quantity || ""}
                                type="number"
                                min="0"
                              />
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-700">
                              <input
                                onChange={(e) =>
                                  handleItemRateChange(i, e.target.value)
                                }
                                className="w-full min-w-[80px] border border-gray-200 rounded-lg px-2 sm:px-3 py-2 text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                value={
                                  Math.round(item.rate).toLocaleString(
                                    "en-IN"
                                  ) || ""
                                }
                                type="number"
                                min="0"
                              />
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm text-gray-700">
                              {Math.round(item.netRate).toLocaleString(
                                "en-IN"
                              ) || "0"}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-700">
                              <input
                                onChange={(e) =>
                                  handleItemTaxChange(i, e.target.value)
                                }
                                className="w-full min-w-[50px] border border-gray-200 rounded-lg px-2 sm:px-3 py-2 text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                value={item.tax || ""}
                                type="number"
                                min="0"
                              />
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm text-gray-700">
                              {Math.round(item.taxAmount).toLocaleString(
                                "en-IN"
                              ) || "0"}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm text-gray-700">
                              {Math.round(item.totalAmount).toLocaleString(
                                "en-IN"
                              ) || "0"}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700">
                              <input
                                onChange={(e) =>
                                  handleItemRemarkChange(i, e.target.value)
                                }
                                className="w-full min-w-[120px] border border-gray-200 rounded-lg px-2 sm:px-3 py-2 text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                value={item.remark || ""}
                                type="text"
                              />
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                              <button onClick={() => handleDeleteMiscItem(i)}>
                                <FaTrash className="text-red-500 hover:text-red-600 w-4 h-4 transition-colors duration-200" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-between w-full">
              <div className="bg-white p-6 sm:p-8 !rounded-2xl shadow-lg border border-gray-100 w-full sm:w-1/2 transition-all duration-300 hover:shadow-xl">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 tracking-tight">
                  Bank Details & Terms
                </h3>
                <div className="space-y-6">
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value.split(","))}
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Bank Details</option>
                    {Array.isArray(bankData) && bankData.length > 0 ? (
                      bankData.map((data, index) => (
                        <option
                          key={index}
                          value={data}
                          className="overflow-y-scroll"
                        >
                          Account Name: {data?.[0] || "NA"} - Bank:{" "}
                          {data?.[1] || "NA"} - Account Number:{" "}
                          {data?.[4] || "N/A"}
                        </option>
                      ))
                    ) : (
                      <option disabled>No bank accounts available</option>
                    )}
                  </select>
                  <textarea
                    placeholder="Bank Details Description"
                    value={`Bank: ${
                      bank[1] == "NA" ? "" : bank[1]
                    }\nAccount Name: ${
                      bank[0] == "NA" ? "" : bank[0]
                    }\nAccount Number: ${
                      bank[4] == "NA" ? "" : bank[4]
                    }\nIFSC code: ${bank[5] == "NA" ? "" : bank[5]}\nBranch: ${
                      bank[2] == "NA" ? "" : bank[2]
                    }\nPincode: ${bank[3] == "NA" ? "" : bank[3]}`}
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                    rows={5}
                  ></textarea>
                  <select
                    value={terms}
                    onChange={(e) => setTerms(e.target.value.split(","))}
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Terms & Conditions</option>
                    {Array.isArray(termData) && termData.length > 0 ? (
                      termData.map((data, index) => (
                        <option key={index} value={data}>
                          {data?.[0] || "N/A"}
                        </option>
                      ))
                    ) : (
                      <option disabled>No terms available</option>
                    )}
                  </select>
                  <textarea
                    placeholder="Terms & Conditions Description"
                    className="w-full border border-gray-200 !rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                    rows={4}
                    value={`Terms & Conditions: ${
                      terms == "NA" ? "" : terms[0]
                    }`}
                  ></textarea>
                </div>
              </div>
              <div className="bg-white p-6 sm:p-8 !rounded-2xl shadow-lg border border-gray-100 w-full sm:w-1/2 transition-all duration-300 hover:shadow-xl">
                <p className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
                  Summary
                </p>
                <div className="flex flex-row justify-between w-full text-xs sm:text-sm text-gray-600 mb-3">
                  <p>Sub Total</p>
                  <p>{Amount.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-row justify-between w-full text-xs sm:text-sm text-gray-600 mb-3">
                  <p>Total Tax Amount</p>
                  <p>{Tax.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-row justify-between w-full text-xs sm:text-sm text-gray-600 mb-3">
                  <p>Total Amount</p>
                  <p>{Math.round(Amount + Tax).toLocaleString("en-IN")}</p>
                </div>
                <div className="border-t border-gray-200 my-3"></div>
                <div className="flex justify-between w-full text-xs sm:text-sm text-gray-600 mb-3">
                  <p>Discount</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={discountType}
                      onChange={(e) =>
                        handleDiscountChange(Discount, e.target.value)
                      }
                      className="border border-gray-200 !rounded-lg px-3 py-2 text-xs sm:text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                    >
                      {discountType === "cash" ? (
                        <>
                          <option value="cash">₹</option>
                          <option value="percent">%</option>
                        </>
                      ) : (
                        <>
                          <option value="percent">%</option>
                          <option value="cash">₹</option>
                        </>
                      )}
                    </select>
                    <input
                      className="w-20 sm:w-24 border border-gray-200 !rounded-lg px-3 py-2 text-xs sm:text-sm text-right bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                      value={Discount === 0 ? "" : Discount}
                      onChange={(e) => {
                        const newValue =
                          e.target.value === ""
                            ? 0
                            : parseFloat(e.target.value);
                        handleDiscountChange(newValue, discountType);
                      }}
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
                <div className="border-t border-gray-200 my-3"></div>
                <div className="flex w-full flex-row items-center justify-between text-xs sm:text-sm text-gray-600">
                  <p>Grand Total</p>
                  <p>{Math.round(grandTotal).toLocaleString("en-IN")}</p>
                </div>
                <button
                  onClick={sendProjectData}
                  className="!rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs sm:text-sm mt-4 font-medium transition-colors duration-200 w-full sm:w-auto"
                >
                  Edit Project & Generate Quote
                </button>
              </div>
            </div>
            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Measurement")}
                className="!rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Goods")}
                className="!rounded-lg bg-indigo-600 text-white px-4 py-2 text-xs sm:text-sm hover:bg-indigo-700 transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState == "Goods" && (
          <div className="flex flex-col w-full gap-3 mt-3">
            <div className="w-full">
              <p className="text-base sm:text-lg font-semibold mb-2">Goods</p>
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 flex flex-col sm:flex-row text-center hidden sm:flex">
                    <th className="w-full sm:w-[10%] py-1 text-xs sm:text-sm">
                      Sr.No.
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Area
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Product Group
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Company
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Catalogue
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Design No
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Date
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Status
                    </th>
                    <th className="w-full sm:w-[10%] py-1 text-xs sm:text-sm">
                      Order ID
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Remark
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {goodsArray !== undefined &&
                    goodsArray.map((goods, index) => {
                      const selection = selections[goods.mainindex];
                      const collection =
                        selection?.areacollection?.[goods.groupIndex];

                      // ✅ Skip this row if collection is undefined
                      if (!collection) return null;

                      return (
                        <tr
                          key={index}
                          className="flex flex-col sm:flex-row text-center border-b sm:border-b-0"
                        >
                          <td className="w-full sm:w-[10%] py-1 text-xs sm:text-sm before:content-['Sr.No.:_'] sm:before:content-none before:font-bold before:pr-2">
                            {index + 1}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Area:_'] sm:before:content-none before:font-bold before:pr-2">
                            {selection?.area || ""}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Product_Group:_'] sm:before:content-none before:font-bold before:pr-2">
                            {goods?.item?.[0] || ""}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Company:_'] sm:before:content-none before:font-bold before:pr-2">
                            {collection.company ? collection.company[0] : "NA"}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Catalogue:_'] sm:before:content-none before:font-bold before:pr-2">
                            {collection?.catalogue || ""}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Design_No:_'] sm:before:content-none before:font-bold before:pr-2">
                            {collection?.designNo || ""}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Date:_'] sm:before:content-none before:font-bold before:pr-2">
                            <input
                              type="date"
                              className="border !rounded-lg w-full px-2 py-1 text-xs sm:text-sm text-center sm:min-w-[100px]"
                              value={goods?.date || ""}
                              onChange={(e) =>
                                setGoodsDate(index, e.target.value)
                              }
                            />
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Status:_'] sm:before:content-none before:font-bold before:pr-2">
                            <select
                              className="border !rounded-lg w-full px-2 py-1 text-xs sm:text-sm sm:min-w-[100px]"
                              value={goods?.status || ""}
                              onChange={(e) =>
                                setGoodsStatus(index, e.target.value)
                              }
                            >
                              {statusArray.map((data, i) => (
                                <option key={i} value={data}>
                                  {data}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="w-full sm:w-[10%] py-1 text-xs sm:text-sm before:content-['Order_ID:_'] sm:before:content-none before:font-bold before:pr-2">
                            <input
                              type="text"
                              className="border !rounded-lg w-full px-2 py-1 text-xs sm:text-sm text-center sm:min-w-[80px]"
                              value={goods?.orderID || ""}
                              onChange={(e) =>
                                setGoodsOrderID(index, e.target.value)
                              }
                            />
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Remark:_'] sm:before:content-none before:font-bold before:pr-2">
                            <input
                              type="text"
                              className="border !rounded-lg w-full px-2 py-1 text-xs sm:text-sm sm:min-w-[100px]"
                              value={goods?.remark || ""}
                              onChange={(e) =>
                                setGoodsRemark(index, e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Quotation")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Tailors")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState === "Tailors" && (
          <TailorsSection
            updateTailorRate={updateTailorRate}
            updateTailorRemark={updateTailorRemark}
            updateTailorData={updateTailorData}
            updateTailorStatus={updateTailorStatus}
            tailors={tailors}
            statusArray={statusArray}
            selections={selections}
            setNavState={setNavState}
            tailorsArray={tailorsArray}
            setTailorsArray={setTailorsArray}
          />
        )}
        {navState == "Payments" && (
          <PaymentsSection
            addPayment={addPayment}
            setAddPayment={setAddPayment}
            Amount={Amount}
            Tax={Tax}
            Received={Paid}
            Discount={Discount}
            paymentData={paymentData}
            deletePayment={deletePayment}
            setNavState={setNavState}
            setEditPayments={setEditPayments}
            setPayment={setPayment}
            setPaymentDate={setPaymentDate}
            setPaymentRemarks={setPaymentRemarks}
            setPaymentMode={setPaymentMode}
            projectData={projectData}
            discountType={discountType}
          />
        )}
        {addPayment && (
          <div className="flex flex-col z-50 justify-between gap-3 w-[50vw] border !rounded-xl p-3">
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <p className=" ">Amount Received</p>
                <p className="text-red-500">*</p>
              </div>
              <input
                type="text"
                value={payment}
                className="border-1 !rounded-lg pl-2 h-8"
                onChange={(e) =>
                  setPayment(
                    e.target.value == "" ? 0 : parseFloat(e.target.value)
                  )
                }
              />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <p className=" ">Payment Date</p>
                <p className="text-red-500">*</p>
              </div>
              <input
                type="date"
                value={paymentDate}
                className="border-1 !rounded-lg pl-2 h-8 pr-2"
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <p className=" ">Payment Mode</p>
                <p className="text-red-500">*</p>
              </div>
              <input
                type="text"
                value={paymentMode}
                className="border-1 !rounded-lg pl-2 h-8"
                onChange={(e) => setPaymentMode(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <p className=" ">Remarks</p>
                <p className="text-red-500">*</p>
              </div>
              <input
                type="text"
                value={paymentRemarks}
                className="border-1 !rounded-lg pl-2 h-8"
                onChange={(e) => setPaymentRemarks(e.target.value)}
              />
            </div>
            <div className="flex flex-row justify-end gap-3">
              <button
                onClick={() => {
                  if (editPayments != undefined) {
                    setEditPayments(undefined);
                  }
                  setCancelPayment();
                }}
                style={{ borderRadius: "8px" }}
                className="border-2 border-sky-700 text-sky-600 bg-white px-2 h-8"
              >
                Close
              </button>
              <button
                onClick={() => addPaymentFunction()}
                style={{ borderRadius: "8px" }}
                className={`${
                  editPayments == undefined ? "" : "hidden"
                } text-white bg-sky-600 hover:bg-sky-700 px-2 h-8`}
              >
                Add Payment
              </button>
              <button
                onClick={() => addPaymentFunction()}
                style={{ borderRadius: "8px" }}
                className={`${
                  editPayments != undefined ? "" : "hidden"
                } text-white bg-sky-600 hover:bg-sky-700 px-2 h-8`}
              >
                Edit Payment
              </button>
            </div>
          </div>
        )}
        {navState == "Tasks" && (
          <div className="flex flex-col w-full justify-between gap-3 mt-3 p-3">
            <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-2">
              <p className="font-semibold">Tasks</p>
              <button
                onClick={() => setTaskDialogOpen(true)}
                className="bg-sky-600 text-white hover:bg-sky-700 px-2 h-8 !rounded-lg"
              >
                Add Task
              </button>
            </div>

            {/* Task Filters - Responsive wrap */}
            <div className="flex flex-wrap gap-5">
              {["All Tasks", "To Do", "In Progress", "Completed"].map(
                (label) => (
                  <div className="flex flex-col gap-3" key={label}>
                    <button
                      onClick={() => setTaskFilter(label)}
                      className="text-gray-600 font-semibold"
                    >
                      {label}
                    </button>
                    <div
                      className={`${
                        taskFilter !== label ? "bg-white" : "bg-sky-500"
                      } w-full h-[2px] !rounded-full`}
                    ></div>
                  </div>
                )
              )}
            </div>

            {/* Responsive Table Wrapper */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[900px] p-3">
                <thead>
                  <tr>
                    <td>Sr.No.</td>
                    <td>Task Name</td>
                    <td>Priority</td>
                    <td>Project</td>
                    <td>Assignee</td>
                    <td>Due Date</td>
                    <td>Status</td>
                    <td>Created At</td>
                    <td>Actions</td>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, index) => (
                    <tr
                      key={index}
                      className="max-h-fit border-b border-gray-200 py-3"
                    >
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2">{task[0]}</td>
                      <td
                        className={`py-2 font-semibold ${
                          task[6] === "Low"
                            ? "text-green-600"
                            : task[6] === "Moderate"
                            ? "text-yellow-600"
                            : task[6] === "High"
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {task[6]}
                      </td>
                      <td className="py-2">{task[5]}</td>
                      <td className="py-2">{task[4]}</td>
                      <td className="py-2">{task[2]}</td>
                      <td
                        className={`py-2 font-semibold ${
                          task[7] === "Completed"
                            ? "text-green-600"
                            : task[7] === "In Progress"
                            ? "text-yellow-600"
                            : task[7] === "To Do"
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {task[7]}
                      </td>
                      <td className="py-2">{task[3]}</td>
                      <td className="flex flex-row gap-2 items-center py-2">
                        <button
                          onClick={() => {
                            setName(task[0]);
                            setediting(task);
                            setTaskDialogOpen(true);
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button onClick={() => deleteTask(task[0])}>
                          <FaTrash size={18} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Payments")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Overview")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {taskDialogOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setTaskDialogOpen(false)}
              />
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <TaskDialog
                  onClose={() => setTaskDialogOpen(false)}
                  isEditing={editing}
                  setediting={setediting}
                  name={name}
                  projectData={projects}
                  setTaskDialogOpen={setTaskDialogOpen}
                  taskDialogOpen={taskDialogOpen}
                  setProjectFlag={setProjectFlag}
                  setAdded={setAdded}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EditProjects;
