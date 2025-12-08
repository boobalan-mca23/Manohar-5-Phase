import { useParams } from "react-router-dom"
import { useState,useEffect } from "react"
import axios from "axios";
import Navbarr from "../Navbarr/Navbarr";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config";
import { transform_text } from "../utils"; 
import Table from "react-bootstrap/esm/Table";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import './ViewRestore.css'

const ViewRestore=()=>{
    const navigate=useNavigate()
    const[restoreItem,setRestoreItem]=useState([])
    const {id}=useParams()

    useEffect(()=>{
      const fetchRestoreItem=async()=>{
           try{
              const response=await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/V1/restore/${id}`)
              console.log('ViewItems',response.data.products)
              setRestoreItem(response.data.products)
           }catch(err){
              alert(err.message)
              console.log(err.message)
           }
      }
      fetchRestoreItem()
    },[id])

 const exportPDF = () => {
  const input = document.getElementById("page-to-pdf");

  html2canvas(input, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10; // 10mm margin on all sides
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin + 20; // leave space for heading

    // Add heading
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    const title = `Restore Items for # ${id}`;
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, margin + 10); // Centered title

    // Add first page content
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - position;

    // Add extra pages if content exceeds one page
    while (heightLeft > 0) {
      pdf.addPage();
      position = margin;
      pdf.addImage(imgData, "PNG", margin, position - (imgHeight - heightLeft), imgWidth, imgHeight);
      heightLeft -= pageHeight - margin;
    }

    pdf.save("Restore_Details");
  });
};




    const totalBeforeWeight = restoreItem
    .reduce((acc, product) => acc + parseFloat(product.before_weight || 0), 0)
    .toFixed(3);
  const totalAfterWeight = restoreItem
    .reduce((acc, product) => acc + parseFloat(product.after_weight || 0), 0)
    .toFixed(3);
  const totalDifference = restoreItem
    .reduce((acc, product) => acc + parseFloat(product.difference || 0), 0)
    .toFixed(3);
  const totalAdjustment = restoreItem
    .reduce((acc, product) => acc + parseFloat(product.adjustment || 0), 0)
    .toFixed(3);
  const totalBarcodeWeight = restoreItem
    .reduce((acc, product) => acc + parseFloat(product.barcode_weight || 0), 0)
    .toFixed(3);
  const totalFinalWeight = restoreItem
    .reduce((acc, product) => acc + parseFloat(product.final_weight || 0), 0)
    .toFixed(3);

    return(
    <>
      <Navbarr></Navbarr>
      <div className="viewrestore-page">
        <div className="viewrestore-card">
          <button className="viewrestore-back-btn" onClick={() => navigate('/restore')}>
            ← Back
          </button>
        <h3 className="viewrestore-title">Restore Items for #{id}</h3>
       <Table className="viewrestore-table" id="page-to-pdf">
            <thead className="viewrestore-thead">
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
            <tbody className="viewrestore-tbody">
              {restoreItem.length > 0 ? (
                restoreItem.map((product, index) => (
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
            <tfoot className="viewrestore-tfoot">
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
        <div className="viewrestore-btn-wrapper">
         
          <button className="viewrestore-pdf-btn" onClick={exportPDF}>
            Export as PDF
          </button>
        </div>
        </div>
    </>)
}

export default ViewRestore
