
import React, { useState, useEffect } from "react";
import "../AddBilling/AddBilling.css";
import Table from "react-bootstrap/esm/Table";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams, useNavigate } from "react-router-dom";
import BarcodeReader from "react-barcode-reader";
import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import { cleanPlainProduct, transform_text } from "../utils"; 
import Navbarr from "../Navbarr/Navbarr";
import "jspdf-autotable";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config";
 
const AddBilling = () => {
  const navigate = useNavigate();
  const [scannedProducts, setScannedProducts] = useState([]);
  const [billName, setBillName] = useState("");
  const [checkedProducts, setCheckedProducts] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({
    serialNo: true,
    productNumber: true,
    beforeWeight: false,
    afterWeight: false,
    difference: false,
    adjustment: false,
    finalWeight: true,
    barcodeWeight: true,
    complete: true, 
  });
  const { bill_number, bill_type } = useParams();
  const [soldProducts, setSoldProducts] = useState(new Set());
  const [selectAllChecked, setSelectAllChecked] = useState(false); 

const exportPDF = () => {
  const input = document.getElementById("billPdf");

  html2canvas(input, { scale: 2 }).then((canvas) => {
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 5;

    /* ---------------- HEADER ---------------- */

    // TITLE
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Bill Details", pageWidth / 2, 15, { align: "center" });

    // BILL NAME (LEFT)
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Bill Name : ${billName}`, margin, 25);

    // DATE (RIGHT)
    pdf.text(
      `Date : ${new Date().toLocaleDateString("en-GB")}`,
      pageWidth - margin,
      25,
      { align: "right" }
    );

    /* ---------------- IMAGE CONTENT ---------------- */

    const imgData = canvas.toDataURL("image/png");

    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 35; // start AFTER header

    pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);

    let heightLeft = imgHeight - (pageHeight - yPosition);

    /* ---------------- MULTI PAGE ---------------- */

    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin;
    }

    /* ---------------- SAVE ---------------- */

    const pdfName = billName?.trim()
      ? `${billName}.pdf`
      : "billing_details.pdf";

    pdf.save(pdfName);
  });
};



  
  

  const fetchBillNo = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/bills/bills/` + bill_number
      );
      setBillName(response.data.billName.bill_name)
      setScannedProducts(response.data.products);
    } catch (error) {
      console.log("Error fetching bill data:", error);
    }
  };

  useEffect(() => {
    fetchBillNo();
  }, []);


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
        navigate(`/billing/${response.data.bill.bill_number}`);
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
    setSelectAllChecked((prev) => !prev);
    if (!selectAllChecked) {
      setCheckedProducts(
        scannedProducts.map((product) => ({
          productId: product.product_number,
          id: product.id,
        }))
      );
    } else {
      setCheckedProducts([]);
    }
  };

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
const getVisibleColumnCount = () => {
  let count = 0;

  if (selectedColumns.serialNo) count++;
  if (selectedColumns.productNumber) count++;

  return count;
};


  return (
    <>
      <Navbarr />
      <div className="addbill-page">
      <div className="addbill-card">
        <div id="page-to-pdf">
          <button className="addbill-back-btn" onClick={() => navigate("/billing")}>
            ← Back
          </button>
          <h2> Bill Details</h2>
          <BarcodeReader onScan={handleScan} />
          <div className="addbill-table-wrapper">
          <table className="addbill-table" id="billPdf">
            <thead>
              <tr>
                {selectedColumns.serialNo && <th>  S.No </th>}
                {selectedColumns.productNumber && <th> Product.No </th>}
                {selectedColumns.beforeWeight && <th> Before Weight </th>}
                {selectedColumns.afterWeight && <th> After Weight </th>}
                {selectedColumns.difference && <th> Difference </th>}
                {selectedColumns.adjustment && <th> Adjustment </th>}
                {selectedColumns.barcodeWeight&& <th> Final Weight</th>}
                {selectedColumns.finalWeight && <th> Enamel Weight </th>}
                
                {selectedColumns.complete && bill_number === "bill" && (
                  <th>
                    <Checkbox
                      checked={selectAllChecked}
                      onChange={handleSelectAllChange}
                      style={{ color: "white" }}
                    />
                    Select All
                  </th>
                )}
              </tr>
            </thead>
           <tbody>
              {scannedProducts.length > 0 ? (
                scannedProducts.map((product, index) => (
                  <tr key={index}>
                    {selectedColumns.serialNo && <td>{index + 1}</td>}
                    {selectedColumns.productNumber && <td> { product.itemType==="STONE"? transform_text(product.product_number):cleanPlainProduct(product.product_number)}</td>}
                    {selectedColumns.beforeWeight && <td>{product.itemType==="STONE"? product.before_weight:"-"}</td>}
                    {selectedColumns.afterWeight && <td>{product.itemType==="STONE"? product.after_weight:"-"}</td>}
                    {selectedColumns.difference && <td>{product.itemType==="STONE"?product.difference:"-"}</td>}
                    {selectedColumns.adjustment && <td>{product.itemType==="STONE"?product.adjustment:"-"}</td>}
                    {selectedColumns.barcodeWeight&& <td>{product.itemType==="PLAIN"?product.netWeight:product.barcode_weight}</td>}
                    {selectedColumns.finalWeight && <td>{product.itemType==="PLAIN"?product.stoneWeight:product.final_weight}</td>}
                    {selectedColumns.complete && bill_number === "bill" && (
                      <td>
                        <input
                          type="checkbox"
                          checked={checkedProducts.some(
                            (item) => item.productId === product.product_number
                          )}
                          onChange={() =>
                            handleCheckboxChange(product.product_number, product.id)
                          }
                        />
                      </td>
                    )}
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
                <td colSpan={getVisibleColumnCount()}><b>Total Weight </b></td>
                {selectedColumns.beforeWeight && <td><b>{totalBeforeWeight}</b></td>}
                {selectedColumns.afterWeight && <td><b>{totalAfterWeight}</b></td>}
                {selectedColumns.difference && <td><b>{totalDifference}</b></td>}
                {selectedColumns.adjustment && <td><b>{totalAdjustment}</b></td>}
                {selectedColumns.barcodeWeight && <td> <b>{totalBarcodeWeight}</b></td>}
                {selectedColumns.finalWeight && <td><b>{totalFinalWeight}</b></td>}
              </tr>
            </tfoot>
          </table>
          </div>
          </div>

          {bill_number === "bill" ? (
            <div className="addbill-name-wrapper">
              <input
                type="text"
                className="addbill-name-input"
                placeholder="Enter bill name"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
              />
            </div>
          ):<div className="addbill-name-wrapper" >
               <input
                type="text"
                readOnly
                className="addbill-name-input"
                value={billName}
             
              />
            </div>}
          <div className="addbill-action-row">
            {bill_number==="bill" &&  <button className="addbill-btn" onClick={() => handleSellApprove("Sell")}> Save </button>}
            <button className="addbill-btn" onClick={exportPDF}>
              Export as PDF
            </button>
          </div>
          <br/>

          <div className="addbill-column-checklist">
            <label  >
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
            </label>
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
