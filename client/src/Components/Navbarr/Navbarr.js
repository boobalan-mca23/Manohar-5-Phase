import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faUser, faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import './Navbarr.css';
import images from '../../Components/Logo/mano.jpg';

const Navbarr = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const username = localStorage.getItem("username") || "User";
  const userRole = user?.role || "Member"; // Get user role from user object
  const access = user?.access || {};
  const token = localStorage.getItem("token");

  const canCreateUsers = access.userCreateAccess;
  const canAccessGoldSmith = access.goldSmithAccess;
  const canAccessItems = access.itemAccess;
  const canAccessProduct = access.productAccess;
  const canAccessRestore = access.restoreAccess;
  const canAccessBilling = access.billingAccess;
  const deleteLotAccess=access.deleteLotAccess;

  const isMasterActive = [
    "/admin",
    "/additem",
    "/addgoldsmith"
  ].includes(location.pathname);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      localStorage.removeItem("username");
      localStorage.removeItem("token");
      navigate("/");
      // Call your logout service if needed
      // logout();
    }
  };

  return (
    <div className="nav-bar">
      {/* Logo */}
      <img src={images} alt="Logo" className="imge" />

      <div className="positionn">
        {/* Billing */}
        {canAccessBilling && (
          <NavLink to="/billing">Billing</NavLink>
        )}

        {/* Restore */}
        {canAccessRestore && (
          <NavLink to="/restore">Restore</NavLink>
        )}
      {
       deleteLotAccess &&(
        <NavLink to="/removedLots">Deleted Lots</NavLink>
      )
      }
        {/* Master dropdown */}
        {(canCreateUsers || canAccessItems || canAccessGoldSmith) && (
          <div className="master-link">
            <NavLink to="#" className={isMasterActive ? "active" : ""}>
              Master
            </NavLink>
            <div className="master-dropdown">
              {canCreateUsers && (
                <NavLink to="/admin">Admin</NavLink>
              )}
              {canAccessItems && (
                <NavLink to="/additem">Add Item</NavLink>
              )}
              {canAccessGoldSmith && (
                <NavLink to="/addgoldsmith">Add Gold Smith</NavLink>
              )}
            </div>
          </div>
        )}

        <NavLink to="/home" className="hom">
          <FontAwesomeIcon icon={faHouse} />
        </NavLink>
      </div>

      {/* Enhanced User Profile Section */}
      <div className="user-profile-container">
        <div className="userinfo">
          <span className="userAvatar">{username?.charAt(0).toUpperCase()}</span>
        </div>
        
        {/* User Profile Dropdown */}
        <div className="user-profile-dropdown">
          <div className="user-profile-header">
            <div className="user-profile-avatar-large">
              {username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-profile-info">
              <div className="user-profile-name">{username}</div>
              <div className="user-profile-role">{userRole}</div>
            </div>
          </div>
          
          <div className="user-profile-divider"></div>
          
          <button className="user-profile-logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbarr;
