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
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/restore/productNo/${product_number}`
      );

      if (response.status === 200) {
        
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
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 5;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL("image/png");

    // -------- Center Heading --------
    const heading = "Restore Details";
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);

    const textWidth =
      pdf.getStringUnitWidth(heading) *
      pdf.internal.getFontSize() /
      pdf.internal.scaleFactor;

    const textX = (pageWidth - textWidth) / 2;

    pdf.text(heading, textX, 15); // top center

    let contentStartY = 25; // table starts below heading

    // -------- First Page Content --------
    pdf.addImage(imgData, "PNG", margin, contentStartY, imgWidth, imgHeight);

    let heightLeft = imgHeight - (pageHeight - contentStartY);

    // -------- Extra Pages --------
    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin;
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
      <div className="addrestore-page">
  <Navbarr />

  <div className="addrestore-card" >
    <button className="addrestore-back-btn" onClick={() => navigate("/restore")}>
      ← Back
    </button>
    <h2 className="addrestore-title">Restore Details</h2>
    <BarcodeReader onScan={handleScan} />

    <Table className="addrestore-table" id="page-to-pdf">
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
          <th>ProductType</th>
        </tr>
      </thead>

      <tbody >
              {scannedProducts.length > 0 ? (
                scannedProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{transform_text(product.product_number)}</td>
                    {
                      product.itemType==="STONE" ? (
                      <>
                         <td>{product.before_weight}</td>
                         <td>{product.after_weight}</td>
                         <td>{product.difference}</td>
                         <td>{product.adjustment}</td>
                         <td>{product.barcode_weight}</td>
                         <td>{product.final_weight}</td>
                      </>
                      ):(
                      <>
                         <td className="blank">-</td>
                         <td className="blank">-</td>
                         <td className="blank">-</td>
                         <td className="blank">-</td>
                         <td >{product.netWeight}</td>
                         <td>{product.stoneWeight}</td>
                      </>)
                    }
                   
                    <td
                     style={{ color: product.itemType === "STONE" ? "green" : "blue" }}
                    ><b>{product.itemType}</b></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10">No products found.</td>
                </tr>
              )}
            </tbody>

      <tfoot>
        <tr>
          <td colSpan="2"><b>Total Weight</b></td>
          <td><b>{totalBeforeWeight}</b></td>
          <td><b>{totalAfterWeight}</b></td>
          <td><b>{totalDifference}</b></td>
          <td><b>{totalAdjustment}</b></td>
          <td><b>{totalBarcodeWeight}</b></td>
          <td><b>{totalFinalWeight}</b></td>
          <td></td>
        </tr>
      </tfoot>
    </Table>
  </div>

  <div className="addrestore-name-box">
    <input
      type="text"
      className="addrestore-name-input"
      placeholder="Enter Restore name"
      value={restoreName}
      onChange={(e) => setRestoreName(e.target.value)}
    />
  </div>

  <div className="addrestore-btn-row">
    <button
      className="addrestore-btn"
      onClick={handleSave}
      disabled={scannedProducts.length === 0}
    >
      Save
    </button>

    <button className="addrestore-btn" onClick={exportPDF}>
      Export PDF
    </button>
  </div>
</div>

    </>
  );
};
export default AddNewRestore;
