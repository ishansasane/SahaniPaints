import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";


const StoreDialog  = ({
  editingStore ,
  setEditingStore,
  setIsAddStoreOpen,
  onSave
}) => {
    const navigate = useNavigate();
  const [newStoreName, setNewStoreName] = useState("");
  const [newStorePhone, setNewStorePhone] = useState("");
  const [newStoreEmail, setNewStoreEmail] = useState("");
  const [newStoreAddress, setNewStoreAddress] = useState("");

  const handleSaveStore = () => {
    onSave(newStoreName, newStorePhone, newStoreEmail, newStoreAddress);
  };

  useEffect(() => {
    if(editingStore != null){
      setNewStoreAddress(editingStore[1]);
      setNewStoreName(editingStore[0]);
      setNewStoreEmail(editingStore[3]);
      setNewStorePhone(editingStore[2]);
    }
  }, [editingStore])

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        width: '400px',
        zIndex: 1000,
      }}
    >
      <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>
        {editingStore ? 'Edit Store' : 'Add Store'}
      </h3>
      {editingStore == null && (
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Store Name:</label>
          <input
            type="text"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
            }}
          />
        </div>
      )}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Phone:</label>
        <input
          type="text"
          value={newStorePhone}
          onChange={(e) => setNewStorePhone(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '100%',
          }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
        <input
          type="text"
          value={newStoreEmail}
          onChange={(e) => setNewStoreEmail(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '100%',
          }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
        <input
          type="text"
          value={newStoreAddress}
          onChange={(e) => setNewStoreAddress(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '100%',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSaveStore}
          style={{
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            marginRight: '10px',
          }}
        >
          Save
        </button>
        <button
          onClick={() => {setEditingStore(null); setIsAddStoreOpen(false); }}
          style={{ padding: '8px 16px', borderRadius: '4px' }}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default StoreDialog;
