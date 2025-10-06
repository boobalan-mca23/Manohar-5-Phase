import Navbarr from "../Navbarr/Navbarr";
import BarcodeReader from "react-barcode-reader";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './AddRestore.css'
import { transform_text } from "../utils"; 
import Table from "react-bootstrap/esm/Table";

//  Import for PDF
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const AddNewRestore = () => {
  const [scannedProducts, setScannedProducts] = useState([]);
  const [restoreProducts, setRestoreProducts] = useState(new Set());
  const [restoreName, setRestoreName] = useState("");
  const navigate=useNavigate()
  const handleScan = async (product_number) => {
    if (restoreProducts.has(product_number)) {
      alert("Product is already at Restore Page!");
      return;
    }

    try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/restore/${product_number}`
      );

      if (response.status === 200) {
        alert("Product changed to active successfully");
        setScannedProducts((prevScanned) => [
          ...prevScanned,
          ...response.data.product_info,
        ]);
        console.log(response.data.product_info);
        setRestoreProducts(
          (prevSoldProducts) => new Set(prevSoldProducts.add(product_number))
        );
      }
    } catch (error) {
      alert(error.response.data.message);
      console.error("Error fetching product:", error.response.data.message);
    }
  };

  //  Export as PDF
  const exportPDF = () => {
    const input = document.getElementById("page-to-pdf");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width
      const pageHeight = 297; // A4 height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add extra pages if content is longer than 1 page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${restoreName || "Restore_Details"}.pdf`);
    });
  };

  
  // Totals
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
  const totalBarcodeWeight = scannedProducts
    .reduce((acc, product) => acc + parseFloat(product.barcode_weight || 0), 0)
    .toFixed(3);
  const totalFinalWeight = scannedProducts
    .reduce((acc, product) => acc + parseFloat(product.final_weight || 0), 0)
    .toFixed(3);

    const handleSave=async()=>{
      const payload={
        "description":restoreName||"",
        "restore_products":scannedProducts

      }
      try{
         const response=await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/restore`,payload)
         if(response.status===200){
          alert("Restore Saved SucessFully")
           navigate('/restore')
           console.log('response',response.data)
         }

      }catch(err){
         console.log(err.message)
         alert(err.message)
      }
  }

  return (
    <>
      <Navbarr />
      <div className="restoreback-tab">
        <div id="page-to-pdf">
          <h2>Restore Details</h2>
          <BarcodeReader onScan={handleScan} />

          <Table striped bordered hover className="add-tab">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product.No</th>
                <th>Before Weight</th>
                <th>After Weight</th>
                <th>Difference</th>
                <th>Adjustment</th>
                <th>Final Weight</th>
                <th>Enamel Weight</th>
              </tr>
            </thead>
            <tbody>
              {scannedProducts.length > 0 ? (
                scannedProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{transform_text(product.product_number)}</td>
                    <td>{product.before_weight}</td>
                    <td>{product.after_weight}</td>
                    <td>{product.difference}</td>
                    <td>{product.adjustment}</td>
                    <td>{product.barcode_weight}</td>
                    <td>{product.final_weight}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No products found.</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2">
                  <b>Total Weight</b>
               </td>
                <td>
                  <b>{totalBeforeWeight}</b>
                </td>
                <td>
                  <b>{totalAfterWeight}</b>
                </td>
                <td>
                  <b>{totalDifference}</b>
                </td>
                <td>
                  <b>{totalAdjustment}</b>
                </td>
                <td>
                  <b>{totalBarcodeWeight}</b>
                </td>
                <td>
                  <b>{totalFinalWeight}</b>
                </td>
              </tr>
            </tfoot>
          </Table>
        </div>

        <div className="pdf-btn">
          <input
            type="text"
            className="restore-name-input"
            placeholder="Enter Restore name"
            value={restoreName}
            onChange={(e) => setRestoreName(e.target.value)}
          />
        </div>

        <div className="button-save">
          <button className="pdf" onClick={()=>{handleSave()}}>Save</button>
          <button className="pdf" onClick={exportPDF}>
            Export as PDF
          </button>
        </div>
        <br />
      </div>
    </>
  );
};
export default AddNewRestore;
