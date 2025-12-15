import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { REACT_APP_BACKEND_SERVER_URL } from "../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbarr from '../../Navbarr/Navbarr';
import "./Addgoldsmith.css";

export default function AddGoldsmith() {
  const [goldsmithName, setGoldsmithName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [goldSmithCode, setGoldSmithCode] = useState("");
  const [goldsmith, setGoldsmith] = useState([]);
  const [editItemId, setEditItemId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCode, setEditCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // adjust if needed
  const [totalPage, setTotalPage] = useState(1);

  const validName = /^[a-zA-Z0-9\s]+$/;

  useEffect(() => {
    fetchGoldsmiths();
  }, [page]);


  const fetchGoldsmiths = async () => {
    try {
      const { data } = await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/goldSmith`,
        {
          params: { page, limit }
        }
      );
      const list = Array.isArray(data.data) ? data.data : [];
      console.log("data.totalPage", data.totalPage);
      setGoldsmith(list);
      setTotalPage(data.totalPage || 1);
      console.log("Fetched goldsmiths:", data);
    } catch (error) {
      console.error("Error fetching goldsmiths:", error);
      toast.error("Failed to load goldsmith data.");
    }
  };



  const handleSaveGoldsmith = async () => {
    if (saving) return;

    if (!goldsmithName.trim()) {
      toast.warn("Goldsmith name is required.");
      return;
    }

    if (!goldSmithCode.trim()) {
      toast.warn("Goldsmith code is required.");
      return;
    }

    if (!validName.test(goldsmithName.trim())) {
      toast.warn("Special characters are not allowed in name.", { autoClose: 2000 });
      return;
    }

    if (phoneNumber.trim() && !/^\d{10}$/.test(phoneNumber.trim())) {
      toast.warn("Phone number must be 10 digits.", { autoClose: 2000 });
      return;
    }

    const payload = {
      name: goldsmithName.trim(),
      phone: phoneNumber.trim() || null,
      address: address.trim() || null,
      goldSmithCode: goldSmithCode.trim()
    };

    try {
      setSaving(true);
      const { data } = await axios.post(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/goldSmith`,
        payload
      );
      toast.success("Goldsmith added successfully!");
      setPage(1);
      fetchGoldsmiths();
      setGoldsmithName("");
      setPhoneNumber("");
      setAddress("");
      setGoldSmithCode("");
    } catch (error) {
      console.error("Error creating goldsmith:", error);
      toast.error(error.response?.data?.message || "Failed to add goldsmith", {
        autoClose: 2000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditItemId(item.id);
    setEditName(item.name);
    setEditPhone(item.phone || "");
    setEditAddress(item.address || "");
    setEditCode(item.goldSmithCode || "");
  };

  const handleCancelEdit = () => {
    setEditItemId(null);
    setEditName("");
    setEditPhone("");
    setEditAddress("");
    setEditCode("");
  };

  const handleSaveEdit = async (id) => {
    if (saving) return;

    if (!editName.trim()) {
      toast.warn("Goldsmith name is required.");
      return;
    }

    if (!editCode.trim()) {
      toast.warn("Goldsmith code is required.");
      return;
    }

    if (!validName.test(editName.trim())) {
      toast.warn("Special characters are not allowed in name.", { autoClose: 2000 });
      return;
    }

    if (editPhone.trim() && !/^\d{10}$/.test(editPhone.trim())) {
      toast.warn("Phone number must be 10 digits.", { autoClose: 2000 });
      return;
    }

    const payload = {
      name: editName.trim(),
      phone: editPhone.trim() || null,
      address: editAddress.trim() || null,
      goldSmithCode: editCode.trim()
    };

    try {
      setSaving(true);
      const response = await axios.put(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/goldSmith/${id}`,
        payload
      );

      setGoldsmith((prev) =>
        prev.map((g) => (g.id === id ? response.data.data : g))
      );

      toast.success("Goldsmith updated successfully");
      setEditItemId(null);
      setEditName("");
      setEditPhone("");
      setEditAddress("");
      setEditCode("");
    } catch (error) {
      console.error("Error updating goldsmith:", error);
      toast.error(error.response?.data?.message || "Failed to update goldsmith");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this goldsmith?")) return;

  try {
    await axios.delete(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/goldSmith/${id}`);
    toast.success("Goldsmith deleted successfully");

    // REFRESH LIST after deletion
    const response = await axios.get(
      `${REACT_APP_BACKEND_SERVER_URL}/api/v1/goldSmith`,
      {
        params: { page, limit }
      }
    );

    const list = response.data.data;
    const totalPages = response.data.totalPage;

    // If current page becomes empty → go to previous page
    if (list.length === 0 && page > 1) {
      setPage(page - 1);
    } else {
      setGoldsmith(list);
      setTotalPage(totalPages);
    }

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Cannot delete this goldsmith. It may be linked to other records."
    );
  }
};


  return (
    <>
      <Navbarr />
      <div className="goldsmith-container">
        <ToastContainer 
          position="top-right" 
          autoClose={2000} 
          hideProgressBar 
          theme="dark"
        />

        <div className="goldsmith-header">
          <h1>Goldsmith Management</h1>
          <p>Manage Your Goldsmith Details</p>
        </div>

        <div className="content-wrapper">
          <div className="add-goldsmith-card">
            <h2>Add New Goldsmith</h2>
            
            <div className="form-group">
              <label>Goldsmith Name</label>
              <input
                type="text"
                value={goldsmithName}
                onChange={(e) => setGoldsmithName(e.target.value)}
                placeholder="Enter goldsmith name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter 10 digit phone number"
                maxLength="10"
              />
            </div>

            <div className="form-group">
              <label>Goldsmith Code</label>
              <input
                type="text"
                value={goldSmithCode}
                onChange={(e) => setGoldSmithCode(e.target.value)}
                placeholder="Enter goldsmith code"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                rows="4"
              />
            </div>

            <button 
              className="btn-add" 
              onClick={handleSaveGoldsmith}
              disabled={saving}
            >
              {saving ? "Saving..." : "Add Goldsmith"}
            </button>
          </div>

          <div className="goldsmith-list-card">
            <h2>Goldsmith List</h2>
         {Array.isArray(goldsmith) && goldsmith.length > 0 ? (
              <div className="goldsmith-table-wrapper">
                <table className="goldsmith-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Code</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goldsmith.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>
                          {editItemId === item.id ? (
                            <input
                              type="text"
                              className="edit-input"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            item.name
                          )}
                        </td>
                        <td>
                          {editItemId === item.id ? (
                            <input
                              type="tel"
                              className="edit-input"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              maxLength="10"
                            />
                          ) : (
                            item.phone || "-"
                          )}
                        </td>
                        <td>
                          {editItemId === item.id ? (
                            <input
                              type="text"
                              className="edit-input"
                              value={editCode}
                              onChange={(e) => setEditCode(e.target.value)}
                            />
                          ) : (
                            <strong>{item.goldSmithCode}</strong>
                          )}
                        </td>
                        <td>
                          {editItemId === item.id ? (
                            <textarea
                              className="edit-textarea"
                              value={editAddress}
                              onChange={(e) => setEditAddress(e.target.value)}
                              rows="2"
                            />
                          ) : (
                            item.address || "-"
                          )}
                        </td>
                        <td>
                          {editItemId === item.id ? (
                            <div className="action-buttons">
                              <button
                                className="btn-save"
                                onClick={() => handleSaveEdit(item.id)}
                                disabled={saving}
                              >
                                {saving ? "Saving..." : "Save"}
                              </button>
                              <button
                                className="btn-cancel"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button
                                className="btn-icon btn-edit"
                                onClick={() => handleEdit(item)}
                                title="Edit"
                              >
                                <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                onClick={() => handleDelete(item.id)}
                                title="Delete"
                              >
                                <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      ◀ Prev
                    </button>

                    <span>
                      Page {page} of {totalPage}
                    </span>

                    <button
                      disabled={page === totalPage}
                      onClick={() => setPage(page + 1)}
                    >
                      Next ▶
                    </button>
                  </div>

              </div>
            ) : (
              <div className="no-items">No goldsmiths added</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}