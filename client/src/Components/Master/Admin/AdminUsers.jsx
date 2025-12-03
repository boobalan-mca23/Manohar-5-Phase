import React, { useEffect, useState } from "react";
import "./AdminUsers.css";
import { toast } from "react-toastify";
import { REACT_APP_BACKEND_SERVER_URL } from "../../../config";
import Navbarr from '../../Navbarr/Navbarr';
import { ToastContainer } from "react-toastify";

const PAGE_SIZE = 8;

function isSuperAdmin(role) {
  if (!role) return false;
  return role.toLowerCase().includes("super");
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newUser, setNewUser] = useState({
    userName: "",
    phone: "",
    password: "",
    role: "user",
    access: {
      userCreateAccess: false,
      goldSmithAccess: false,
      itemAccess: false,
      productAccess: false,
      billingAccess: false,
      restoreAccess: false,
    },
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to fetch users");
      } else {
        setUsers(data.allCustomers || data.allUsers || data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching users");
    } finally {
      setLoading(false);
    }
  }

  function filteredUsers() {
    if (!searchTerm) return users;
    return users.filter(u => 
      u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  function pageCount() {
    return Math.max(1, Math.ceil(filteredUsers().length / PAGE_SIZE));
  }

  function pagedUsers() {
    const filtered = filteredUsers();
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }

  async function openManage(id) {
    try {
      const res = await fetch(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Could not load user");
        return;
      }
      setSelectedUser({...data.user || data, newPassword: ""});
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  }

  function closeModal() {
    setSelectedUser(null);
    setShowPassword(false);
  }

  function closeAddModal() {
    setShowAddModal(false);
    setNewUser({
      userName: "",
      phone: "",
      password: "",
      role: "user",
      access: {
        userCreateAccess: false,
        goldSmithAccess: false,
        itemAccess: false,
        productAccess: false,
        billingAccess: false,
        restoreAccess: false,
      },
    });
  }

  function toggleAccess(field) {
    setSelectedUser((u) => {
      if (!u) return u;
      const accessObj = { ...(u.access && u.access[0] ? u.access[0] : u.access) };
      accessObj[field] = !Boolean(accessObj[field]);
      return { ...u, access: Array.isArray(u.access) ? [accessObj] : accessObj };
    });
  }

  function toggleNewUserAccess(field) {
    setNewUser(prev => ({
      ...prev,
      access: {
        ...prev.access,
        [field]: !prev.access[field]
      }
    }));
  }

  async function handleAddUser() {
    if (!newUser.userName || !newUser.password) {
      toast.error("Username and password are required");
      return;
    }

    try {
      const res = await fetch(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to create user");
      } else {
        toast.success("User created successfully");
        closeAddModal();
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while creating user");
    }
  }

  async function saveAccess() {
    if (!selectedUser) return;
    const id = selectedUser.id;
    const accessItem = Array.isArray(selectedUser.access) ? selectedUser.access[0] : selectedUser.access;
    
    if (!accessItem || !accessItem.id) {
      toast.error("Invalid access object from backend");
      return;
    }

    const body = {
      phone: selectedUser.phone,
      role: selectedUser.role,
      access: {
        id: accessItem.id,
        userCreateAccess: !!accessItem.userCreateAccess,
        goldSmithAccess: !!accessItem.goldSmithAccess,
        itemAccess: !!accessItem.itemAccess,
        productAccess: !!accessItem.productAccess,
        billingAccess: !!accessItem.billingAccess,
        restoreAccess: !!accessItem.restoreAccess,
      },
    };

    // Add password to body if changed
    if (selectedUser.newPassword && selectedUser.newPassword.trim() !== "") {
      body.password = selectedUser.newPassword;
    }

    try {
      const res = await fetch(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Update failed");
      } else {
        toast.success(selectedUser.newPassword ? "User updated with new password" : "User access updated");
        closeModal();
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving");
    }
  }

  async function handleDelete(u) {
    const currentUserRole = localStorage.getItem("userRole") || "";
    
    if (isSuperAdmin(u.role) && !isSuperAdmin(currentUserRole)) {
      toast.error("Only super admin can delete super admin accounts");
      return;
    }
    if (!window.confirm(`Delete user "${u.userName}"? This is permanent.`)) return;
    
    try {
      const res = await fetch(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/user/${u.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Delete failed");
      } else {
        toast.success("User deleted");
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while deleting");
    }
  }

  return (
    <>
      <Navbarr />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="admin-root">
        <div className="admin-header">
          <div className="header-content">
            <div>
              <h2>
                <img src='https://img.icons8.com/?size=100&id=z-JBA_KtSkxG&format=png&color=000000' 
                  alt='user'
                  style={{ width:"45px",
                           height:'45px',
                           marginRight:'10px'}}/>
                          Users Management </h2>
              <p className="muted">Manage user accounts, roles, and access permissions</p>
            </div>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <span className="btn-icon">+</span> Add New User
            </button>
          </div>
        </div>
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by username, phone, or role..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="search-input"
            />
          </div>
          <div className="stats">
            <span className="stat-badge">Total Users: {users.length}</span>
            <span className="stat-badge">Showing: {pagedUsers().length}</span>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : pagedUsers().length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No users found</h3>
              <p>Try adjusting your search or add a new user</p>
            </div>
          ) : (
            <>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Password</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers().map((u, idx) => (
                    <tr key={u.id}>
                      <td>
                        <span className="row-number">{(page - 1) * PAGE_SIZE + idx + 1}</span>
                      </td>
                      <td>
                        <div className="user-info">
                          <span className="user-avatar">{u.userName?.charAt(0).toUpperCase()}</span>
                          <span className="user-name">{u.userName}</span>
                        </div>
                      </td>
                      <td>{u.phone || <span className="text-muted">-</span>}</td>
                      <td>
                        <span className={`role-badge ${u.role?.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className="password-display">••••••••</span>
                      </td>
                      <td className="actions">
                        <button 
                          className="btn-action btn-edit" 
                          onClick={() => openManage(u.id)}
                          title="Manage Access"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn-action btn-delete" 
                          onClick={() =>{ 
                                           console.log(u)
                                          handleDelete(u)
                                        }} 
                          disabled={isSuperAdmin(u.role)}
                          title={isSuperAdmin(u.role) ? "Cannot delete super admin" : "Delete user"}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pageCount() > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn" 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                  >
                    ← Previous
                  </button>
                  <div className="page-info">
                    <span className="page-current">Page {page}</span>
                    <span className="page-separator">/</span>
                    <span className="page-total">{pageCount()}</span>
                  </div>
                  <button 
                    className="page-btn" 
                    onClick={() => setPage(p => Math.min(pageCount(), p + 1))} 
                    disabled={page === pageCount()}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="modal-backdrop" onClick={closeAddModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>➕ Add New User</h3>
                <button className="modal-close" onClick={closeAddModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={newUser.userName}
                    onChange={(e) => setNewUser({...newUser, userName: e.target.value})}
                    placeholder="Enter username"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Enter password"
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="form-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    {/* <option value="superadmin">Super Admin</option> */}
                  </select>
                </div>

                <div className="form-group">
                  <label>Access Permissions</label>
                  <div className="access-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.userCreateAccess}
                        onChange={() => toggleNewUserAccess("userCreateAccess")}
                      />
                      <span>Create Users 👥</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.productAccess}
                        onChange={() => toggleNewUserAccess("productAccess")}
                      />
                      <span>Products 📦</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.billingAccess}
                        onChange={() => toggleNewUserAccess("billingAccess")}
                      />
                      <span>Billing 💰</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.restoreAccess}
                        onChange={() => toggleNewUserAccess("restoreAccess")}
                      />
                      <span>Restore ♻️</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.goldSmithAccess}
                        onChange={() => toggleNewUserAccess("goldSmithAccess")}
                      />
                      <span>GoldSmith ⚒️</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.itemAccess}
                        onChange={() => toggleNewUserAccess("itemAccess")}
                      />
                      <span>Items 📋</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeAddModal}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleAddUser}>
                  Create User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {selectedUser && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>✏️ Manage User: {selectedUser.userName}</h3>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={selectedUser.phone || ""}
                    onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-display-box">
                    <span className="password-text">
                      {showPassword ? selectedUser.password || "••••••••" : "••••••••"}
                    </span>
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    value={selectedUser.newPassword || ""}
                    onChange={(e) => setSelectedUser({...selectedUser, newPassword: e.target.value})}
                    placeholder="Enter new password"
                    className="form-input"
                  />
                  {selectedUser.newPassword && (
                    <small className="form-hint">✓ Password will be updated</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                    className="form-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    {/* <option value="superadmin">Super Admin</option> */}
                  </select>
                </div>

                <div className="form-group">
                  <label>Access Permissions</label>
                  <div className="access-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access && selectedUser.access[0] && selectedUser.access[0].userCreateAccess) ||
                          (selectedUser.access && selectedUser.access.userCreateAccess)
                        )}
                        onChange={() => toggleAccess("userCreateAccess")}
                      />
                      <span>Create Users 👥</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access && selectedUser.access[0] && selectedUser.access[0].productAccess) ||
                          (selectedUser.access && selectedUser.access.productAccess)
                        )}
                        onChange={() => toggleAccess("productAccess")}
                      />
                      <span>Products 📦</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access && selectedUser.access[0] && selectedUser.access[0].billingAccess) ||
                          (selectedUser.access && selectedUser.access.billingAccess)
                        )}
                        onChange={() => toggleAccess("billingAccess")}
                      />
                      <span>Billing 💰</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access && selectedUser.access[0] && selectedUser.access[0].restoreAccess) ||
                          (selectedUser.access && selectedUser.access.restoreAccess)
                        )}
                        onChange={() => toggleAccess("restoreAccess")}
                      />
                      <span>Restore ♻️</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access && selectedUser.access[0] && selectedUser.access[0].goldSmithAccess) ||
                          (selectedUser.access && selectedUser.access.goldSmithAccess)
                        )}
                        onChange={() => toggleAccess("goldSmithAccess")}
                      />
                      <span>GoldSmith ⚒️</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access && selectedUser.access[0] && selectedUser.access[0].itemAccess) ||
                          (selectedUser.access && selectedUser.access.itemAccess)
                        )}
                        onChange={() => toggleAccess("itemAccess")}
                      />
                      <span>Items 📋</span>
                    </label>
                  </div>
                </div>

                <div className="info-box">
                  <span className="info-icon">ℹ️</span>
                  <p>Username cannot be changed. Super admin accounts cannot be deleted.</p>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={saveAccess}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}