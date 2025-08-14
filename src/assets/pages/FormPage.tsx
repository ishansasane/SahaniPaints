/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCustomerData } from "../Redux/dataSlice";
import { RootState } from "../Redux/store";
import CustomerDetails from "../compoonents/CustomerDetails";
import ProjectDetails from "../compoonents/ProjectDetails";
import MaterialSelection from "../compoonents/MaterialSelection";
import MeasurementSection from "../compoonents/MeasurementSection";
import QuotationSection from "../compoonents/QuotationSection";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const FormPage = () => {
  const dispatch = useDispatch();
  const customerData = useSelector((state: RootState) => state.data.customers);

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState<
    { area: string; productGroups: string[] }[]
  >([]);
  const [measurements, setMeasurements] = useState<
    { area: string; size: string }[]
  >([]);
  const [quotation, setQuotation] = useState<any[]>([]);
  const [editing, setEditing] = useState(null);

  // Validation checks
  const isCustomerSelected = !!selectedCustomer;
  const isProjectDetailsFilled = true; // Replace with actual validation logic
  const isMaterialSelected = materials.length > 0;

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

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchCustomers();
      dispatch(setCustomerData(data));
      setCustomers(data);
      console.log("Fetched Customers:", data);
    };

    if (customerData.length === 0) {
      fetchData();
    } else {
      setCustomers(customerData);
      console.log("Using Redux Customer Data:", customerData);
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("Selected Customer:", selectedCustomer);
  }, [selectedCustomer]);

  useEffect(() => {
    console.log("Materials Selected:", materials);
  }, [materials]);

  useEffect(() => {
    console.log("Quotation Data:", quotation);
  }, [quotation]);

  const handleSubmit = () => {
    const formData = {
      selectedCustomer,
      materials,
      measurements,
      quotation,
    };
    console.log("Form Submitted with data:", formData);
    // You can replace this with an API call to submit the form data
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Project Form</h1>

      {/* Customer Details */}
      <CustomerDetails
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        customers={customers}
        setCustomers={setCustomers}
        editing={editing}
        setEditing={setEditing}
      />

      {/* Show Project Details only if Customer is selected */}
      {isCustomerSelected && <ProjectDetails />}

      {/* Show Material Selection */}
      {isCustomerSelected && isProjectDetailsFilled && (
        <>
          <MaterialSelection setMaterials={setMaterials} />
          <QuotationSection
            materials={materials}
            measurements={measurements}
            setQuotation={setQuotation}
          />
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
};

export default FormPage;
