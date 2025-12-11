// PlainProducts.jsx
import React, { useState, useRef, useEffect } from "react";
// import { subscribeWeight } from "../../../services/webSocket";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faTrash, faEye, faCamera } from "@fortawesome/free-solid-svg-icons";
import Table from "react-bootstrap/Table";
import { useParams, useLocation ,useNavigate} from "react-router-dom";
import ReactDOM from "react-dom";
import Navbarr from "../../Navbarr/Navbarr";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactDOMServer from "react-dom/server";
import manoImage from "../../../Components/Logo/mp.png";
import { REACT_APP_BACKEND_SERVER_URL } from "../../../config";
import QRCode from "react-qr-code";
import { weightVerify, weightVerifyBoth,handleWeight,transform_text } from "../../utils";
import "./PlainProducts.css";
import weightImg from '../../../assets/weight.png'
let isGeneratingPdf = false;


const PlainProducts = () => {
  const { lot_id } = useParams(); // assume DB id (plainLot.id)
  console.log("lot_id param:", lot_id);
  const location = useLocation();
  const [showAddPopup, setShowAddPopup] = useState(false);
  const navigate = useNavigate();
  // original states
  const [products, setProducts] = useState([]);
  const [showBarcode, setShowBarcode] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const lotnameQuery = searchParams.get("lotname");
  const [lotNumber, setLotNumber] = useState(lotnameQuery || lot_id || "");
  const [showPopup, setShowPopup] = useState({ id: null, value: false });
  const [filterOpt, setFilterOpt] = useState("all");

  // add-product popup form states (kept inside same file)
  const [itemsList, setItemsList] = useState([]); // master items
  const [goldsmithsList, setGoldsmithsList] = useState([]); // goldsmiths
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedGoldsmithId, setSelectedGoldsmithId] = useState("");
  const [productName, setProductName] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [grossWeight, setGrossWeight] = useState("");
  const [stoneWeight, setStoneWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");

  // camera / captured file
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileBlobRef = useRef(null); // holds File to send to backend
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [editProduct, setEditProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  // const [weight, setWeight] = useState(0);



// get weight using call back function
  // useEffect(() => {
  //   const unsubscribe = subscribeWeight((w) => setWeight(w));

  //   return () => unsubscribe();
  // }, []);


   


  // fetch lot and products (uses your plainLot endpoint)
useEffect(() => {
  const fetchPlainLot = async () => {
    try {
      const res = await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/lot/${lot_id}`);
      const payload = res.data || {};
      // backend might return different shapes; try to discover any products array
      const lotsArray = payload.products || payload.result || payload.lotInfo || [];
      const lotEntry = Array.isArray(lotsArray) && lotsArray.length ? lotsArray[0] : lotsArray || null;

      // Try to find the products list inside response
      const allProducts =
        lotEntry?.products ||
        lotEntry?.product_info ||
        payload.products ||
        payload.result?.products ||
        [];

      // Filter plain products (backend stores itemType as uppercase "PLAIN" or "STONE")
      const plainProducts = Array.isArray(allProducts)
        ? allProducts.filter(p => ((p.itemType || p.itemtype || "").toString().toUpperCase()) === "PLAIN")
        : [];

      setProducts(plainProducts);
      console.log("lot entry name:", lotEntry.lot_name);
      if (lotEntry?.lot_name) setLotNumber(lotEntry.lot_name);
      if (!lotEntry?.lot_name && payload.lotInfo?.lotId) setLotNumber(payload.lotInfo.lotId);
    } catch (err) {
      console.error("Failed to fetch plain lot:", err);
      setProducts([]);
    }
  };

  fetchPlainLot();
  fetchMasters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [lot_id]);

  // fetch masters (items + goldsmith)
  const fetchMasters = async () => {
    try {
      const [itemsRes, goldRes] = await Promise.all([
        axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/masterItem/allItems`),
        axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/goldSmith/allGS`)
      ]);
      console.log(itemsRes.data, goldRes.data);
      setItemsList(itemsRes.data.allItems || itemsRes.data || []);
      setGoldsmithsList(goldRes.data.allGoldSmith || goldRes.data || []);
      console.log(itemsRes, goldRes);
    } catch (err) {
      console.error("Failed to fetch master lists:", err);
    }
  };

  // compute net weight whenever gross/stone changes
  useEffect(() => {
    const g = parseFloat(grossWeight || 0);
    const s = parseFloat(stoneWeight || 0);
    if (!isNaN(g) && !isNaN(s)) setNetWeight((g - s).toFixed(3));
  }, [grossWeight, stoneWeight]);

  // keep barcode scanner hook (from earlier)
  useEffect(() => {
    const handleBarcodeScan = (e) => {
      setShowBarcode((prevData) => (prevData || "") + e.key);
      if (e.key === "Enter") {
        console.log("Scanned Barcode:", showBarcode);
        setShowBarcode("");
      }
    };
    window.addEventListener("keydown", handleBarcodeScan);
    return () => {
      window.removeEventListener("keydown", handleBarcodeScan);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBarcode]);

  // filters & totals (keep your logic)
  const filterProducts = Array.isArray(products) ? products.filter((item) => {
    if (filterOpt === "all") return true;
    if (filterOpt === "active") return item.product_type === "active";
    if (filterOpt === "sold") return item.product_type === "sold";
    return true;
  }) : [];

  const totalBeforeWeight = filterProducts.reduce((acc, product) => acc + parseFloat(product.before_weight || 0), 0).toFixed(3);
  const totalAfterWeight = filterProducts.reduce((acc, product) => acc + parseFloat(product.after_weight || 0), 0).toFixed(3);
  const totalDifference = filterProducts.reduce((acc, product) => acc + parseFloat(product.difference || 0), 0).toFixed(3);
  const totalAdjustment = filterProducts.reduce((acc, product) => acc + parseFloat(product.adjustment || 0), 0).toFixed(3);
  const totalFinalWeight = filterProducts.reduce((acc, product) => acc + parseFloat(product.final_weight || 0), 0).toFixed(3);
  const totalBarcodeWeight = filterProducts.reduce((acc, product) => acc + parseFloat(product.barcode_weight || 0), 0).toFixed(3);

  // exportPDF and handleBulkExportPdf kept (copied trimmed for brevity but same behavior)
  const exportPDF = () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try{
    const doc = new jsPDF();
    const imgWidth = 30; 
    const imgHeight = 20; 
    const pageWidth = doc.internal.pageSize.getWidth();
    const padding = 10; 
    const x = pageWidth - imgWidth - padding; 
    const y = padding; 
    doc.addImage(manoImage, "PNG", x, y, imgWidth, imgHeight);
    const tableMarginTop = y + imgHeight + 10;
    const tableHeaders = [
      "S.No",
      "Product Number",
      "Product Name",
      "Worker",
      "Gross",
      "Stone",
      "Net",
    ];
    const tableData = filterProducts.map((p, idx) => [
      idx + 1,
      p.product_id || p.id,
      p.productName || "",
      p.workerName || "",
      p.grossWeight || "",
      p.stoneWeight || "",
      p.netWeight || "",
    ]);
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      margin: { top: tableMarginTop },
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [36, 36, 66], halign: "center" },
    });
    doc.save("plain_products.pdf");
  } finally {
    setPdfLoading(false);
  }
  };

  // keep the big barcode export function (you had it intact earlier), omitted here for brevity. Use your existing one if needed.
const handleBulkExportPdf = async (items) => {
  if (printing) return;
  setPrinting(true);
  console.log("items", items);
  if (!Array.isArray(items) || items.length === 0) {
    toast.info("No items to print");
    setPrinting(false);
    return;
  }
  if (isGeneratingPdf) {
  setPrinting(false);
  return;
}
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
      const item = items[i] || {};
      // --- sanitize values
      console.log("item for pdf", item);
      const rawId = item.product_number ?? item.product_id ?? item.id ?? "";
      // make sure qrValue is a string and not "undefined"
      let qrValue = rawId === undefined || rawId === null ? "" : String(rawId).trim();
      // if qrValue empty, fallback to productName or an empty string
      if (!qrValue) qrValue = (item.productName ? String(item.productName) : "");

      // Build sticker DOM
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
      tempDiv.style.alignItems = "center";

      // left (qr + details)
      const leftSection = document.createElement("div");
      leftSection.style.display = "flex";
      leftSection.style.flex = "1";
      leftSection.style.alignItems = "center";

      const qrWrapper = document.createElement("div");
      qrWrapper.style.display = "flex";
      qrWrapper.style.flexDirection = "row";
      qrWrapper.style.gap = "6px";
      qrWrapper.style.alignItems = "center";

      // container where qr svg will go:
      const barcodeContainer = document.createElement("div");
      barcodeContainer.style.display = "flex";
      barcodeContainer.style.alignItems = "center";
      barcodeContainer.style.justifyContent = "center";

      // attempt to render QR; if it fails, fallback to plain text
      if (qrValue) {
        try {
          const qrSvg = <QRCode value={qrValue} size={40} style={{ height: "40px", width: "40px" }} />;
          const qrMarkup = ReactDOMServer.renderToStaticMarkup(qrSvg);
          barcodeContainer.innerHTML = qrMarkup;
        } catch (err) {
          console.error("QR render error for item", item, err);
          // fallback: show textual box instead of svg
          barcodeContainer.innerHTML = `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px dashed #999;font-size:9px;">QR<br>NA</div>`;
        }
      } else {
        barcodeContainer.innerHTML = `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px dashed #999;font-size:9px;">QR<br>NA</div>`;
      }

      // details next to QR
      const detailsContainer = document.createElement("div");
      detailsContainer.style.display = "flex";
      detailsContainer.style.flexDirection = "column";
      detailsContainer.style.marginLeft = "6px";
      detailsContainer.style.fontSize = "9px";

      const weightText = document.createElement("span");
      // prefer netWeight, fallback grossWeight, then empty
      weightText.textContent = ` ${item.netWeight ?? item.grossWeight ?? ""}`;
      weightText.style.fontWeight = "700";
      detailsContainer.appendChild(weightText);

      const idText = document.createElement("span");
      // ensure transform_text gets a string
      try {
        idText.textContent = ` ${transform_text(String(qrValue || ""))}`;
      } catch (err) {
        console.warn("transform_text failed, using raw value", qrValue, err);
        idText.textContent = ` ${qrValue || ""}`;
      }
      detailsContainer.appendChild(idText);

      qrWrapper.appendChild(barcodeContainer);
      qrWrapper.appendChild(detailsContainer);
      leftSection.appendChild(qrWrapper);
      tempDiv.appendChild(leftSection);

      // right (logo)
      const rightSection = document.createElement("div");
      rightSection.style.display = "flex";
      rightSection.style.flex = "0 0 40%";
      rightSection.style.alignItems = "center";
      rightSection.style.justifyContent = "center";

      const logoImg = document.createElement("img");
      logoImg.src = manoImage;
      logoImg.alt = "Logo";
      logoImg.style.width = "13mm";
      logoImg.style.height = "13mm";
      logoImg.style.objectFit = "contain";
      rightSection.appendChild(logoImg);
      tempDiv.appendChild(rightSection);

      // append to doc DOM
      document.body.appendChild(tempDiv);

      // render to canvas
      const canvas = await html2canvas(tempDiv, { backgroundColor: null, scale });
      // rotate if you still need rotation
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
      if (i < items.length - 1) pdf.addPage();
    }

    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  } catch (error) {
    console.error("Error exporting barcodes as PDF:", error);
    toast.error("Failed to generate PDF. See console.");
  } finally {
    isGeneratingPdf = false;
    setPrinting(false);
  }
};


