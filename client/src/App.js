
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./Components/Products/Products";
import Billing from './Components/Billing/Billing'
import AddBilling from "./Components/AddBilling/AddBilling";
import AddNewRestore from "./Components/AddRestore/AddRestore";
import BarcodePage from "./Components/BarcodePage/BarcodePage";
import Home from "./Components/Home/Home";
import Navbarr from "./Components/Navbarr/Navbarr";
import Login from "./Components/Login/Login";
import Restore from "./Components/Restore/Restore";
import ViewRestore from "./Components/ViewRestore/ViewRestore";
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
            path="/products/:lot_id"
            element={
              <Products
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
          <Route path="/home" element={<Home />} />
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


   
 

 

