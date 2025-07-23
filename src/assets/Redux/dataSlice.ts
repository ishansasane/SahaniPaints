import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DataState {
  products: any[];
  brands: [];
  catalogs: any[];
  interiors: any[];
  tailors: [];
  salesAssociates: [];
  tasks: any[];
  projects: any[];
  customers: [];
  stores: any[];
  items: [];
  taskDialogOpen: boolean;
  projectFlag: boolean;
  paymentData: [];
  companyData: any[];
  designData: any[];
  inquiry: any[];
  bankData: any[];
  termsData: any[];
  loading: boolean; // <-- Added loading state
}

const initialState: DataState = {
  products: [],
  brands: [],
  catalogs: [],
  interiors: [],
  tailors: [],
  salesAssociates: [],
  tasks: [],
  projects: [],
  customers: [],
  stores: [],
  items: [],
  taskDialogOpen: false,
  projectFlag: false,
  paymentData: [],
  companyData: [],
  designData: [],
  inquiry: [],
  bankData: [],
  termsData: [],
  loading: false, // <-- Initialized loading state
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<any[]>) => {
      state.products = action.payload;
    },
    setBrandData: (state, action: PayloadAction<[]>) => {
      state.brands = action.payload;
    },
    setCatalogs: (state, action: PayloadAction<any[]>) => {
      state.catalogs = action.payload;
    },
    setInteriorData: (state, action: PayloadAction<any[]>) => {
      state.interiors = action.payload;
    },
    setTailorData: (state, action: PayloadAction<[]>) => {
      state.tailors = action.payload;
    },
    setSalesAssociateData: (state, action: PayloadAction<[]>) => {
      state.salesAssociates = action.payload;
    },
    setTasks: (state, action: PayloadAction<any[]>) => {
      state.tasks = action.payload;
    },
    setProjects: (state, action: PayloadAction<any[]>) => {
      state.projects = action.payload;
    },
    setCustomerData: (state, action: PayloadAction<[]>) => {
      state.customers = action.payload;
    },
    setStoreData: (state, action: PayloadAction<any[]>) => {
      state.stores = action.payload;
    },
    setItemData: (state, action: PayloadAction<[]>) => {
      state.items = action.payload;
    },
    setTaskDialogOpen: (state, action: PayloadAction<false>) => {
      state.taskDialogOpen = action.payload;
    },
    setProjectFlag: (state, action: PayloadAction<false>) => {
      state.projectFlag = action.payload;
    },
    setPaymentData: (state, action: PayloadAction<[]>) => {
      state.paymentData = action.payload;
    },
    setCompanyData: (state, action: PayloadAction<any[]>) => {
      state.companyData = action.payload;
    },
    setDesignData: (state, action: PayloadAction<any[]>) => {
      state.designData = action.payload;
    },
    setInquiryData: (state, action: PayloadAction<any[]>) => {
      state.inquiry = action.payload;
    },
    setBankData: (state, action: PayloadAction<any[]>) => {
      state.bankData = action.payload;
    },
    setTermsData: (state, action: PayloadAction<any[]>) => {
      state.termsData = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setProducts,
  setBrandData,
  setCatalogs,
  setInteriorData,
  setTailorData,
  setSalesAssociateData,
  setTasks,
  setProjects,
  setCustomerData,
  setStoreData,
  setItemData,
  setTaskDialogOpen,
  setProjectFlag,
  setPaymentData,
  setCompanyData,
  setDesignData,
  setInquiryData,
  setBankData,
  setTermsData,
  setLoading, // <-- Export this too
} = dataSlice.actions;

export default dataSlice.reducer;
