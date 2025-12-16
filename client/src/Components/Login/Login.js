import React, { useEffect, useState } from "react";
import "./AdminUsers.css";
import { toast } from "react-toastify";
import { REACT_APP_BACKEND_SERVER_URL } from "../../../config";
import Navbarr from "../../Navbarr/Navbarr";
import { ToastContainer } from "react-toastify";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { IoPersonAddSharp } from "react-icons/io5";

const PAGE_SIZE = 8;
function normalizeRole(role) {
  return (role || "").toString().trim().toLowerCase();
}

function isSuperAdmin(role) {
  const r = normalizeRole(role);
  return r === "superadmin" || r === "super admin";
}

function canManageTarget(currentRole, targetRole) {
  const cur = normalizeRole(currentRole);
  const tgt = normalizeRole(targetRole);

  if (tgt === "superadmin" || tgt === "super admin") {
    return cur === "superadmin" || cur === "super admin";
  }

  return true;
}


export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const currentUserRole = (localStorage.getItem("userRole") || "").toLowerCase();
  const token = localStorage.getItem("token");
  const [newUser, setNewUser] = useState({
    userName: "",
    phone: "",
    password: "",
    role: "user",
    access: {
      userCreateAccess: false,
      goldSmithAccess: false,
      itemAccess: false,
      productAccess: true,
      billingAccess: false,
      restoreAccess: false,
      deleteLotAccess: false,
    },
  });

  useEffect(() => {
    if (newUser.role === "user") {
      setNewUser(prev => ({
        ...prev,
        access: {
          ...prev.access,
          userCreateAccess: false, // force-disable
        }
      }));
    }
  }, [newUser.role]);

  useEffect(() => {
    if (selectedUser && selectedUser.role === "user") {
      setSelectedUser(prev => {
        const accessObj = Array.isArray(prev.access)
          ? { ...prev.access[0] }
          : { ...prev.access };

        accessObj.userCreateAccess = false;

        return {
          ...prev,
          access: Array.isArray(prev.access) ? [accessObj] : accessObj,
        };
      });
    }
  }, [selectedUser?.role]);

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
        setUsers(
          (data.allCustomers || data.allUsers || data || []).map(u => ({
            ...u,
            role: u.role?.toLowerCase() || "user"
          }))
        );
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
    return users.filter(
      (u) =>
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
    const target = users.find((x) => x.id === id);
    const currentRole = localStorage.getItem("userRole");

    if (!canManageTarget(currentRole, target?.role)) {
      toast.error("Only super admin can edit super admin accounts");
      return;
    }
    try {
      const res = await fetch(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/user/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Could not load user");
        return;
      }
      setSelectedUser({ ...(data.user || data), newPassword: "" });
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
        deleteLotAccess: false,
      },
    });
  }

  function toggleAccess(field) {
    setSelectedUser((u) => {
      if (!u) return u;
      const accessObj = {
        ...(u.access && u.access[0] ? u.access[0] : u.access),
      };
      accessObj[field] = !Boolean(accessObj[field]);
      return {
        ...u,
        access: Array.isArray(u.access) ? [accessObj] : accessObj,
      };
    });
  }

  function toggleNewUserAccess(field) {
    setNewUser((prev) => ({
      ...prev,
      access: {
        ...prev.access,
        [field]: !prev.access[field],
      },
    }));
  }

  async function handleAddUser() {
    if (!newUser.userName || !newUser.password) {
      toast.error("Username and password are required");
      return;
    }
    if (newUser.userName .trim() ===""){
      toast.error("User Name is invalid");
      return;
    }

    if (newUser.phone) {
      const exists = users.some(u => u.phone === newUser.phone);

      if (exists) {
        toast.error("Phone number already exists");
        return;
      }
    }

    if (/^(\d)\1{9}$/.test(newUser.phone.trim())) {
      toast.warn("Invalid phone number", { autoClose: 2000 });
      return;
    }

    try {
      const res = await fetch(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newUser),
        }
      );
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
    const currentRole = localStorage.getItem("userRole");
    if (!canManageTarget(currentRole, selectedUser.role)) {
      toast.error("You are not allowed to update this account");
      return;
    }
    const id = selectedUser.id;
    const accessItem = Array.isArray(selectedUser.access)
      ? selectedUser.access[0]
      : selectedUser.access;

    if (!accessItem || !accessItem.id) {
      toast.error("Invalid access object from backend");
      return;
    }

    if (selectedUser.phone) {
      const exists = users.some(
        u => u.phone === selectedUser.phone && u.id !== selectedUser.id
      );

      if (exists) {
        toast.error("Phone number already exists");
        return;
      }
    }

    if (/^(\d)\1{9}$/.test(selectedUser.phone.trim())) {
      toast.warn("Invalid phone number", { autoClose: 2000 });
      return;
    }
    console.log("accessItem", accessItem);
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
        deleteLotAccess: !!accessItem.deleteLotAccess,
      },
    };
    console.log("update time ", body);

    // Add password to body if changed
    if (selectedUser.newPassword && selectedUser.newPassword.trim() !== "") {
      body.password = selectedUser.newPassword;
    }

    try {
      const res = await fetch(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/user/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Update failed");
      } else {
        toast.success(
          selectedUser.newPassword
            ? "User updated with new password"
            : "User access updated"
        );
        closeModal();
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving");
    }
  }

