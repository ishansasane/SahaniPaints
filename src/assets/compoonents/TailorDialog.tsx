import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface TailorDialogProps {
  setDialogOpen: (open: boolean) => void;
  setRefresh: (state: boolean) => void;
  refresh: boolean;
  editingTailor: string[];
  setEditingTailor: (tailor: null) => void;
}

const TailorDialog: React.FC<TailorDialogProps> = ({
  setDialogOpen,
  setRefresh,
  refresh,
  editingTailor,
  setEditingTailor,
}) => {
  const navigate = useNavigate();
  const data = editingTailor;
  const [tailorName, setTailorName] = useState(editingTailor ? data[0] : "");
  const [phoneNumber, setPhoneNumber] = useState(editingTailor ? data[1] : "");
  const [email, setEmail] = useState(editingTailor ? data[2] : "");
  const [address, setAddress] = useState(editingTailor ? data[3] : "");

  const handleSubmit = async () => {
    const url = editingTailor
      ? "https://sheeladecor.netlify.app/.netlify/functions/server/updatetailor"
      : "https://sheeladecor.netlify.app/.netlify/functions/server/addtailor";
    const method = "POST";

    const response = await fetchWithLoading(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tailorName, phoneNumber, email, address }),
    });

    if (response.status === 200) {
      alert(
        editingTailor
          ? "Tailor updated successfully"
          : "Tailor added successfully"
      );
      setRefresh(!refresh);
      setEditingTailor(null);
      setDialogOpen(false);
    } else {
      alert("Error saving tailor");
    }
  };

  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-10 z-50 w-full max-w-md">
      <div className="bg-white p-6 rounded shadow-md w-full border">
        <h2 className="text-xl font-bold mb-4">
          {editingTailor ? "Edit Tailor" : "Add Tailor"}
        </h2>
        <input
          className={`${
            editingTailor ? "hidden" : ""
          } border p-2 rounded w-full mb-2`}
          placeholder="Tailor Name"
          value={tailorName}
          onChange={(e) => setTailorName(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={() => {
              navigate("/masters/tailors");
              setDialogOpen(false);
            }}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TailorDialog;
