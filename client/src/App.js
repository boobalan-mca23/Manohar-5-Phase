
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./Components/Products/Products";
import PlainProducts from "./Components/Products/AddPlainProduct/PlainProducts";
import Billing from './Components/Billing/Billing'
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
          <Route path="/admin" element={<AdminUsers />} />
          <Route
            path="/products/:lot_id"
            element={
              <Products
                setSelectedProduct={setSelectedProduct}
                setLotNumber={setLotNumber}
              />
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
          <Route path="/billing" element={<Billing />} />
          {/* <Route
          path="/billing/:bill_number/add"
          element={
            <AddBilling
              selectedProduct={selectedProduct}
              lotNumber={lotNumber}
            />
          }
        /> */}
         
          <Route path="/home" element={<Home/>} />
          <Route path="/additem" element={<AddItem />} />
          <Route path="/addgoldsmith" element={<AddGoldsmith />} />
          <Route path="/beadsenamellot" element={<Beadsenamel />} />
          <Route path="/plainlot" element={<PlainLot />} />
          <Route path="/" element={<Login />} />

          <Route path="/products/:id" element={<Products />} />
          <Route path="/barcode/:sNo" element={<BarcodePage />} />
          <Route
            path="/billing/:bill_number/add/:bill_type"
            element={<AddBilling />}
          />
          <Route path="/restore" element={<Restore/>}  /> 

          <Route
            path="/restore/newRestore"
            element={<AddNewRestore/>}
          />
          <Route
           path="/restore/ViewRestore/:id"
           element={<ViewRestore/>}
          />
       
          <Route
            path="/billing/:bill_number"
            element={
              <AddBilling
                selectedProduct={selectedProduct}
                lotNumber={lotNumber}
              />
            }
          />
        
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
