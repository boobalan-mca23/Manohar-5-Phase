
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faTrash, faEye, faEdit } from "@fortawesome/free-solid-svg-icons";
import Table from "react-bootstrap/Table";
import { useParams, useLocation,useNavigate } from "react-router-dom";
import "../Products/Products.css";
import WeightFormPopup from "./View";
import AddProduct from "./AddProduct";
import ReactDOM from "react-dom";
import Navbarr from "../Navbarr/Navbarr";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Barcode from "react-qr-code";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactDOMServer from "react-dom/server";
import manoImage from "../../Components/Logo/mp.png";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config";
import { weightVerify,weightVerifyBoth,handleWeight,transform_text } from "../utils";
let isGeneratingPdf = false;

const Products = () => {
  const { lot_id } = useParams();
  const location = useLocation();
  const [showAddItemsPopup, setShowAddItemsPopup] = useState(false);
  const [products, setProducts] = useState([]);
  const [showBarcode, setShowBarcode] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const lotnameQuery = searchParams.get("lotname");
  const [lotNumber, setLotNumber] = useState(lotnameQuery || lot_id || "");
  const [bulkWeightBefore, setBulkWeightBefore] = useState("");
  const [bulkWeightAfter, setBulkWeightAfter] = useState("");
  const [beforeWeight, setBeforeWeight] = useState("");
  const [afterWeight, setAfterWeight] = useState("");
  const [productNumber, setProductNumber] = useState("");
  const [productWeight, setProductWeight] = useState("");
  const [finalWeight, setFinalWeight] = useState("");
  const [difference, setDifference] = useState("");
  const [adjustment, setAdjustment] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [status, setStatus] = useState("");
  const [showPopup, setShowPopup] = useState({ id: null, value: false });
  const afterWeightRef = useRef(null);
  const differenceRef = useRef(null);
  const adjustmentRef = useRef(null);
  const finalWeightRef = useRef(null);
  const productNumberRef = useRef(null);
  const productWeightRef = useRef(null);
  const [filterOpt, setFilterOpt] = useState("all");
  const navigate = useNavigate();
  const exportPDF = () => {
    const doc = new jsPDF();
    const imgWidth = 30; 
    const imgHeight = 20; 
    const pageWidth = doc.internal.pageSize.getWidth();
    const padding = 10; 

    const x = pageWidth - imgWidth - padding; 
    const y = padding; 

 
    doc.addImage(manoImage, "PNG", x, y, imgWidth, imgHeight,);
     const tableMarginTop = y + imgHeight + 10;
    const tableHeaders = [
      "S.No",
      "Product Number",
      "Before Weight",
      "After Weight",
      "Difference",
      "Adjustment",
      "Enamel Weight",
      "Final Weight",
      "Barcode Weight",
    ];

    const tableData = products.map((product, index) => [
      index + 1,
      transform_text(product.product_number),
      product.before_weight,
      product.after_weight,
      product.difference,
      product.adjustment,
      product.final_weight,
      product.barcode_weight,
    ]);

 
    const totalBeforeWeight = filterProducts
      .reduce((acc, product) => acc + parseFloat(product.before_weight || 0), 0)
      .toFixed(3);
    const totalAfterWeight = filterProducts
      .reduce((acc, product) => acc + parseFloat(product.after_weight || 0), 0)
      .toFixed(3);
    const totalDifference = filterProducts
      .reduce((acc, product) => acc + parseFloat(product.difference || 0), 0)
      .toFixed(3);
    const totalAdjustment = filterProducts
      .reduce((acc, product) => acc + parseFloat(product.adjustment || 0), 0)
      .toFixed(3);
    const totalFinalWeight = filterProducts
      .reduce((acc, product) => acc + parseFloat(product.final_weight || 0), 0)
      .toFixed(3);
    const totalBarcodeWeight = filterProducts
      .reduce(
        (acc, product) => acc + parseFloat(product.barcode_weight || 0),
        0
      )
      .toFixed(3);

 
    const bulkWeightDifference = (
      bulkWeightAfter - bulkWeightBefore || 0
    ).toFixed(3);

   
    const footerData = [
      [
        "",
        "Total Weight =",
        totalBeforeWeight,
        totalAfterWeight,
        totalDifference,
        totalAdjustment,
        totalFinalWeight,
        totalBarcodeWeight,
      ],
      ["", "Bulk Weight Difference:", "", "", bulkWeightDifference, "", "", ""],
    ];

   
    doc.autoTable({
      head: [tableHeaders],
      body: [...tableData, ...footerData],
      theme: "grid",
      margin: { top: 13 },
       margin: { top: tableMarginTop },
    
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [36, 36, 66], halign: "center" },
      bodyStyles: { fillColor: [255, 255, 255], halign: "center" },
      columnStyles: {
        0: { halign: "center" },
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
      },
    });


    doc.save("product_details.pdf");
  };



