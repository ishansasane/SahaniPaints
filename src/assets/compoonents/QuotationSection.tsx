import { useEffect, useState } from "react";

const QuotationSection = ({ materials, measurements }: any) => {
  const [quotation, setQuotation] = useState<any[]>([]);

  useEffect(() => {
    // Generate quotation based on materials & measurements
    const newQuotation = measurements.map((measurement: any) => ({
      product: measurement.area,
      size: measurement.size,
      mrp: 100, // Example price (you should fetch or calculate this)
      saleRate: 90, // Example discounted price
      quantity: 1,
      tax: 10, // Example tax percentage
    }));

    setQuotation(newQuotation);
  }, [materials, measurements]);

  return (
    <div className="mb-6 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Quotation</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Product</th>
            <th className="border p-2">Size</th>
            <th className="border p-2">MRP</th>
            <th className="border p-2">Sale Rate</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Subtotal</th>
            <th className="border p-2">Tax (%)</th>
            <th className="border p-2">Tax Amount</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
{Array.isArray(quotation) && quotation.length > 0 ? (
  quotation.map((item, index) => {
    const subtotal = (item.saleRate || 0) * (item.quantity || 0);
    const taxAmount = ((subtotal * (item.tax || 0)) / 100);
    const total = subtotal + taxAmount;

    return (
      <tr key={index} className="border">
        <td className="border p-2">{item.product || "-"}</td>
        <td className="border p-2">{item.size || "-"}</td>
        <td className="border p-2">₹{item.mrp || 0}</td>
        <td className="border p-2">₹{item.saleRate || 0}</td>
        <td className="border p-2">
          <input
            type="number"
            value={item.quantity || 1}
            min="1"
            className="w-16 border p-1 text-center"
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 1;
              const updatedQuotation = [...quotation];
              updatedQuotation[index].quantity = newQuantity;
              setQuotation(updatedQuotation);
            }}
          />
        </td>
        <td className="border p-2">₹{subtotal.toFixed(2)}</td>
        <td className="border p-2">{item.tax || 0}%</td>
        <td className="border p-2">₹{taxAmount.toFixed(2)}</td>
        <td className="border p-2 font-semibold">₹{total.toFixed(2)}</td>
      </tr>
    );
  })
) : (
  <tr>
    <td colSpan="9" className="text-center p-4 text-gray-500 italic">
      No quotation items available.
    </td>
  </tr>
)}

        </tbody>
      </table>
    </div>
  );
};

export default QuotationSection;