const handleWeightData=async()=>{
      try{
        const weight = await handleWeight();
        console.log(weight);
 
        if(weight!==null && weight!==undefined){
            setGrossWeight(weight);
       }
 
      }catch(err){
         console.log(err.message)
        
      }
  }


  // Delete function (uses plainProducts delete endpoint)
  const handleDelete = async (productId) => {
    if (deletingId) return; 
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(productId);
      try {
        const res = await axios.delete(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/delete/${productId}`);
        if (res.status === 200) {
          setProducts(prev => prev.filter(p => p.id !== productId));
          toast.success("Product deleted successfully!");
        } else {
          toast.error("Failed to delete product.");
        }
      } catch (err) {
        console.error("Error deleting product:", err);
        toast.error("There was an error deleting the product.");
      } finally {
        setDeletingId(null);
      }
  };


  // View popup open/close (keeps your old WeightFormPopup usage)
  const openPopup = (id) => {
    setShowPopup({ id });
  };
  const closePopup = () => {
    setShowPopup({ id: null });
  };

  // ---------- ADD PRODUCT POPUP LOGIC (SINGLE-FILE POPUP) ----------
  const openAddPopup = () => {
    setSelectedItemId("");
    setSelectedGoldsmithId("");
    setProductName("");
    setWorkerName("");
    setGrossWeight("");
    setStoneWeight("");
    setNetWeight("");
    fileBlobRef.current = null;
    setPreviewUrl(null);
    setShowAddPopup(true);
  };

  const closeAddPopup = () => {
    // stop camera if open
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks() || [];
      tracks.forEach(t => t.stop());
    }
    setSelectedItemId("");
    setSelectedGoldsmithId("");
    setProductName("");
    setWorkerName("");
    setGrossWeight("");
    setStoneWeight("");
    setCameraOpen(false);
    setShowAddPopup(false);
   
    
  };

  const startCamera = async () => {
    try {
      setCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("camera error", err);
      toast.error("Cannot open camera");
    }
  };

  const captureFromCamera = () => {
    try {
      if (!videoRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ratio = 1; // square capture
      const w = 800;
      const h = 800;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Capture failed");
          return;
        }
        const file = new File([blob], `plain_${Date.now()}.jpg`, { type: "image/jpeg" });
        fileBlobRef.current = file;
        // set preview url but we only show when user clicks preview button (we store it)
        const localUrl = URL.createObjectURL(blob);
        setPreviewUrl(localUrl);

        // stop camera after capture
        const tracks = video.srcObject ? video.srcObject.getTracks() : [];
        tracks.forEach((t) => t.stop());
        setCameraOpen(false);
        toast.success("Captured. Click Preview to view image.");
      }, "image/jpeg", 0.9);
    } catch (err) {
      console.error("capture error", err);
      toast.error("Capture error");
    }
  };

  const onSelectItem = (id) => {
    setSelectedItemId(id);
    const it = itemsList.find((x) => String(x.id) === String(id));
    if (it) {
      setProductName(it.itemName || "");
    }
  };

  const onSelectGold = (id) => {
    setSelectedGoldsmithId(id);
    const g = goldsmithsList.find((x) => String(x.id) === String(id));
    if (g) {
      setWorkerName(g.name || "");
    }
  };

  // Save new plain product
  const handleSavePlainProduct = async () => {
    if (savingProduct) return;
    setSavingProduct(true);
    if (!productName || !workerName) {
      toast.error("Please select product and goldsmith");
      setSavingProduct(false);
      return;
    }

    if (!grossWeight || !stoneWeight) {
      toast.error("Please enter weights");
      setSavingProduct(false);
      return;
    }
    // if (!fileBlobRef.current) { toast.error("Please capture an image (camera)"); return; }

    const fd = new FormData();
    // make backend robust: include multiple lot keys
    fd.append("lotId", String(lot_id));
    fd.append("lot_id", String(lot_id));
    fd.append("plainLotId", String(lot_id));

    // plain-specific fields
    fd.append("productName", productName);
    fd.append("workerName", workerName);
    fd.append("grossWeight", String(grossWeight));
    fd.append("stoneWeight", String(stoneWeight));
    fd.append("netWeight", String(netWeight));
    fd.append("goldSmithCode", (goldsmithsList.find(gs=>String(gs.id)===String(selectedGoldsmithId))?.goldSmithCode) || "");
    fd.append("itemCode", (itemsList.find(it=>String(it.id)===String(selectedItemId))?.itemCode) || "");

    // IMPORTANT: backend expects itemType (must be uppercase)
    fd.append("itemType", "PLAIN");

    // send file using field name gross_weight_img so server's img mapping is clear
    // ONLY append image if it exists
    if (fileBlobRef.current) {
      fd.append(
        "gross_weight_img",
        fileBlobRef.current,
        fileBlobRef.current.name || `gross_${Date.now()}.jpg`
      );
    }

   console.log("Submitting new plain product with data:",fd)
    try {
      const res = await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/create`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      const newP = res.data.newProduct;
      // const newP = res.data?.newProduct || res.data?.createdProduct || res.data;
      // console.log("dar", res.data.productImage);
      console.log("boo test", res.data);
      if (!newP) {
        toast.error("Create response shape unexpected — check console");
        console.error("Create product response:", res.data);
        setSavingProduct(false);
        return;
      }
      console.log("Created new plain product:", newP);
      setProducts(prev => [...prev, newP]);
      toast.success("Product added");
      fileBlobRef.current = null; setPreviewUrl(null); setShowAddPopup(false);
      setSelectedItemId("");
      setSelectedGoldsmithId("");
      setProductName("");
      setWorkerName("");
      setGrossWeight("");
      setStoneWeight("");
    } catch (err) {
      console.error("Create product failed:", err?.response?.data || err);
      const msg = err?.response?.data?.message || err?.response?.data?.err || "Create failed";
      toast.error(msg);
    }finally {
      setSavingProduct(false);
    }
  };



  //update plain product
  const updatePlainProduct = async () => {
  try {
    const fd = new FormData();
    fd.append("productName", editProduct.productName);
    fd.append("workerName", editProduct.workerName);
    fd.append("grossWeight", editProduct.grossWeight);
    fd.append("stoneWeight", editProduct.stoneWeight);
    fd.append("netWeight", editProduct.netWeight);
    fd.append("goldSmithCode", editProduct.goldSmithCode || "");
    fd.append("itemCode", editProduct.itemCode || "");
    fd.append("itemType", "PLAIN"); // required validation on server

    // if you let user change image and have a file blob, append as gross_weight_img
    if (fileBlobRef.current) fd.append("gross_weight_img", fileBlobRef.current, fileBlobRef.current.name || `gross_${Date.now()}.jpg`);

    const res = await axios.put(
      `${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/update/${editProduct.id}`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const updated = res.data?.updateProduct || res.data?.updatedProduct || res.data;
    setProducts(prev => prev.map(p => p.id === editProduct.id ? updated : p));
    toast.success("Product updated!");
    setEditProduct(null);
  } catch (err) {
    console.error(err);
    toast.error("Update failed");
  }
  };


  // show preview modal when user clicks 'Preview'
  const openPreview = () => {
    if (!previewUrl) {
      toast.info("No captured image to preview");
      return;
    }
    setShowPreviewModal(true);
  };

  // ---------- render ----------
  return (
    <>
      <div className="background">
        <Navbarr />
        <div className="plain-add-items">
           <button  onClick={() => navigate("/PlainLot ")}>
            ← Back
          </button>
          <button onClick={() => setShowAddPopup(true)}>Add Items</button>
          <select
            style={{ marginLeft: "1rem", height: "1.5rem", width: "4rem" }}
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

        {/* keep Bulk weight section removed in plain mode (you told earlier) */}
        <div id="page-to-pdf">
          <div className="plain-table-container">
             <div className="list-2">Lot : {lotNumber}</div>
            <div className="list">List of Plain Items</div>
            <div className="list"></div>
            <Table striped bordered hover className="plain-tab">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th style={{ width: "11rem" }}>Product ID</th>
                  <th>Product Name</th>
                  <th>Worker</th>
                  <th>Gross Weight</th>
                  <th>Stone Weight</th>
                  <th>Net Weight</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* {console.log("ssss",filterProducts)} */}
                {filterProducts.map((product, index) => (
                  <tr key={product.id || index}>
                    <td>{index + 1}</td>
                    <td>{product.product_number || product.product_id || product.id || ""}</td>
                    <td>{product.productName || ""}</td>
                    <td>{product.workerName || ""}</td>
                    <td>{product.grossWeight || ""}</td>
                    <td>{product.stoneWeight || ""} </td>
                    <td>{product.netWeight || ""} </td>
                    <td style={{ fontSize: "0.95rem" }} >{ product.product_type==="active" ? "Active" : "Sold"}</td>
                    <td>
                      <div className="icon" style={{ display: "flex", gap: 18, justifyContent: "center" }}>
                        <FontAwesomeIcon
                            icon={faEye}
                            onClick={() => {
                              console.log("View product:", product);
                              setEditProduct(product)}
                            }
                            style={{ cursor: "pointer" }}
                          />

                        <FontAwesomeIcon icon={faTrash}
                        style={{
                            cursor: deletingId === product.id ?  "not-allowed":"pointer",
                            opacity: deletingId === product.id ?  0.5 : 1, 
                            pointerEvents: deletingId === product.id ? "none":"auto",
                        }}  
                        onClick={() => handleDelete(product.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4"><b>Totals</b></td>
                    <td style={{textAlign:"center"}}><b>{filterProducts.reduce((a,p)=>a+Number(p.grossWeight||0),0).toFixed(3)}</b></td>
                    <td style={{textAlign:"center"}}><b>{filterProducts.reduce((a,p)=>a+Number(p.stoneWeight||0),0).toFixed(3)}</b></td>
                    <td style={{textAlign:"center"}}><b>{filterProducts.reduce((a,p)=>a+Number(p.netWeight||0),0).toFixed(3)}</b></td>
                    <td colSpan="2"></td>
                   </tr>
                </tfoot>
            </Table>
          </div>
        </div>

        <div style={{ margin: "1rem 0 2rem 4rem", display: "flex", gap: 12 }}>
          <button onClick={exportPDF} disabled={pdfLoading} style={actionBtnStyle}>{pdfLoading ? "Exporting..." : "Export as PDF"}</button>
          <button onClick={() => handleBulkExportPdf(products)} style={actionBtnStyle}>{printing ? "Printing..." : "Print All"}</button>
        </div>
      </div>

      {/* ---------- ADD PRODUCT POPUP (B2 New modal layout) ---------- */}
      {showAddPopup && (
        <div className="plain-modal-overlay" style={modalOverlayStyle}>
          <div className="plain-modal-box" style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Add Plain Product</h3>
              <button onClick={closeAddPopup} style={closeBtnStyle}><FontAwesomeIcon icon={faXmark} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
             <div>
                <label>Item (master)</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => onSelectItem(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Item</option>
                  {itemsList.map(it => (
                    <option key={it.id} value={it.id}>
                      {it.itemName} ({it.itemCode})
                    </option>
                  ))}
                </select>

                {/* Item Code Display */}
                <input
                  style={{ ...inputStyle, marginTop: 5, background: "#f5f5f5" }}
                  value={itemsList.find(it => it.id == selectedItemId)?.itemCode || ""}
                  placeholder="Item Code"
                  readOnly
                />

                <label style={{ marginTop: 12 }}>Goldsmith</label>
                <select
                  value={selectedGoldsmithId}
                  onChange={(e) => onSelectGold(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Goldsmith</option>
                  {goldsmithsList.map(gs => (
                    <option key={gs.id} value={gs.id}>
                      {gs.name} ({gs.goldSmithCode})
                    </option>
                  ))}
                </select>

                {/* Goldsmith Code Display */}
                <input
                  style={{ ...inputStyle, marginTop: 5, background: "#f5f5f5" }}
                  value={goldsmithsList.find(gs => gs.id == selectedGoldsmithId)?.goldSmithCode || ""}
                  placeholder="Goldsmith Code"
                  readOnly
                />

                {/* <label style={{ marginTop: 12 }}>Product Name</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  style={inputStyle}
                />

                <label style={{ marginTop: 8 }}>Worker Name</label>
                <input
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  style={inputStyle}
                /> */}
              </div>

              <div>
                <label>Gross Weight</label>
                <div className="weightImg">
                <input value={grossWeight} onChange={(e) => setGrossWeight(e.target.value)} style={inputStyle} />
                <img src={weightImg} onClick={()=>{handleWeightData()}} alt="weightImage" width={40} height={40}></img>
                </div>

                <label style={{ marginTop: 8 }}>Stone Weight</label>
                <input value={stoneWeight} onChange={(e) => setStoneWeight(e.target.value)} style={inputStyle} />

                <label style={{ marginTop: 8 }}>Net Weight</label>
                <input value={netWeight} readOnly style={inputStyle} />

                {/* Camera area: camera icon (black), capture, preview */}
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={startCamera} title="Open camera" style={cameraBtnStyle} >
                    <FontAwesomeIcon icon={faCamera} style={{ color: "black" }} /> {cameraOpen ? "Open Camera" : "Open Camera"}
                  </button>

                  <button onClick={captureFromCamera} title="Capture" style={captureBtnStyle}>Capture</button>
                  <button
                    onClick={openPreview}
                    title="Preview captured image"
                    style={{
                      ...previewBtnStyle,
                      opacity: previewUrl ? 1 : 0.4,
                      pointerEvents: previewUrl ? "auto" : "none",
                    }}
                  >
                    Preview
                  </button>
                </div>

                {/* video element only visible if cameraOpen */}
                {cameraOpen && (
                  <div style={{ marginTop: 10 }}>
                    <video ref={videoRef} autoPlay style={{ width: "100%", borderRadius: 6 }} />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button onClick={handleSavePlainProduct} style={saveBtnStyle} disabled={savingProduct}>{savingProduct ? "Saving..." : "Save"}</button>
              <button onClick={closeAddPopup} style={cancelBtnStyle}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* editProduct */}
      {editProduct && (
        <div className="plain-modal-overlay" style={modalOverlayStyle}>
          <div className="plain-modal-box" style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Edit Product</h3>
              <button onClick={() => setEditProduct(null)} style={closeBtnStyle}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* FORM */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              
              {/* Left Side */}
              <div>
                <label>Product Name</label>
                <input
                  style={inputStyle}
                  value={editProduct.productName}
                  onChange={(e) => setEditProduct({ ...editProduct, productName: e.target.value })}
                />
                <label>Item Code</label>
                  <input
                    style={{ ...inputStyle, background: "#f5f5f5" }}
                    value={
                      editProduct.itemCode ||
                      editProduct.itemcode ||
                      itemsList.find(it => it.itemName === editProduct.productName)?.itemCode ||
                      ""
                    }
                    readOnly
                  />
                <label style={{ marginTop: 8 }}>Worker Name</label>
                <input
                  style={inputStyle}
                  value={editProduct.workerName}
                  onChange={(e) => setEditProduct({ ...editProduct, workerName: e.target.value })}
                />

                <label style={{ marginTop: 8 }}>Goldsmith Code</label>
                  <input
                    style={{ ...inputStyle, background: "#f5f5f5" }}
                    value={
                      editProduct.goldSmithCode ||
                      editProduct.goldsmithCode ||
                      goldsmithsList.find(gs => gs.name === editProduct.workerName)?.goldSmithCode ||
                      ""
                    }
                    readOnly
                  />
              </div>

              {/* Right Side */}
              <div>
                <label>Gross Weight</label>
             <div className="weightImg">
                <input
                  style={inputStyle}
                  value={editProduct.grossWeight}
                  onChange={(e) => {
                    const g = parseFloat(e.target.value);
                    const s = parseFloat(editProduct.stoneWeight || 0);
                    setEditProduct({
                      ...editProduct,
                      grossWeight: e.target.value,
                      netWeight: (g - s).toFixed(3)
                    });
                  }}
                />
                <img src={weightImg} onClick={()=>{handleWeightData()}} alt="weightImage" width={40} height={40}></img>
              
              </div>
          
                <label style={{ marginTop: 8 }}>Stone Weight</label>
                <input
                  style={inputStyle}
                  value={editProduct.stoneWeight}
                  onChange={(e) => {
                    const s = parseFloat(e.target.value);
                    const g = parseFloat(editProduct.grossWeight || 0);
                    setEditProduct({
                      ...editProduct,
                      stoneWeight: e.target.value,
                      netWeight: (g - s).toFixed(3)
                    });
                  }}
                />

                <label style={{ marginTop: 8 }}>Net Weight</label>
                <input style={inputStyle} value={editProduct.netWeight} readOnly />

                {/* --- CURRENT IMAGE --- */}
                  <label style={{ marginTop: 12 }}>Current Image</label>
                  <img
                    src={`${REACT_APP_BACKEND_SERVER_URL}/uploads/${editProduct.product_images?.[0]?.gross_weight_img}`}
                    alt="Product"
                    style={{ width: "300px", borderRadius: "10px" }}
                  />

                  {/* --- CAMERA CONTROLS --- */}
                  <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
                    <button onClick={startCamera} style={cameraBtnStyle}>
                      <FontAwesomeIcon icon={faCamera} /> Camera
                    </button>

                    <button onClick={captureFromCamera} style={captureBtnStyle}>
                      Capture
                    </button>

                    <button
                      onClick={() => setShowPreviewModal(true)}
                      style={{
                        ...previewBtnStyle,
                        opacity: previewUrl ? 1 : 0.4,
                        pointerEvents: previewUrl ? "auto" : "none"
                      }}
                    >
                      Preview
                    </button>
                  </div>

                  {/* --- CAMERA PREVIEW --- */}
                  {cameraOpen && (
                    <div style={{ marginTop: 10 }}>
                      <video ref={videoRef} autoPlay style={{ width: "100%", borderRadius: 8 }} />
                      <canvas ref={canvasRef} style={{ display: "none" }} />
                    </div>
                  )}
              </div>
            </div>

            {/* Save + Cancel */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button style={saveBtnStyle} onClick={updatePlainProduct}>Save</button>
              <button style={cancelBtnStyle} onClick={() => setEditProduct(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}



      {/* Preview modal */}
      {showPreviewModal && previewUrl && (
        <div className="plain-modal-overlay" style={modalOverlayStyle}>
          <div className="plain-modal-box" style={{ ...modalBoxStyle, width: "min(25rem, 720px)",padding: "16px",borderRadius: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Captured Image</h3>
              <button onClick={() => setShowPreviewModal(false)} style={closeBtnStyle}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            <div style={{ marginTop: 12 }}>
              <img
                src={previewUrl}
                alt="preview"
                style={{
                  width: "100%",
                  maxWidth: "280px",
                  height: "auto",
                  borderRadius: "10px",
                  display: "block",
                  margin: "0 auto",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.15)"
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              {/* <button onClick={() => { navigator.clipboard?.writeText(previewUrl); toast.success("Image URL copied"); }} style={saveBtnStyle}>Copy URL</button> */}
              <button onClick={() => setShowPreviewModal(false)} style={cancelBtnStyle}>Close</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer 
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          theme="light"
        />
    </>
  );
};

// small inline styles (keeps your CSS unaffected; these just style the modal)
const modalOverlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 };
const modalBoxStyle = { background: "#fff", padding: 20, borderRadius: 8, width: "min(900px, 95vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" };
const closeBtnStyle = { background: "transparent", border: "none", fontSize: 18, cursor: "pointer" };
const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box", marginTop: 6 };
const cameraBtnStyle = { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 6, border: "1px solid #333", background: "#fff", cursor: "pointer" };
const captureBtnStyle = { padding: "8px 12px", borderRadius: 6, border: "none", background: "#244242", color: "#fff", cursor: "pointer" };
const previewBtnStyle = { padding: "8px 12px", borderRadius: 6, border: "1px solid #666", background: "#fff", cursor: "pointer" };
const saveBtnStyle = { padding: "8px 14px", borderRadius: 6, border: "none", background: "rgb(36,36,66)", color: "#fff", cursor: "pointer" };
const cancelBtnStyle = { padding: "8px 14px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" };
const actionBtnStyle = { marginTop: "1rem", marginLeft: "4rem", height: "2rem", width: "8rem", fontWeight: "bold", fontSize: "1rem", borderRadius: "5px", backgroundColor: "rgb(36, 36, 66)", color: "white" };

export default PlainProducts;