// const handleBulkExportPdf = async (items) => {
//   if (isGeneratingPdf) return;
//   isGeneratingPdf = true;

//   try {
//     const pdf = new jsPDF({
//       orientation: "landscape",
//       unit: "mm",
//       format: [56, 12],
//       compress: true,
//       dpi: 300,
//     });

//     const scale = 5;

//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];

//       const tempDiv = document.createElement("div");
//       tempDiv.style.position = "absolute";
//       tempDiv.style.top = "-9999px";
//       tempDiv.style.left = "-9999px";
//       tempDiv.style.width = "55mm";
//       tempDiv.style.height = "12mm";
//       tempDiv.style.display = "flex";
//       tempDiv.style.flexDirection = "row";
//       tempDiv.style.backgroundColor = "#fff";
//       tempDiv.style.border = "1px solid #ccc";
//       tempDiv.style.boxSizing = "border-box";
//       tempDiv.style.padding = "2mm";

//       const leftSection = document.createElement("div");
//       leftSection.style.display = "flex";
//       leftSection.style.flexDirection = "row";
//       leftSection.style.alignItems = "center";
//       leftSection.style.width = "50%";
//       leftSection.style.marginLeft = "1rem";

//       const qrCodeContainer = document.createElement("div");
//       qrCodeContainer.style.display = "flex";
//       qrCodeContainer.style.marginLeft = "1rem";
//       qrCodeContainer.style.fontWeight = "bold";
//       qrCodeContainer.style.fontSize = "9px";
//       qrCodeContainer.style.marginBottom = "2px";
//       qrCodeContainer.style.width = "2px";

//       const barcodeContainer = document.createElement("div");
//       qrCodeContainer.appendChild(barcodeContainer);

//       const barcodeSvg = (
//         <Barcode value={item.product_number} size={30} format="svg" />
//       );
//       const svgContainer = ReactDOMServer.renderToStaticMarkup(barcodeSvg);
//       barcodeContainer.innerHTML = svgContainer;

//       const detailsContainer = document.createElement("div");
//       detailsContainer.style.display = "flex";
//       detailsContainer.style.flexDirection = "column";

//       const barcodeWeightText = document.createElement("span");
//       barcodeWeightText.textContent = ` ${item.barcode_weight}`;
//       barcodeWeightText.style.fontSize = "11px";
//       barcodeWeightText.style.fontWeight = "bold";
//       barcodeWeightText.style.marginLeft = "7px";
//       detailsContainer.appendChild(barcodeWeightText);

//       const productNumberText = document.createElement("span");
//       productNumberText.textContent = ` ${transform_text(item.product_number)}`;
//       productNumberText.style.fontSize = "11px";
//       productNumberText.style.marginLeft = "4px";
//       productNumberText.style.fontWeight = "bold";
//       productNumberText.style.color = "black";
//       detailsContainer.appendChild(productNumberText);

