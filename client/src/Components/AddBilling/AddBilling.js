
import React, { useState, useEffect } from "react";
import "../AddBilling/AddBilling.css";
import Table from "react-bootstrap/esm/Table";
import jsPDF from "jspdf";
import Switch from '@mui/material/Switch';
import html2canvas from "html2canvas";
import { useParams, useNavigate } from "react-router-dom";
import BarcodeReader from "react-barcode-reader";
import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import { cleanPlainProduct, transform_text,formatWeight} from "../utils"; 
import Navbarr from "../Navbarr/Navbarr";
import "jspdf-autotable";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config";
import { toast,ToastContainer} from "react-toastify";
import { tabClasses ,IconButton} from "@mui/material";
import {RiDeleteBin6Line} from "react-icons/ri";
import BillRestoreProducts from "./BillRestoreProducts/BillRestoreProducts";
import BillSoldProducts from "./BillSoldProducts/BillSoldProducts";
import ReactDOMServer from "react-dom/server";
import BillPrintLayout from "../PrintLayouts/Bill/BillPrintLayout"

const AddBilling = () => {
  const navigate = useNavigate();
  const [scannedProducts, setScannedProducts] = useState([]);
  const [billName, setBillName] = useState("");
  const [checkedProducts, setCheckedProducts] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({
    selectAll:false,
    beforeWeight: false,
    afterWeight: false,
    difference: false,
    adjustment: false,
    finalWeight: true,
    barcodeWeight: true,
    // complete: true, 
  });
  const { bill_number, bill_type } = useParams();
  const [soldProducts, setSoldProducts] = useState(new Set());
  const [selectAllChecked, setSelectAllChecked] = useState(false); 
  const [products,setProducts]=useState({
      restore:[],
      sold:[]
  })
  const [editMode,setEditMode]=useState(false)

  const label = { inputProps: { 'aria-label': 'Color switch demo' } };


const exportPrint= () => {
   
    // if we need to save bill that time this function make call or update function call

    bill_number==="bill"? handleSellApprove("Sell"):handleUpdateBill()
   
     const printContent = (
      <BillPrintLayout
        billName={billName}
        selectedColumns={selectedColumns}
        scannedProducts={scannedProducts}
        restore={products.restore}
        sold={products.sold}

      />
    );

    const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bill Print</title>
       
      <body>
        ${ReactDOMServer.renderToString(printContent)}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          };
        </script>
      </body>
    </html>
  `;
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    printWindow.document.write(printHtml);
    printWindow.document.close();

};


  const fetchBillNo = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/bills/bills/` + bill_number
      );
      setBillName(response.data.billName.bill_name)
      setScannedProducts(response.data.products);
      
      setProducts(()=>(
        {restore:response.data.activeProducts,
        sold:response.data.soldProducts}))

    } catch (error) {
      console.log("Error fetching bill data:", error);
    }
  };

  useEffect(() => {
    fetchBillNo();
  }, []);

  useEffect(() => {
  const soldChecked = scannedProducts
    .filter(p => p.product_type === "sold")
    .map(p => ({
      productId: p.product_number,
      id: p.id
    }));

  setCheckedProducts(soldChecked);
}, [scannedProducts]);

  const handleScan = async (product_number) => {
    
    console.log('bill ProdutNo',product_number)

    if (soldProducts.has(product_number)) {
      alert("Product is already sold!");
      return;
    }

    try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/${product_number}`
      );

      if (response.status === 200) {
        
        setScannedProducts((prevProducts) => [
          ...prevProducts,
          response.data.product,
        ]);
        
        setSoldProducts((prevSoldProducts) => new Set(prevSoldProducts.add(product_number)));
      } else {
        console.error("Failed to fetch product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      alert(error.response.data.msg)
    }
  };


  const handleSellApprove = async (value) => {
    console.log("Selected products:", checkedProducts);
    try {
      console.log(value, "llllllllllllllllllllll");
      console.log("Selected products:", checkedProducts);

     
      const response = await axios.post(
        `${REACT_APP_BACKEND_SERVER_URL}/bills/bill-details`,
        {
          button: value,
          bill_name: billName,
          selected_products: checkedProducts,
        }
      );
      console.log("Backend response:", response); 
 
      if (response.status === 200) {
        alert(`Bill ${value === "Sell" ? "SOLD" : "APPROVED"} successfully!`);
        navigate(`/billing`);
       
      }
    } catch (error) {
      console.error("Error sending Sell data:", error);
      alert("Error saving bill.");
    } 
  };

  const handleCheckboxChange = (productId, id) => {
    setCheckedProducts((prevCheckedProducts) => {
      let updatedCheckedProducts;
      const isProductChecked = prevCheckedProducts.some(
        (product) => product.productId === productId
      );
      if (isProductChecked) {
        updatedCheckedProducts = prevCheckedProducts.filter(
          (id) => id.productId !== productId
        );
      } else {
        updatedCheckedProducts = [...prevCheckedProducts, { productId, id }];
      }
      return updatedCheckedProducts;
    });
  };

  const handleColumnCheckboxChange = (column) => {
    setSelectedColumns((prevSelectedColumns) => ({
      ...prevSelectedColumns,
      [column]: !prevSelectedColumns[column],
    }));
  };



const handleSelectAllChange = () => {
  const newValue = !selectAllChecked;
  setSelectAllChecked(newValue);

  if (newValue) {
    const newProducts = scannedProducts
      .filter(p => p.product_type !== "sold")
      .map(p => ({
        productId: p.product_number,
        id: p.id,
      }));

    setCheckedProducts(prev => [
      ...prev.filter(p =>
        scannedProducts.find(sp =>
          sp.product_number === p.productId &&
          sp.product_type === "sold"
        )
      ),
      ...newProducts,
    ]);
  } else {
    // remove ONLY new products
    setCheckedProducts(prev =>
      prev.filter(p =>
        scannedProducts.find(sp =>
          sp.product_number === p.productId &&
          sp.product_type === "sold"
        )
      )
    );
  }
};

  // const handleSelectAllChange = () => {
  //   setSelectAllChecked((prev) => !prev);
  //   if (!selectAllChecked) {
  //     setCheckedProducts(
  //       scannedProducts.map((product) => ({
  //         productId: product.product_number,
  //         id: product.id,
  //       }))
  //     );
  //   } else {
  //     setCheckedProducts([]);
  //   }
  // };

  const totalBeforeWeight = scannedProducts
    .reduce((acc, product) => acc + parseFloat(product.before_weight || 0), 0)
    .toFixed(3);
  const totalAfterWeight = scannedProducts
    .reduce((acc, product) => acc + parseFloat(product.after_weight || 0), 0)
    .toFixed(3);
  const totalDifference = scannedProducts
    .reduce((acc, product) => acc + parseFloat(product.difference || 0), 0)
    .toFixed(3);
  const totalAdjustment = scannedProducts
    .reduce((acc, product) => acc + parseFloat(product.adjustment || 0), 0)
    .toFixed(3);
   const totalBarcodeWeight = scannedProducts.reduce((acc, product) => {

  if (product.itemType === "PLAIN") {
    return acc + parseFloat(product.netWeight || 0);
  } else {
    // STONE
    return acc + parseFloat(product.barcode_weight || 0);
  }
}, 0).toFixed(3);

  const totalFinalWeight=scannedProducts.reduce((acc,product)=>{
    if (product.itemType === "PLAIN") {
    return acc + parseFloat(product.stoneWeight || 0);
  } else {
    // STONE
    return acc + parseFloat(product.final_weight || 0);
  }
  },0).toFixed(3)
  

const handleSelectAllColumn = () => {
  const newValue = !selectedColumns.selectAll;

  setSelectedColumns({
    selectAll: newValue,
    beforeWeight: newValue,
    afterWeight: newValue,
    difference: newValue,
    adjustment: newValue,
    finalWeight: newValue,
    barcodeWeight: newValue,
    
  });
 
}
const handleRemoveproductToBill=async(productId)=>{
      const isTrue=window.confirm('Are you sure you want to remove this product from this bill? After removal, the product will be removed from the bill and its status will be set to Active')

      if(isTrue){
            try{
                const response= await axios.put(`${REACT_APP_BACKEND_SERVER_URL}/bills/updateandRemove/${productId}`)
                if(response.data.status==="ok"){
                  setScannedProducts(response.data.allProducts)
                  setProducts(()=>(
             {
              restore:response.data.activeProducts,
              sold:response.data.soldProducts
            }))
                  toast.success('Product Removed From Bill')
             }

            }catch(err){
              console.log(err.message)
              toast.error(err.message)
            }
      }
      
}
const handleUpdateBill=async()=>{
        try{
         const payLoad={
           billName:billName,
           selected_products:checkedProducts
         }
        

         const response=await axios.put(
          `${REACT_APP_BACKEND_SERVER_URL}/bills/updateBill/${bill_number}`,
           payLoad
        )

         if(response.data.status==="ok"){
            toast.success(response.data.message)
            
            setTimeout(() => {
            navigate("/billing");
         }, 1500); // 1.5 seconds is perfect

           
         }
      }catch(err){
              console.log(err.message)
              toast.error(err.message)
      }
     
}
  // const handleEditMode=(value)=>{
  //   if(value){
  //     setEditMode(value)
  //     toast.success('Bill Edit Mode Activated')
  //   }
  //    else{
  //     setEditMode(value)
  //     toast.error('Bill Edit Mode Diactivated')
  //   }

  // }

  return (
    <>
      <Navbarr />
      <div className="addbill-page">
       
       <ToastContainer 
          position="top-right" 
          autoClose={2000} 
          />

      <div className="addbill-card">
        
        <div id="page-to-pdf">
         <div className="bill-header-flex">
            <div>
                <button className="addbill-back-btn" onClick={() => navigate("/billing")}>
               ← Back
             </button>
            </div>
          <div>
             <h2> Bill Details</h2>
          </div>
          <div>
          {/* {bill_number!=="bill" && ( 
            
             <Switch {...label} 
              value={editMode}
              onChange={(e)=>{handleEditMode(e.target.checked)
              }}
             />  
          )} */}
          </div>
             
         </div>
          <BarcodeReader onScan={handleScan} />
          <div className="addbill-table-wrapper">
              
          <table className="addbill-table" id="billPdf">
            <thead>
              <tr>
                <th>  S.No </th>
                <th> Product.No </th>
                {selectedColumns.beforeWeight && <th> Before Weight </th>}
                {selectedColumns.afterWeight && <th> After Weight </th>}
                {selectedColumns.difference && <th> Difference </th>}
                {selectedColumns.adjustment && <th> Adjustment </th>}
                {selectedColumns.barcodeWeight&& <th> Final Weight</th>}
                {selectedColumns.finalWeight && <th> Enamel Weight </th>}
                
                {/* {selectedColumns.complete && ( */}
                  <th>
                    <Checkbox
                      checked={selectAllChecked}
                      onChange={handleSelectAllChange}
                      style={{ color: "white" }}
                    />
                    Select All
                  </th>
                  
                {/* )} */}
                <th>Action</th>
              </tr>
            </thead>
           <tbody>
              {scannedProducts.length > 0 ? (
                scannedProducts.map((product, index) => (
                  <tr key={index}>
                   <td>{index + 1}</td>
                   <td> { product.itemType==="STONE"? transform_text(product.product_number):cleanPlainProduct(product.product_number)}</td>
                    {selectedColumns.beforeWeight && <td>{product.itemType==="STONE"? formatWeight(product.before_weight):"-"}</td>}
                    {selectedColumns.afterWeight && <td>{product.itemType==="STONE"? formatWeight(product.after_weight):"-"}</td>}
                    {selectedColumns.difference && <td>{product.itemType==="STONE"?formatWeight(product.difference):"-"}</td>}
                    {selectedColumns.adjustment && <td>{product.itemType==="STONE"?formatWeight(product.adjustment):"-"}</td>}
                    {selectedColumns.barcodeWeight&& <td>{product.itemType==="PLAIN"?formatWeight(product.netWeight):formatWeight(product.barcode_weight)}</td>}
                    {selectedColumns.finalWeight && <td>{product.itemType==="PLAIN"?formatWeight(product.stoneWeight):formatWeight(product.final_weight)}</td>}
                    {/* {selectedColumns.complete && ( */}
                      <td>
                        <input
                         style={{cursor:"pointer"}}
                          disabled={product.product_type==="sold"?true:false}
                          type="checkbox"
                          checked={checkedProducts.some(
                            (item) => item.productId === product.product_number
                          )}
                          onChange={() =>
                            handleCheckboxChange(product.product_number, product.id)
                          }
                        />
                      </td>
                    {/* )} */}
                    <td>{product.product_type==="sold"? 

                      <IconButton onClick={()=>{handleRemoveproductToBill(product.id)}}>
                        <RiDeleteBin6Line size={20} color="#242442"  />
                      </IconButton>:

                      <span style={{fontSize:"20px",fontWeight:"bold"}}>-</span>}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">No products found.</td>
                </tr>
              )}
            </tbody>
            
            <tfoot>
              <tr className="bill-tfoot">
                 <td ><b>Total Weight </b></td>
                 <td><b>-</b></td>
                {selectedColumns.beforeWeight && <td><b>{totalBeforeWeight}</b></td>}
                {selectedColumns.afterWeight && <td><b>{totalAfterWeight}</b></td>}
                {selectedColumns.difference && <td><b>{totalDifference}</b></td>}
                {selectedColumns.adjustment && <td><b>{totalAdjustment}</b></td>}
                {selectedColumns.barcodeWeight && <td> <b>{totalBarcodeWeight}</b></td>}
                {selectedColumns.finalWeight && <td><b>{totalFinalWeight}</b></td>}
                {selectedColumns.complete && <td><b>-</b></td>}
                <td ></td>
              </tr>
            </tfoot>
          </table>
       
           {/*Restore Products*/}
           {bill_number!=="bill" && (
             <>
             <h2>Restore Products</h2>
             <BillRestoreProducts
               restoreProducts={products.restore}
               selectedColumns={selectedColumns}
             />
             </>
          )}

        {/*Sold Products*/}
          {bill_number!=="bill" && (
            <>
              <h2>Sold Products</h2>
              <BillSoldProducts
               soldProducts={products.sold}
               selectedColumns={selectedColumns}
              />
          
           </>)}
          
          </div>
          </div>

            <div className="addbill-name-wrapper">
              <input
                type="text"
                className="addbill-name-input"
                placeholder="Enter bill name"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
              />
            </div>
          
          <div className="addbill-action-row">
            {bill_number==="bill" &&  <button className="addbill-btn" onClick={() => handleSellApprove("Sell")}> Save </button>}
            <button className="addbill-btn" onClick={exportPrint}>
              Print Bill
            </button>
            {bill_number!=="bill" && <button className="updatebill-btn" onClick={()=>{handleUpdateBill()}}>Update Bill</button>}
          </div>
          <br/>

          <div className="addbill-column-checklist">
             <label  >
              <Checkbox
                type="checkbox"
                checked={selectedColumns.selectAll}
                onChange={handleSelectAllColumn}
                style={{ color: "rgb(36, 36, 66)" }}
                
              />
              Select All
            </label>
            {/* <label  >
              <Checkbox
                type="checkbox"
                checked={selectedColumns.serialNo}
                onChange={() => handleColumnCheckboxChange("serialNo")}
                style={{ color: "rgb(36, 36, 66)" }}
                
              />
              S.No
            </label>
            <label>
              <Checkbox
                type="checkbox"
                checked={selectedColumns.productNumber}
                onChange={() => handleColumnCheckboxChange("productNumber")}
                style={{ color: "rgb(36, 36, 66)" }}
              />
              Product.No
            </label> */}
            <label>
              <Checkbox
                type="checkbox"
                checked={selectedColumns.beforeWeight}
                onChange={() => handleColumnCheckboxChange("beforeWeight")}
                style={{ color: "rgb(36, 36, 66)" }}
              />
              Before Weight
            </label>
            <label>
              <Checkbox
                type="checkbox"
                checked={selectedColumns.afterWeight}
                onChange={() => handleColumnCheckboxChange("afterWeight")}
                style={{ color: "rgb(36, 36, 66)" }}
              />
              After Weight
            </label>
            <label>
              <Checkbox
                type="checkbox"
                checked={selectedColumns.difference}
                onChange={() => handleColumnCheckboxChange("difference")}
                style={{ color: "rgb(36, 36, 66)" }}
              />
              Difference
            </label>
            <label>
              <Checkbox
                type="checkbox"
                checked={selectedColumns.adjustment}
                onChange={() => handleColumnCheckboxChange("adjustment")}
                style={{ color: "rgb(36, 36, 66)" }}
              />
              Adjustment
            </label>
            <label>
            <Checkbox
              type="checkbox"
              checked={selectedColumns.barcodeWeight}
              onChange={() => handleColumnCheckboxChange("barcodeWeight")}
              style={{ color: "rgb(36, 36, 66)" }}
            />
            Final weight
          </label> 
            <label>
              <Checkbox
                type="checkbox"
                checked={selectedColumns.finalWeight} 
                onChange={() => handleColumnCheckboxChange("finalWeight")}
                style={{ color: "rgb(36, 36, 66)" }}
              />
              Enamel Weight
            </label>  
          
          </div>
      </div>
       </div>
    </>
  );
};

export default AddBilling;
