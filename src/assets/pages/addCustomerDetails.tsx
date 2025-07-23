import React from 'react'

function addCustomerDetails() {
  return (
    <div className="flex flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4 rounded-xl shadow-xl w-full border-gray-200 border-2 mt-3">
      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">Customer Details</p>
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-xs sm:text-sm md:text-base">Select Customer</p>
          <select
            className="border p-3 sm:p-2 rounded w-full text-xs sm:text-sm md:text-base"
            value={selectedCustomer ? JSON.stringify(selectedCustomer) : ""}
            onChange={(e) => {
              setSelectedCustomer(e.target.value == "" ? null : JSON.parse(e.target.value));
              projectData[0] = e.target.value;
            }}
          >
            <option value="">Select Customer</option>
            {Array.isArray(customers) &&
              customers.map((customer, index) => (
                <option key={index} value={JSON.stringify(customer)}>
                  {customer[0]}
                </option>
              ))}
          </select>
        </div>
        {selectedCustomer && (
          <div className="flex flex-col w-full smAPRIL:w-1/2">
            <p className="text-xs sm:text-sm md:text-base">Email (optional)</p>
            <input
              type="text"
              className="border p-3 sm:p-2 rounded w-full text-xs sm:text-sm md:text-base"
              value={selectedCustomer[2]}
            />
          </div>
        )}
      </div>
      {selectedCustomer && (
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
          <div className="flex flex-col w-full sm:w-1/2">
            <p className="text-xs sm:text-sm md:text-base">Phone Number</p>
            <input
              type="text"
              className="border p-3 sm:p-2 rounded w-full text-xs sm:text-sm md:text-base"
              value={selectedCustomer[1]}
            />
          </div>
          <div className="flex flex-col w-full sm:w-1/2">
            <p className="text-xs sm:text-sm md:text-base">Alternate Phone Number (optional)</p>
            <input
              type="text"
              className="border p-3 sm:p-2 rounded w-full text-xs sm:text-sm md:text-base"
              value={selectedCustomer[4]}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default addCustomerDetails;