//       qrCodeContainer.appendChild(detailsContainer);
//       leftSection.appendChild(qrCodeContainer);
//       tempDiv.appendChild(leftSection);

//       const rightSection = document.createElement("div");
//       rightSection.style.display = "flex";
//       rightSection.style.alignItems = "center";
//       rightSection.style.justifyContent = "center";
//       rightSection.style.width = "50%";
//       rightSection.style.marginLeft = "1rem";

//       const logoImg = document.createElement("img");
//       logoImg.src = manoImage;
//       logoImg.alt = "Logo";
//       logoImg.style.width = "15mm";
//       logoImg.style.height = "15mm";
//       logoImg.style.filter = "contrast(170%) brightness(100%)";
//       logoImg.style.boxShadow = "0px 0px 5px 2px black";
//       logoImg.style.fontWeight = "bold";
//       logoImg.style.marginBottom = "7px";
//       logoImg.style.marginLeft = "4.5mm";
//       rightSection.appendChild(logoImg);
//       tempDiv.appendChild(rightSection);

//       document.body.appendChild(tempDiv);

      
//       const canvas = await html2canvas(tempDiv, {
//         backgroundColor: null,
//         scale: scale,
//       });

//       const imgData = canvas.toDataURL("image/png");

//       pdf.addImage(imgData, "PNG", 0, 0, 56, 12);

//       document.body.removeChild(tempDiv);

//       if (i < items.length - 1) {
//         pdf.addPage();
//       }
//     }

//     const pdfBlob = pdf.output("blob");
//     const pdfUrl = URL.createObjectURL(pdfBlob);
//     window.open(pdfUrl, "_blank");
//   } catch (error) {
//     console.error("Error exporting barcodes as PDF:", error);
//   } finally {
//     isGeneratingPdf = false;
//   }
// };

