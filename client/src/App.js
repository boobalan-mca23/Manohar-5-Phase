import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./Components/Products/Products";
import PlainProducts from "./Components/Products/AddPlainProduct/PlainProducts";
import Billing from "./Components/Billing/Billing";
import AddBilling from "./Components/AddBilling/AddBilling";
import AddNewRestore from "./Components/AddRestore/AddRestore";
import BarcodePage from "./Components/BarcodePage/BarcodePage";
import Beadsenamel from "./Components/AddLot/Beadsenamel";
import PlainLot from "./Components/AddLot/PlainLot";
import Navbarr from "./Components/Navbarr/Navbarr";
import Login from "./Components/Login/Login";
import Restore from "./Components/Restore/Restore";
import ViewRestore from "./Components/ViewRestore/ViewRestore";
import AdminUsers from "./Components/Master/Admin/AdminUsers";
import AddGoldsmith from "./Components/Master/AddGoldsmith/AddGoldsmith";
import AddItem from "./Components/Master/AddItem/AddItem";
import Home from "./Components/Home/Home";
import RemoveLot from "./Components/RemovedLots/RemovedLots";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";

import { ToastContainer } from "react-toastify";

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lotNumber, setLotNumber] = useState("");

  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="navbarr" element={<Navbarr />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredAccess="userCreateAccess">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:lot_id"
            element={
              <ProtectedRoute requiredAccess="productAccess">
                <Products
                  setSelectedProduct={setSelectedProduct}
                  setLotNumber={setLotNumber}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/plainlot/:lot_id"
            element={
              <PlainProducts
                setSelectedProduct={setSelectedProduct}
                setLotNumber={setLotNumber}
              />
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute requiredAccess="billingAccess">
                <Billing />
              </ProtectedRoute>
            }
          />

          {/* <Route
          path="/billing/:bill_number/add"
          element={
            <AddBilling
              selectedProduct={selectedProduct}
              lotNumber={lotNumber}
            />
          }
        /> */}

          <Route path="/home" element={<Home />} />
          <Route
            path="/additem"
            element={
              <ProtectedRoute requiredAccess="itemAccess">
                <AddItem />
              </ProtectedRoute>
            }
          />

          <Route
            path="/addgoldsmith"
            element={
              <ProtectedRoute requiredAccess="goldSmithAccess">
                <AddGoldsmith />
              </ProtectedRoute>
            }
          />

          <Route path="/beadsenamellot" element={<Beadsenamel />} />
          <Route path="/plainlot" element={<PlainLot />} />
          <Route path="/" element={<Login />} />

          <Route path="/products/:id" element={<Products />} />
          <Route path="/barcode/:sNo" element={<BarcodePage />} />
          <Route
            path="/billing/:bill_number/add/:bill_type"
            element={<AddBilling />}
          />
          <Route
            path="/restore"
            element={
              <ProtectedRoute requiredAccess="restoreAccess">
                <Restore />
              </ProtectedRoute>
            }
          />

          <Route path="/restore/newRestore" element={<AddNewRestore />} />
          <Route path="/restore/ViewRestore/:id" element={<ViewRestore />} />

          <Route
            path="/billing/:bill_number"
            element={
              <AddBilling
                selectedProduct={selectedProduct}
                lotNumber={lotNumber}
              />
            }
          />
          <Route
            path="/removedLots"
            element={
              <ProtectedRoute requiredAccess="deleteLotAccess">
                <>
                  <Navbarr />
                  <RemoveLot />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
