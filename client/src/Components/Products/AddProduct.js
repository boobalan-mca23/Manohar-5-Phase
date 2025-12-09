import React, { useState, useRef, useEffect} from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { Link } from "@mui/material";
import "../Products/AddProduct.css";
import jsPDF from "jspdf";
import Barcode from "react-qr-code";
import html2canvas from "html2canvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { transform_text } from "../utils";
import Button from "@mui/material/Button";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import imagess from "../../Components/Logo/Mogo.png";
import Webcam from "react-webcam";
import manoImage from "../../Components/Logo/mano.jpg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config";
import ReactDOMServer from "react-dom/server";
import { handleWeight } from "../utils";
import Products from "./Products";

const AddProduct=({
    showAddItemsPopup,
    closeAddItemsPopup,
    products,
    setProducts
})=>{
  const [beforeWeight, setBeforeWeight] = useState("");
  const [afterWeight, setAfterWeight] = useState("");
  const [barcodeWeight, setBarcodeWeight] = useState("");
  const [difference, setDifference] = useState(" ");
  const [adjustment, setAdjustment] = useState(" ");
  
  const [showBarcode, setShowBarcode] = useState(false);
  const [selectedProductNo, setSelectedProductNo] = useState();
  const [beforeWeightPreview, setBeforeWeightPreview] = useState(null);
  const [afterWeightPreview, setAfterWeightPreview] = useState(null);
  const [finalWeightPreview, setFinalWeightPreview] = useState(null);
  const [productNumber, setProductNumber] = useState(null);
  const [finalWeight, setFinalWeight] = useState("");
  const [webcamVisible, setWebcamVisible] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const webcamRef = useRef(null);
  const popupRef = useRef(null);
  const barcodeRef = useRef(null);

  const location = useLocation();
  const { lot_id } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const lotnameQuery = searchParams.get("lotname");
  const [lotNumber, setLotNumber] = useState(lotnameQuery || lot_id || "");
  const [capturedImages, setCapturedImages] = useState({
    before_weight_img: null,
    after_weight_img: null,
    final_weight_img: null,

  });
  const [imgField,setImgField]=useState(
    {
      image:"",
      fieldName:""
    }
  )
  const [saving, setSaving] = useState(false);

const handleWeightData=async()=>{
      try{
        const weight = await handleWeight(); 
        console.log(weight.weightdata);

        if(weight.weightdata!==null && weight.weightdata!==undefined){
            setBeforeWeight(weight.weightdata);
       }

      }catch(err){
         console.log(err.message)
        
      }
  }

  const toggleWebcam = (field) => {
    setWebcamVisible((prev) => !prev);
    setCurrentField(field);
    

  };
  const base64ToFile = (base64Data, filename, mimeType) => {
    const byteCharacters = atob(base64Data.split(",")[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset++) {
      const byte = byteCharacters.charCodeAt(offset);
      byteArrays.push(byte);
    }

    const byteArray = new Uint8Array(byteArrays);
    return new File([byteArray], filename, { type: mimeType });
  };
  
   
   
  const createNewProduct=async()=>{
    try {
      setSaving(true)
      const formData=new FormData()
      formData.append("tag_number",lotNumber)
      formData.append("before_weight",beforeWeight||null)
      formData.append("after_weight",afterWeight||null)
      formData.append("barcode_weight",null)
      formData.append("final_weight",finalWeight||null)
      formData.append("product_number",productNumber||null)
      formData.append("lot_id",Number(lot_id))
      formData.append("image",imgField.image);
      formData.append("fieldName",imgField.fieldName);
      formData.append("itemType", "STONE");

      const response = await axios.post(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/create`,
        formData,
        {
          headers: {
              "Content-Type": "multipart/form-data",
           },
        }
      );

  
      setProducts((prevProducts) => [
          ...prevProducts,
          response.data.newProduct,
        ]);
       setSaving(false)
       closeAddItemsPopup()
       toast.success(response.data.message,{autoClose:2000})
        
    } catch (error) {
      console.error("Error creating product:", error);
      alert("There was an error create product.");
      setSaving(false)
    }
  }
  
  const uploadImage = async (image, fieldName) => {
    try {

    
    
        try {
          const formData = new FormData();
          formData.append("image", image);
          formData.append("fieldName", fieldName);
          // formData.append("productId", id);
          console.log("FormData contains image:", formData.get("image"));
    
          const response = await axios.post(
            `${REACT_APP_BACKEND_SERVER_URL}/api/images/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
         console.log("Backend response:", response.data);
           
         const uploadedImage = response.data.productImage;
          console.log("Uploaded image data:", uploadedImage);
    
          if (uploadedImage && uploadedImage[fieldName]) {
    
            const imageUrl = `${REACT_APP_BACKEND_SERVER_URL}/uploads/${uploadedImage[fieldName]}`;
    
            console.log(`Image URL: ${imageUrl}`);
            setCapturedImages((prev) => ({
              ...prev,
              [fieldName]: imageUrl,
            }));
         
          } else {
            console.error("Image URL is not found for the given field.");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
          closeAddItemsPopup()
      // }
     } catch (err) {
      console.error("Error fetching weight:", err);
    }
    
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const video = webcamRef.current.video;
      const canvas = document.createElement("canvas");
  
      canvas.width = video.videoWidth; 
      canvas.height = video.videoHeight;
  
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      const image = canvas.toDataURL("image/jpeg", 1.0); 
      const file = base64ToFile(image, "captured-image.jpg", "image/jpeg");
      handleWeightData()    
      setImgField({image:image,fieldName:file})
 
    }
  };
  
  const handleSave=async()=>{
  }

return (
  showAddItemsPopup && (
    <div className="add-product-popup-overlay">

      <div className="add-product-popup" ref={popupRef}>
        
        {/* Close Button */}
        <button className="close-btn" onClick={closeAddItemsPopup}>
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2>Add New Product</h2>

        <form>

          {/* Product Number */}
          <div className="input-group">
            <label>Product Number:</label>
            <input
              type="text"
              value={lotnameQuery}
              onChange={(e) => setProductNumber(e.target.value)}
              placeholder="Enter Product Number"
            />
          </div>

          {/* Before Weight */}
          <div className="input-group">
            <label>Before Weight:</label>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

              <input
                onWheel={(e)=>{e.target.blur()}}
                type="number"
                value={beforeWeight}
                onChange={(e) => setBeforeWeight(e.target.value)}
                placeholder="Enter Before Weight"
              />

              <CameraAltIcon
                className="exclude-from-pdf"
                onClick={() => toggleWebcam("before_weight_img")}
                style={{ cursor: "pointer" }}
              />

              {capturedImages.before_weight_img && (
                <Link
                    className="exclude-from-pdf"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setBeforeWeightPreview(capturedImages.before_weight_img.replace(REACT_APP_BACKEND_SERVER_URL, ""))
                    }
                  >
                    Preview
                  </Link>
              )}

            </div>
          </div>

          {/* Preview Box */}
          {beforeWeightPreview && (
            <div className="img-preview-overlay" onClick={() => setBeforeWeightPreview(null)}>
              <div className="img-preview-box" onClick={(e) => e.stopPropagation()}>
                
                {/* Header with title and close button */}
                <div className="img-preview-header">
                  <h3 className="img-preview-title">Before Weight Image</h3>
                  <button
                    className="img-preview-close"
                    onClick={() => setBeforeWeightPreview(null)}
                    aria-label="Close preview"
                  >
                    ✕
                  </button>
                </div>

                {/* Image content */}
                <div className="img-preview-content">
                  <img
                    src={beforeWeightPreview}
                    alt="Before Weight Preview"
                    loading="lazy"
                  />
                </div>

              </div>
            </div>
          )}



        </form>

        {/* Webcam */}
        {webcamVisible && (
          <div className="centered-webcam">
            <Webcam
              ref={webcamRef}
              style={{ width: "200px", height: "300px" }}
              screenshotFormat="image/jpeg"
            />

            <Button
              onClick={captureImage}
              variant="contained"
              size="small"
              style={{ backgroundColor: "#25274D", color: "white" }}
            >
              Capture
            </Button>
          </div>
        )}

        {/* Save Button */}
        <div className="btn-row" style={{ marginTop: "20px" }}>
          <button className="save-btn" onClick={createNewProduct}
           disabled={saving}>
            {saving?"Product Saving..":"Save"}
          </button>
          <button className="cancel-btn" onClick={closeAddItemsPopup}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
);

}

export default AddProduct

