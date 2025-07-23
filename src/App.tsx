import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar, { SidebarContext } from "./assets/compoonents/Sidebar";
import { useState } from "react";

import Dashboard from "./assets/pages/Dashboard";
import ColourPage from "./assets/pages/ColourPage.tsx";
import Projects from "./assets/pages/Projects";
import Customers from "./assets/pages/Customers";
import Masters from "./assets/pages/Masters";
import Tasks from "./assets/pages/Tasks";
import Reports from "./assets/pages/Reports";
import SettingsPage from "./assets/pages/SettingsPage";
import FormPage from "./assets/pages/FormPage";
import Store from "./assets/compoonents/Store.tsx";
import Items from "./assets/compoonents/Items.tsx";
import ProductGroup from "./assets/compoonents/ProductGroup.tsx";
import Brands from "./assets/compoonents/Brands.tsx";
import Catalogues from "./assets/compoonents/Catalogues.tsx";
import Interiors from "./assets/compoonents/Interiors.tsx";
import Tailors from "./assets/compoonents/Tailors.tsx";
import SalesAssociate from "./assets/compoonents/SalesAssociate.tsx";
import SaleSummery from "./assets/compoonents/SaleSummery.tsx";
import CustomerWise from "./assets/compoonents/CustomerWise.tsx";
import ProductGroupWise from "./assets/compoonents/ProductGroupWise.tsx";
import Login from "./assets/compoonents/Login.tsx";
import PassReset from "./assets/compoonents/ForgotPage.tsx";
import NewPass from "./assets/compoonents/NewPass.tsx";
import Register from "./assets/compoonents/Register.tsx";
import VerifyMail from "./assets/compoonents/VerifyMail.tsx";
import ProductFormPage from "./assets/pages/ProductFormPage.tsx";
import ProductGroupForm from "./assets/pages/ProductGroupForm.tsx";
import AddProjectForm from "./assets/pages/AddProjectForm.tsx";
import BrandDialog from "./assets/compoonents/BrandDialog.tsx";
import CatalogueDialog from "./assets/compoonents/CatalogueDialog.tsx";
import InteriorDialog from "./assets/compoonents/InteriorDialog.tsx";
import TailorDialog from "./assets/compoonents/TailorDialog.tsx";
import SalesAssociateDialog from "./assets/compoonents/SalesAssociateDialog.tsx";
import StoreDialog from "./assets/compoonents/StoreDialog.tsx";
import EditProjects from "./assets/pages/EditProjects.tsx";
import AddCustomerDialog from "./assets/compoonents/AddCustomerDialog.tsx";
import Areas from "./assets/compoonents/Areas.tsx";
import Payments from "./assets/pages/Payments.tsx";
import DuePage from "./assets/pages/DuePage.tsx";
import ProtectedRoute from "./auth/ProtectedRoute.tsx";
import TokenHandler from "./auth/TokenHandler.tsx";
import BankDetails from "./assets/pages/BankDetails.tsx";
import TermsAndConditions from "./assets/pages/TermsAndConditions.tsx";
import addSitePage from "./assets/pages/addSitePage.tsx";

// 🔽 NEW: Redux for loading state
import { useSelector } from "react-redux";
import { RootState } from "./Redux/Store";
import LaborsAttendance from "./assets/pages/LaborsAttendance.tsx";
import AddSitePage from "./assets/pages/addSitePage.tsx";
import LaborsPage from "./assets/pages/LaborsPage.tsx";

function App() {
  const [expanded, setExpanded] = useState(true);
  const loading = useSelector((state: RootState) => state.data.loading); // 🔽 track loading state

  return (
    <SidebarContext.Provider
      value={{ expanded, toggleSidebar: () => setExpanded((prev) => !prev) }}
    >
      <Router>
        {/* 🔽 Global Fullscreen Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-[6px] border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-center text-blue-600 font-medium">
                Loading...
              </p>
            </div>
          </div>
        )}

        <TokenHandler />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyMail />} />
          <Route path="/forgotpass" element={<PassReset />} />
          <Route path="/forgotpass/reset/:token" element={<NewPass />} />

          {/* Protected App */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen">
                  <Sidebar />
                  <div className="flex-1 overflow-y-auto h-screen p-6 transition-all">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route
                        path="/add-product"
                        element={<ProductFormPage />}
                      />
                      <Route
                        path="/product-group-form"
                        element={<ProductGroupForm />}
                      />
                      <Route path="/add-site" element={<AddSitePage />} />
                      <Route path="/masters" element={<Masters />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/add-project" element={<AddProjectForm />} />
                      <Route path="/brand-dilog" element={<BrandDialog />} />
                      <Route
                        path="/catalogue-dialog"
                        element={<CatalogueDialog />}
                      />
                      <Route
                        path="/interior-dialog"
                        element={<InteriorDialog />}
                      />
                      <Route
                        path="/attendance"
                        element={<LaborsAttendance />}
                      />

                      <Route path="/masters/labours" element={<LaborsPage />} />
                      <Route path="/tailor-dialog" element={<TailorDialog />} />
                      <Route
                        path="/sales-associateDialog"
                        element={<SalesAssociateDialog />}
                      />
                      <Route path="/store-dialog" element={<StoreDialog />} />
                      <Route
                        path="/add-customer"
                        element={<AddCustomerDialog />}
                      />
                      <Route path="/paymentsPage" element={<Payments />} />
                      <Route path="/duePage" element={<DuePage />} />
                      <Route path="/areas" element={<Areas />} />

                      {/* Masters Subroutes */}
                      <Route path="/masters/colors" element={<ColourPage />} />
                      <Route path="/masters/stores" element={<Store />} />
                      <Route path="/masters/items" element={<Items />} />
                      <Route
                        path="/masters/product-groups"
                        element={<ProductGroup />}
                      />
                      <Route path="/masters/brands" element={<Brands />} />
                      <Route
                        path="/masters/catalogues"
                        element={<Catalogues />}
                      />
                      <Route
                        path="/masters/interiors"
                        element={<Interiors />}
                      />
                      <Route path="/masters/tailors" element={<Tailors />} />
                      <Route
                        path="/masters/sales-associate"
                        element={<SalesAssociate />}
                      />

                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </SidebarContext.Provider>
  );
}

export default App;
