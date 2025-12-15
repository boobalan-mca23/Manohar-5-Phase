import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { REACT_APP_BACKEND_SERVER_URL } from "../../../config";
import Navbarr from '../../Navbarr/Navbarr';
import axios from "axios";
import "./AddItem.css";

export default function AddItem() {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [editItemId, setEditItemId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPage, setTotalPage] = useState(1);

  const validName = /^[a-zA-Z0-9\s]+$/;

  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/masterItem`,
        {
          params: { page, limit }
        }
      );
      
      setItems(res.data.allMasterItem);
      setTotalPage(res.data.totalPage);
    } catch (err) {
      console.error("Failed to fetch items", err);
      toast.error("Failed to fetch items");
    }
  };

  const handleAddItem = async () => {
    if (!itemName.trim() || !itemCode.trim()) {
      toast.warn("Please enter both item name and code.");
      return;
    }

    if (!validName.test(itemName.trim()) || !validName.test(itemCode.trim())) {
      toast.warn("Special characters are not allowed.", { autoClose: 2000 });
      return;
    }

    const isNameExists = items.some(
      item => item.itemName.toLowerCase() === itemName.trim().toLowerCase()
    );

    const isCodeExists = items.some(
      item => item.itemCode.toLowerCase() === itemCode.trim().toLowerCase()
    );

    if (isNameExists) {
      toast.warn("Item name already exists");
      return;
    }

    if (isCodeExists) {
      toast.warn("Item code already exists");
      return;
    }


    try {
      await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/masterItem`, {
        itemName: itemName.trim(),
        itemCode: itemCode.trim(),
      });
      setItemName("");
      setItemCode("");
      fetchItems();
      toast.success("Item added successfully!");
    } catch (err) {
      console.error("Failed to add item", err);
      toast.error(err.response?.data?.message || "Something went wrong", {
        autoClose: 2000,
      });
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this item?")) return;

  try {
    await axios.delete(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/masterItem/${id}`);
    toast.success("Item deleted successfully!");

    // REFRESH items after delete
    const res = await axios.get(
      `${REACT_APP_BACKEND_SERVER_URL}/api/v1/masterItem`,
      {
        params: { page, limit }
      }
    );

    const list = res.data.allMasterItem;
    const totalPages = res.data.totalPage;

    // If the current page becomes empty → go to previous page
    if (list.length === 0 && page > 1) {
      setPage(page - 1);
    } else {
      setItems(list);
      setTotalPage(totalPages);
    }

  } catch (err) {
    console.error("Failed to delete item", err);
    toast.error("Failed to delete item. Please try again.");
  }
};


  const handleEdit = (item) => {
    setEditItemId(item.id);
    setEditName(item.itemName);
    setEditCode(item.itemCode);
  };

  const handleCancelEdit = () => {
    setEditItemId(null);
    setEditName("");
    setEditCode("");
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim() || !editCode.trim()) {
      toast.warn("Item name and code cannot be empty.");
      return;
    }

    if (!validName.test(editName.trim()) || !validName.test(editCode.trim())) {
      toast.warn("Special characters are not allowed.", { autoClose: 2000 });
      return;
    }

    const otherItems = items.filter(item => item.id !== id);

    const isNameExists = otherItems.some(item => item.itemName.toLowerCase() === editName.trim().toLowerCase());

    const isCodeExists = otherItems.some(item => item.itemCode.toLowerCase() === editCode.trim().toLowerCase());

    if (isNameExists) {
      toast.warn("Item name already exists");
      return;
    }

    if (isCodeExists) {
      toast.warn("Item code already exists");
      return;
    }


    try {
      await axios.put(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/masterItem/${id}`, {
        itemName: editName.trim(),
        itemCode: editCode.trim(),
      });
      toast.success("Item updated successfully!");
      setEditItemId(null);
      setEditName("");
      setEditCode("");
      fetchItems();
    } catch (err) {
      console.error("Failed to update item", err);
      toast.error(err.response?.data?.message || "Something went wrong", {
        autoClose: 2000,
      });
    }
  };

  return (
    <>
      <Navbarr />
      <div className="jewelry-container" style={{marginTop:'4rem'}}>
        <ToastContainer 
          position="top-right" 
          autoClose={2000} 
          hideProgressBar 
          theme="dark"
        />

        <div className="jewelry-header">
          <h1>Jewelry Collection</h1>
          <p>Manage Your Precious Items</p>
        </div>

        <div className="content-wrapper">
          <div className="add-item-card">
            <h2>Add New Item</h2>
            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\s/g,'')
                  setItemName(cleaned)
                }}
                placeholder="Enter item name"
              />
            </div>
            <div className="form-group">
              <label>Item Code</label>
              <input
                type="text"
                value={itemCode}
                onChange={(e) =>{
                  const cleaned = e.target.value.replace(/[^a-zA-Z]/g,'')
                  setItemCode(cleaned)
                }}
                placeholder="Enter item code"
                maxLength={2}
              />
            </div>
            <button className="btn-add" onClick={handleAddItem}>
              Add Item
            </button>
          </div>

          <div className="items-list-card">
            <h2>Item Collection</h2>
            {items.length > 0 ? (
              <div className="items-table-wrapper">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Item Name</th>
                      <th>Item Code</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id}>
                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>
                          {editItemId === item.id ? (
                            <input
                              type="text"
                              className="edit-input"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            item.itemName
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
                            item.itemCode
                          )}
                        </td>
                        <td>
                          {editItemId === item.id ? (
                            <div className="action-buttons">
                              <button
                                className="btn-save"
                                onClick={() => handleSaveEdit(item.id)}
                              >
                                Save
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
                                className="btn-icon btns-edit"
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
              <div className="no-items">No items in collection</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