const handleBulkExportPdf = async (items) => {
  if (isGeneratingPdf) return;
  isGeneratingPdf = true;
 
  try {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [56, 12],
      compress: true,
      dpi: 300,
    });
 
    const scale = 5;
 
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
 
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.top = "-9999px";
      tempDiv.style.left = "-9999px";
      tempDiv.style.width = "55mm";
      tempDiv.style.height = "12mm";
      tempDiv.style.display = "flex";
      tempDiv.style.flexDirection = "row";
      tempDiv.style.backgroundColor = "#fff";
      tempDiv.style.border = "1px solid #ccc";
      tempDiv.style.boxSizing = "border-box";
      tempDiv.style.padding = "2mm";
 
   
      const leftSection = document.createElement("div");
      leftSection.style.display = "flex";
      leftSection.style.flexDirection = "row";
      leftSection.style.alignItems = "center";
      leftSection.style.width = "50%";
      leftSection.style.marginLeft = "1rem";
 
      const qrCodeContainer = document.createElement("div");
      qrCodeContainer.style.display = "flex";
      // qrCodeContainer.style.marginLeft = "1rem";
      qrCodeContainer.style.fontWeight = "bold";
      qrCodeContainer.style.fontSize = "9px";
      qrCodeContainer.style.marginBottom = "2px";
      qrCodeContainer.style.width = "2px";
 
      const barcodeContainer = document.createElement("div");
      qrCodeContainer.appendChild(barcodeContainer);
 
      const barcodeSvg = (
        <Barcode value={item.product_number} size={30} format="png" />
      );
      const svgContainer = ReactDOMServer.renderToStaticMarkup(barcodeSvg);
      barcodeContainer.innerHTML = svgContainer;
 
      const detailsContainer = document.createElement("div");
      detailsContainer.style.display = "flex";
      detailsContainer.style.flexDirection = "column";
 
      const barcodeWeightText = document.createElement("span");
      barcodeWeightText.textContent = ` ${item.barcode_weight}`;
      barcodeWeightText.style.fontSize = "9px";
      barcodeWeightText.style.fontWeight = "bold";
      barcodeWeightText.style.marginLeft = "7px";
      detailsContainer.appendChild(barcodeWeightText);
 
      const productNumberText = document.createElement("span");
      productNumberText.textContent = ` ${transform_text(item.product_number)}`;
      productNumberText.style.fontSize = "9px";
      productNumberText.style.marginLeft = "4px";
      productNumberText.style.fontWeight = "bold";
      productNumberText.style.color = "black";
      detailsContainer.appendChild(productNumberText);
 
      qrCodeContainer.appendChild(detailsContainer);
      leftSection.appendChild(qrCodeContainer);
      tempDiv.appendChild(leftSection);
 
      const rightSection = document.createElement("div");
      rightSection.style.display = "flex";
      rightSection.style.alignItems = "center";
      rightSection.style.justifyContent = "center";
      rightSection.style.width = "50%";
      rightSection.style.marginLeft = "1rem";
 
      const logoImg = document.createElement("img");
      logoImg.src = manoImage;
      logoImg.alt = "Logo";
      logoImg.style.width = "13mm";
      logoImg.style.height = "13mm";
      logoImg.style.filter = "contrast(170%) brightness(100%)";
      logoImg.style.boxShadow = "0px 0px 5px 2px black";
      logoImg.style.fontWeight = "bold";
      logoImg.style.marginBottom = "7px";
      logoImg.style.marginLeft = "4.5mm";
      logoImg.style.marginBottom="4px";
      rightSection.appendChild(logoImg);
      tempDiv.appendChild(rightSection);
 
      document.body.appendChild(tempDiv);
 
     
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: null,
        scale: scale,
      });
 
   
      const rotatedCanvas = document.createElement("canvas");
      rotatedCanvas.width = canvas.width;
      rotatedCanvas.height = canvas.height;
      const ctx = rotatedCanvas.getContext("2d");
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
 
      const imgData = rotatedCanvas.toDataURL("image/png");
 
   
      pdf.addImage(imgData, "PNG", 0, 0, 56, 12);
 
      document.body.removeChild(tempDiv);
 
      if (i < items.length - 1) {
        pdf.addPage();
      }
    }
 
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  } catch (error) {
    console.error("Error exporting barcodes as PDF:", error);
  } finally {
    isGeneratingPdf = false;
  }
};
const handleKeyDown = (e, nextField) => {
  if (e.key === "Enter") {
    e.preventDefault();
    nextField.current.focus();
  }
};
  useEffect(() => {
    const fetchLotDetails = async () => {
      console.log("Fetching lot details...");
      try {
        const response = await axios.get(
          `${REACT_APP_BACKEND_SERVER_URL}/api/v1/lot/${lot_id}`
        );

        const lot = response.data.lotInfo?.[0];
        console.log("Fetched Lot Data:", lot);

        if (lot) {
          setBulkWeightBefore(lot.bulk_weight_before || "");
          setBulkWeightAfter(lot.bulk_after_weight || "");
        }
      } catch (error) {
        console.error("Failed to fetch lot details:", error);
      }
    };

    fetchLotDetails();
  }, [lot_id]);


  const handleAddItems = () => {
    setShowAddItemsPopup(true);
  };

  const openPopup = (id) => {
    console.log("Open popup pppppppppp",id)
    setShowPopup({ id });
  };
  const handleSave = (productId) => {
    setSelectedProductId(productId);
    setShowPopup(true);
  };
  const closePopup = () => {
    setShowPopup({ id: null });
  };
  const closeAddItemsPopup = () => {
    setShowAddItemsPopup(false);
  };


  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await axios.delete(
          `${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/delete/${productId}`
        );

        if (response.status === 200) {
          setProducts((prevProducts) =>
            prevProducts.filter((product) => product.id !== productId)
          );
           toast.success("Product deleted successfully!");
          
           
          
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("There was an error deleting the product.");
      }
    }
  };

  const handleUpdateWeights = async () => {
 
    console.log(bulkWeightAfter,bulkWeightBefore,"oooooooooooo")
    const payload = {
      lot_id: Number(lot_id),
      bulk_weight_before: parseFloat(bulkWeightBefore),
      bulk_after_weight: parseFloat(bulkWeightAfter),
    };

    try {
      const response = await axios.post(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/lot/modify_lot`,
        payload
      );
 
      if (response.status === 200) {

        console.log("dataaa", response.data.result);

        const value = response.data.result;
        setBulkWeightAfter(value.bulk_after_weight);
        setBulkWeightBefore(value.bulk_weight_before);
 
         toast.success("Bulk weights updated successfully!");
      }
    } catch (error) {
      console.error("Error updating bulk weights:", error);
      alert("There was an error updating the bulk weights.");
    }
  };
 
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/getAll/${lot_id}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [lot_id]);

  const handleCalculate = async () => {
    if (!bulkWeightBefore || !bulkWeightAfter) {
      alert("Please enter both Bulk Weight Before and Bulk Weight After.");
      return;
    }
    let isTrue= weightVerifyBoth(bulkWeightBefore,totalBeforeWeight,bulkWeightAfter,totalAfterWeight)//Verify Weight
    
    if(isTrue){
       try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/calculate/${lot_id}`
      );
      if (response.status === 200) {
        const calculatedProducts = response.data.products;
        setProducts(calculatedProducts);
        const firstProduct = calculatedProducts[0];
        setBeforeWeight(firstProduct.before_weight || "");
        setAfterWeight(firstProduct.after_weight || "");
        setDifference(firstProduct.difference?.toFixed(3) || "");
        setAdjustment(firstProduct.adjustment?.toFixed(3) || "");
        setFinalWeight(firstProduct.final_weight?.toFixed(2) || "");
        setProductNumber(firstProduct.product_number || "");
        setStatus(firstProduct.product_type || "");
        setProductWeight(firstProduct.barcode_weight || "");
        toast.success("Calculated values updated successfully!");
        window.location.reload()
      }
    } catch (error) {
      console.error("Error calculating adjustments:", error);
      toast.error("There was an error calculating the adjustments.");
    }

    }
    
  };
 
  // const handleSave = async () => {

  //   // if (!beforeWeight || !afterWeight || !productNumber || !difference || !adjustment || !finalWeight) {
  //     if (!beforeWeight && !afterWeight && !productNumber && !productWeight) {
  //     alert("Please fill in all the required fields before saving.");
  //     return;
  //   }


  

  //   try {
  //     const payload = {
  //       tag_number: lotNumber,
  //       before_weight: beforeWeight || null,
  //       after_weight: afterWeight || null,
  //       barcode_weight: productWeight || null,
  //       difference: difference || null,  
  //       adjustment: adjustment || null, 
  //       final_weight: finalWeight || null,  
  //       product_number: productNumber || null,  
    
  //       lot_id: Number(lot_id),
  //     };

  //     const response = await axios.post(
  //       `${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/create`,
  //       payload
  //     );

  //     if (response.status === 200) {
  //       setProducts((prevProducts) => [
  //         ...prevProducts,
  //         response.data.newProduct,
  //       ]);
    
  //       closeAddItemsPopup();
  //        toast.success("Products saved successfully!");
  //       // window.location.reload()
  //           setTimeout(() => {
  //             window.location.reload();
  //           }, 3000);
  //     }
  //   } catch (error) {
  //     console.error("Error saving product:", error);
  //     alert("There was an error saving the product.");
  //   }
  // };




  const filterProducts = products.filter((item) => {
    if (filterOpt === "all") {
      return true;
    } else if (filterOpt === "active") {
      return item.product_type === "active";
    } else if (filterOpt === "sold") {
      return item.product_type === "sold";
    } 
  });


  

 
  const totalBeforeWeight = filterProducts.reduce((acc, product) => acc + parseFloat(product.before_weight || 0), 0).toFixed(3);
  const totalAfterWeight = filterProducts.reduce((acc, product) => acc + parseFloat(product.after_weight || 0), 0).toFixed(3);
  const totalDifference = filterProducts.reduce((acc, product) => acc + parseFloat(product.difference || 0), 0).toFixed(3);
  const totalAdjustment = filterProducts.reduce((acc, product) => acc + parseFloat(product.adjustment || 0), 0).toFixed(3);
  const totalFinalWeight = filterProducts.reduce((acc, product) => acc + parseFloat(product.final_weight || 0), 0).toFixed(3);
 const totalBarcodeWeight = filterProducts.reduce((acc, product) => {
    const weight = parseFloat(product?.barcode_weight);
    // if weight is NaN, treat as 0
   return acc + (isNaN(weight) ? 0 : weight);
}, 0).toFixed(3);

