import React, { useState, useEffect, useRef } from "react";

interface Option {
  id: string;
  name: string;
}

interface Props {
  options: Option[];
  onAddNew: (newCustomer: { name: string; phone: string; email: string; address?: string; alternateNumber?: string }) => Promise<void>;
  selectedCustomer: Option | null;
  setSelectedCustomer: (customer: Option) => void;
}

const SelectInputWithAdd: React.FC<Props> = ({ options, onAddNew, selectedCustomer, setSelectedCustomer }) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: "", phone: "", email: "", address: "", alternateNumber: "" });

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(opt =>
        opt.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: Option) => {
    setSelectedCustomer(option);
    setInputValue(option.name);
    setShowDropdown(false);
  };

  const handleAddNew = async () => {
    try {
      await onAddNew(newEntry);
      setInputValue(newEntry.name);
      setShowAddForm(false);
      setNewEntry({ name: "", phone: "", email: "", address: "", alternateNumber: "" });
    } catch (error) {
      console.error("Failed to add new entry", error);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      {/* Main Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Select or add..."
        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-md z-10 max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            <>
              {filteredOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className="px-2 py-2 cursor-pointer hover:bg-blue-100"
                >
                  {opt[0]}
                </div>
              ))}
            </>
          ) : (
            <div
              onClick={() => {
                setShowAddForm(true);
                setShowDropdown(false);
              }}
              className="px-4 py-2 cursor-pointer text-blue-600 hover:bg-blue-50"
            >
              ➕ Add Customer "{inputValue}"
            </div>
          )}
        </div>
      )}

      {/* Add New Form */}
      {showAddForm && (
        <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={newEntry.name}
              onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Phone"
              value={newEntry.phone}
              onChange={(e) => setNewEntry({ ...newEntry, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="email"
              placeholder="Email"
              value={newEntry.email}
              onChange={(e) => setNewEntry({ ...newEntry, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectInputWithAdd;
