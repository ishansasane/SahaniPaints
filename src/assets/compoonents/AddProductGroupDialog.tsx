import { useState, useEffect } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface ProductGroupDialogProps {
  setDialogOpen: (open: boolean) => void;
  setRefresh: (state: boolean) => void;
  refresh: boolean;
  editingGroup: string[];
}

const ProductGroupDialog: React.FC<ProductGroupDialogProps> = ({
  setDialogOpen,
  setRefresh,
  refresh,
  editingGroup,
  setediting,
}) => {
  const data = editingGroup;
  const [groupName, setGroupName] = useState(editingGroup ? data[0] : "");
  const [mainProducts, setMainProducts] = useState(editingGroup ? data[1] : "");
  const [addonProducts, setAddonProducts] = useState(
    editingGroup ? data[2] : ""
  );
  const [color, setColor] = useState(editingGroup ? data[3] : "");
  const [needsTailoring, setNeedsTailoring] = useState<boolean>(
    editingGroup ? Boolean(data[4] === "true") : false
  );

  const handleSubmit = async () => {
    const url = editingGroup
      ? "https://sheeladecor.netlify.app/.netlify/functions/server/updateproductgroup"
      : "https://sheeladecor.netlify.app/.netlify/functions/server/addproductgroup";
    const method = editingGroup ? "POST" : "POST";

    console.log(needsTailoring);

    const response = await fetchWithLoading(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        groupName,
        mainProducts,
        addonProducts,
        color,
        needsTailoring: needsTailoring.toString(),
      }),
    });

    if (response.status === 200) {
      alert(
        editingGroup
          ? "Product group updated successfully"
          : "Product group added successfully"
      );
      setRefresh(!refresh);
      setediting(null);
      setDialogOpen(false);
    } else {
      alert("Error saving product group");
    }
  };

  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-10 z-50 w-full max-w-md">
      <div className="bg-white p-6 rounded shadow-md w-full border">
        <h2 className="text-xl font-bold mb-4">
          {editingGroup ? "Edit Product Group" : "Add Product Group"}
        </h2>
        <input
          className={`${
            editingGroup ? "hidden" : "none"
          } border p-2 rounded w-full mb-2`}
          placeholder="Product Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Main Products"
          value={mainProducts}
          onChange={(e) => setMainProducts(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Addon Products"
          value={addonProducts}
          onChange={(e) => setAddonProducts(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={needsTailoring}
            onChange={(e) => setNeedsTailoring(e.target.checked)}
          />{" "}
          Needs Tailoring
        </label>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => {
              setediting(null);
              setDialogOpen(false);
            }}
          >
            Cancel
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductGroupDialog;