console.log("totalFinalWeight", totalBarcodeWeight);

  
useEffect(() => {
  const handleBarcodeScan = (e) => {
    setShowBarcode((prevData) => prevData + e.key);
    if (e.key === "Enter") {
      console.log("Scanned Barcode:", showBarcode);
      setShowBarcode("");
    }
  };
 
  window.addEventListener("keydown", handleBarcodeScan);
  return () => {
    window.removeEventListener("keydown", handleBarcodeScan);
  };
}, [showBarcode]);
const handleBulkWeight=async(fieldName)=>{
  // temprory closed
  // try {
  //        const weight = await handleWeight();  // Await the function call and Weight Api
        
  //        switch (fieldName) {
  //            case "bulkWeightBefore":
  //                setBulkWeightBefore(weight);
  //                break;
  //            case "bulkWeightAfter":
  //               setBulkWeightAfter(weight);
  //                break;
            
  //            default:
  //                console.warn("Invalid field:", fieldName);
  //        }
  //    } catch (err) {
        
  //        console.error("Error fetching weight:", err);
  //    }
}

const handleVerify=(value)=>{

value==="Before" ? 
weightVerify("Before",bulkWeightBefore,totalBeforeWeight)
:weightVerify("After",bulkWeightAfter,totalAfterWeight)
}
  return (
    <>
      <div className="products-page">
        <Navbarr />
        <div className="add-items">
          <button  onClick={() => navigate("/beadsenamellot")}>
            ← Back
          </button>
          <button onClick={handleAddItems}>Add Items</button>
          <select
            style={{ marginLeft: "1rem", height: "1.5rem", width: "5rem" }}
            id="cars"
            name="cars"
            value={filterOpt}
            onChange={(e) => setFilterOpt(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div className="weight">
          <div className="cont">
            <label>Bulk Weight Before: </label>
            <input
              value={bulkWeightBefore}
              onChange={(e) => setBulkWeightBefore(e.target.value)}
            />
            <button className="bulkWeightbtn" onClick={()=>{handleBulkWeight('bulkWeightBefore')}}>Enter</button>
          </div>
          <div className="cont">
            <label>Bulk Weight After: </label>
            <input
              value={bulkWeightAfter}
              onChange={(e) => setBulkWeightAfter(e.target.value)}
            />
            <button className="bulkWeightbtn" onClick={()=>{handleBulkWeight('bulkWeightAfter')}}>Enter</button>
          </div>
          <div className="cont">
            {" "}
            <label>Bulk Weight Difference: </label>
            <input value={(bulkWeightAfter - bulkWeightBefore ).toFixed(3)|| "-" } readOnly/>
          </div>
          <button
            className="up"
            onClick={handleUpdateWeights}
            style={{
              fontWeight: "bold",
              width: "7rem",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          >
            Update
          </button>
          <div className="update">
            <button onClick={handleCalculate}>Calculate</button> <span> </span>
          </div>
        </div>
        {/* <div className="update">
          <button onClick={handleCalculate}>Calculate</button> <span> </span>
        </div> */}
        <div id="page-to-pdf">
          <div className="table-container">
             <div className="list-2">Lot : {lotNumber}</div>
            <div className="list">List of Stone & Enamel Items</div>
            <Table striped bordered hover className="tab">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th style={{ width: "11rem" }}>Product Number</th>
                  <th>Before Weight</th>
                  <th>After Weight</th>
                  <th>Difference</th>
                  <th>Adjustment</th>
                  <th>Enamel weight</th>
                  <th>Final Weight</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td >{transform_text(product.product_number)}</td>
                    <td>{product.before_weight || ""}</td>
                    <td>{product.after_weight || ""}</td>
                    <td>{product.difference?.toFixed(2) || ""}</td>
                    <td>{product.adjustment?.toFixed(2) || ""}</td>
                    <td>{product.final_weight?.toFixed(3) || ""}</td>
                    <td>
                      {
                        product.barcode_weight === "null"
                          ? ""
                          :Number( product.barcode_weight).toFixed(3) || ""
                      }
                    </td>
                    <td  style={{ fontSize: "0.95rem" }}>
                       {product.product_type || ""}
                    </td>
                    <td>
                      <div className="stone-icon">
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => openPopup(product.id)}
                        />
                      
                        <FontAwesomeIcon
                          icon={faTrash}
                          onClick={() => handleDelete(product.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" style={{textAlign:"center"}}>
                    <b>Total Weight  </b>
                  </td>
                  <td style={{textAlign:"center"}}>
                    <b>{totalBeforeWeight}</b>
                    <button className="weight-verify" onClick={()=>handleVerify("Before")}>Verify</button>
                  </td>
                  <td style={{textAlign:"center"}}>
                    <b>{totalAfterWeight}</b>
                    <button className="weight-verify" onClick={()=>handleVerify("After")}>Verify</button>
                  </td>
                  <td style={{textAlign:"center"}}>
                    <b>{totalDifference}</b>
                  </td>
                  <td style={{textAlign:"center"}}>
                    <b>{totalAdjustment}</b>
                  </td>
                  <td style={{textAlign:"center"}}>
                    <b>{totalFinalWeight}</b>
                  </td>
                  <td style={{textAlign:"center"}}>
                    <b>{totalBarcodeWeight}</b>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
                <br/>
              </tfoot>
            </Table>
            {showPopup.id &&(
              <WeightFormPopup
                showPopup={true}
                closePopup={closePopup}
                productId={showPopup.id}
                product={products.find(p => p.id === showPopup.id)}
                productInfo={products.find(p => p.id === showPopup.id)}
                updateProductList={setProducts}
              />
            )}
            <div className="products-page-diff-wrapper">
              <div className="diffCont">
                <label>Bulk Weight Difference:</label>
                <input value={(bulkWeightAfter - bulkWeightBefore).toFixed(3) || "-"} readOnly />
              </div>

              <div className="diffCont">
                <label>Before Bulk Weight Difference:</label>
                <input value={(bulkWeightBefore-totalBeforeWeight).toFixed(3) || "-"} readOnly />
              </div>

              <div className="diffCont">
                <label>After Bulk Weight Difference:</label>
                <input value={(bulkWeightAfter-totalAfterWeight).toFixed(3)|| "-"} readOnly />
              </div>
              <button
              className="exportPdfBtn"
               onClick={exportPDF}
        >
          Export as PDF{" "}
        </button>
        <button
          onClick={() => handleBulkExportPdf(products)}
          className="printAllBtn"
        >
          Print All
        </button>
            </div>
          </div>
        </div>
        
        {showAddItemsPopup && (
              <AddProduct
              showAddItemsPopup={showAddItemsPopup}
              closeAddItemsPopup={closeAddItemsPopup}
              products={products}
              setProducts={setProducts}
              />
        )}
      </div>
    </>
  );
};
export default Products;