async function handleDelete(u) {
  const currentRole = localStorage.getItem("userRole");
  if (isSuperAdmin(u.role)) {
    toast.error("Superadmin cannot be deleted");
    return;
  }

  if (!window.confirm(`Delete user "${u.userName}"? This is permanent.`)) return;

  try {
    const res = await fetch(
      `${REACT_APP_BACKEND_SERVER_URL}/api/v1/user/${u.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Delete failed");
      return;
    }

    toast.success("User deleted");
    fetchUsers();
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
              
              <h2 style={{display:"flex", justifyContent:'center',alignItems:'center'}}>
                <img
                  src="https://img.icons8.com/?size=100&id=z-JBA_KtSkxG&format=png&color=000000"
                  alt="user"
                  style={{ width: "45px", height: "45px", marginRight: "10px" }}
                />
                Users Management{" "}
              </h2>
              <p className="muted">
                Manage user accounts, roles, and access permissions
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <span className="btn-icon"><IoPersonAddSharp /></span> Add New User
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
                    <th>S.No</th>
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
                        <span className="row-number">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </span>
                      </td>
                      <td>
                        <div className="user-info">
                          <span className="user-avatar">
                            {u.userName?.charAt(0).toUpperCase()}
                          </span>
                          <span className="user-name">{u.userName}</span>
                        </div>
                      </td>
                      <td>
                        {u.phone || <span className="text-muted">-</span>}
                      </td>
                      <td>
                        <span className={`role-badge ${u.role?.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className="password-display">••••••••</span>
                      </td>
                      <td className="actions">
                        {/* Hide buttons if the row is a superadmin */}
                        {!isSuperAdmin(u.role) && (
                          <>
                            <button
                              className="btn-action btn-edit"
                              onClick={() => openManage(u.id)}
                            >
                              ✏️ Edit
                            </button>

                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDelete(u)}
                            >
                              🗑️ Delete
                            </button>
                          </>
                        )}

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pageCount() > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                    onClick={() => setPage((p) => Math.min(pageCount(), p + 1))}
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
          <div className="modal-backdrop">
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{display:"flex", justifyContent:'center',alignItems:'center',gap:'1rem'}}><IoPersonAddSharp /> Add New User</h3>
                <button className="modal-close" onClick={closeAddModal}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={newUser.userName}
                    onChange={(e) =>{
                      const cleaned = e.target.value.replace(/\s/g,'')
                      setNewUser({ ...newUser, userName: cleaned })
                    }}
                    placeholder="Enter username"
                    className="form-input"
                  />
                </div>  
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => {
                      const phoneValue = e.target.value.replace(/\D/g, '');
                      if (phoneValue.length > 10) {
                        return;
                      }
                      // const allSameDigits = /^(\d)\1{9}$/.test(phoneValue);
                      // if (allSameDigits) {
                      //   toast.error("Invalid phone number");
                      //   setNewUser({...newUser, phone: ""})
                      //   return;
                      // }
                      setNewUser({ ...newUser, phone: phoneValue });
                    }}
                    placeholder="Enter phone number"
                    className="form-input"
                    maxLength="10"
                    inputMode="numeric"
                  />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) =>{
                        const cleaned = e.target.value.replace(/\s/,"")
                        setNewUser({ ...newUser, password: cleaned })
                      }}
                      placeholder="Enter password"
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
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
                    
                    {newUser.role != 'user' && <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.userCreateAccess}
                        onChange={() => toggleNewUserAccess("userCreateAccess")}
                      />
                      <span> Users Management </span>
                    </label>}

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.goldSmithAccess}
                        onChange={() => toggleNewUserAccess("goldSmithAccess")}
                      />
                      <span> Add GoldSmith </span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.itemAccess}
                        onChange={() => toggleNewUserAccess("itemAccess")}
                      />
                      <span style={{}}> Add Items </span>
                    </label>

                    {/* <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.productAccess}
                        onChange={() => toggleNewUserAccess("productAccess")}
                      />
                      <span>Products </span>
                    </label> */}

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.billingAccess}
                        onChange={() => toggleNewUserAccess("billingAccess")}
                      />
                      <span> Billing</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.restoreAccess}
                        onChange={() => toggleNewUserAccess("restoreAccess")}
                      />
                      <span> Restore </span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.access.deleteLotAccess}
                        onChange={() => toggleNewUserAccess("deleteLotAccess")}
                      />
                      <span> Deleted Lots</span>
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
          <div className="modal-backdrop">
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>✏️ Manage User: {selectedUser.userName}</h3>
                <button className="modal-close" onClick={closeModal}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={selectedUser.phone || ""}
                    onChange={(e) =>{
                      const phoneValue = e.target.value.replace(/\D/g, '');
                      if (phoneValue.length > 10) {
                        return;
                      }
                      setSelectedUser({
                        ...selectedUser,
                        phone: phoneValue,
                      })}
                    }
                    placeholder="Enter phone number"
                    className="form-input"
                    maxLength="10"
                  />
                </div>

                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-display-box">
                    <span className="password-text">
                      {showPassword
                        ? selectedUser.password || "••••••••"
                        : "••••••••"}
                    </span>
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    value={selectedUser.newPassword || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                    className="form-input"
                  />
                  {selectedUser.newPassword && (
                    <small className="form-hint">
                      ✓ Password will be updated
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, role: e.target.value })
                    }
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
                   {selectedUser.role != 'user' &&  <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access &&
                            selectedUser.access[0] &&
                            selectedUser.access[0].userCreateAccess) ||
                            (selectedUser.access &&
                              selectedUser.access.userCreateAccess)
                        )}
                        onChange={() => toggleAccess("userCreateAccess")}
                      />
                      <span> Users Management</span>
                    </label>}

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access &&
                            selectedUser.access[0] &&
                            selectedUser.access[0].goldSmithAccess) ||
                            (selectedUser.access &&
                              selectedUser.access.goldSmithAccess)
                        )}
                        onChange={() => toggleAccess("goldSmithAccess")}
                      />
                      <span> Add GoldSmith</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access &&
                            selectedUser.access[0] &&
                            selectedUser.access[0].itemAccess) ||
                            (selectedUser.access &&
                              selectedUser.access.itemAccess)
                        )}
                        onChange={() => toggleAccess("itemAccess")}
                      />
                      <span> Add Items</span>
                    </label>

                    {/* <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access &&
                            selectedUser.access[0] &&
                            selectedUser.access[0].productAccess) ||
                            (selectedUser.access &&
                              selectedUser.access.productAccess)
                        )}
                        onChange={() => toggleAccess("productAccess")}
                      />
                      <span>Products </span>
                    </label> */}

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access &&
                            selectedUser.access[0] &&
                            selectedUser.access[0].billingAccess) ||
                            (selectedUser.access &&
                              selectedUser.access.billingAccess)
                        )}
                        onChange={() => toggleAccess("billingAccess")}
                      />
                      <span> Billing </span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access &&
                            selectedUser.access[0] &&
                            selectedUser.access[0].restoreAccess) ||
                            (selectedUser.access &&
                              selectedUser.access.restoreAccess)
                        )}
                        onChange={() => toggleAccess("restoreAccess")}
                      />
                      <span> Restore </span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (selectedUser.access &&
                            selectedUser.access[0] &&
                            selectedUser.access[0].deleteLotAccess) ||
                            (selectedUser.access &&
                              selectedUser.access.deleteLotAccess)
                        )}
                        onChange={() => toggleAccess("deleteLotAccess")}
                      />
                      <span> Deleted Lots </span>
                    </label>
                  </div>
                </div>

                <div className="info-box">
                  <span className="info-icon">ℹ️</span>
                  <p>
                    Username cannot be changed. Super admin accounts cannot be
                    deleted.
                  </p>
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
