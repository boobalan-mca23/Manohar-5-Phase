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
    
      const response = await axios.post(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/create`,
        formData,
        {
          headers: {
              "Content-Type": "multipart/form-data",
           },
        }
      );

    

        // const uploadedImage = response.data.productImage;
        //   console.log("Uploaded image data:", uploadedImage);
    
        //   if (uploadedImage && uploadedImage[imgField.fieldName]) {
    
        //     const imageUrl = `${REACT_APP_BACKEND_SERVER_URL}/uploads/${uploadedImage[0].before_weight_img}`;
    
        //     console.log(`Image URL: ${imageUrl}`);
        //     setCapturedImages((prev) => ({
        //       ...prev,
        //       [imgField.fieldName]: imageUrl,
        //     }));
         
        //   } else {
        //     console.error("Image URL is not found for the given field.");
        //   }
      setProducts((prevProducts) => [
          ...prevProducts,
          response.data.newProduct,
        ]);
        
       closeAddItemsPopup()
       toast.success(response.data.message,{autoClose:2000})
  
    } catch (error) {
      console.error("Error creating product:", error);
      alert("There was an error create product.");
    }
  }
  
  const uploadImage = async (image, fieldName) => {
    try {
      // const weight = await handleWeight(); 
      // console.log(weight.weightdata);
      //  if(weight.weightdata!==null && weight.weightdata!==undefined){
      
    
    
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
 
      
      // uploadImage(file, currentField);
        // extractDigitalNumber(image);
    }
  };
  
  const handleSave=async()=>{
    //  if(newId===" "){
    //     alert("Don't Enter ManualData Directly And Capture image first")
    //     return;
    //  }
    // try {
    //     const updatedData = {
    //       before_weight: parseFloat(beforeWeight),
    //       after_weight: parseFloat(afterWeight),
    //       barcode_weight: barcodeWeight,
    //       product_number: productNumber||null,
    //       difference: parseFloat(difference),
    //       adjustment: parseFloat(adjustment),
    //       final_weight: parseFloat(finalWeight),
    //     };
    
    //     console.log("Data to send:", updatedData);
        
    //     const response=await axios.put(
    //       `${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/update/${newId}`,
    //       updatedData
    //     );
    //          if (response.status === 200) {
    //     setProducts((prevProducts) => [
    //       ...prevProducts,
    //       response.data.updateProduct,
    //     ]);
       
    //     closeAddItemsPopup();
    //      toast.success("Products saved successfully!");
       
       
           
    //   }
    // setNewId(0)
   
    
  
    
    //   } catch (error) {
    //     console.error("Error updating product:", error);
    //   }
  }

  return(
    showAddItemsPopup && (
        <div className="popup-2">
          <div className="popup-contentt" ref={popupRef}>
            <div className="clos">
              <div onClick={closeAddItemsPopup} className="close-button">
                <FontAwesomeIcon style={{ marginLeft: "28rem" }} icon={faXmark} />
              </div>
            </div>
            <form className="in-position">
                   <div>
                        <label>Product Number:</label>
                                <input
                               type="text"
                              value={lotnameQuery}
                               onChange={(e) => setProductNumber(e.target.value)}
                               placeholder="Enter Product Number"
                                   />
                                </div>

                             <div>
                                 <label>Before Weight:</label>
                                <div style={{ display: "flex", alignItems: "center",marginLeft: "15px"  }}>
                                      <input
                                        type="number"
                                         value={beforeWeight}
                                         onChange={(e) => setBeforeWeight(e.target.value)}
                                       placeholder="Enter Before Weight"
                                       />
                           


          <div style={{ display: "flex", alignItems: "center", marginLeft: "8px" }}>
        {capturedImages.before_weight_img && (
          <img
            src={REACT_APP_BACKEND_SERVER_URL + capturedImages.before_weight_img}
            alt="Captured"
          />
        )}

        <CameraAltIcon
          className="exclude-from-pdf"
          onClick={() => toggleWebcam("before_weight_img")}
          style={{ cursor: "pointer" }}
        />
        <Link
          className="exclude-from-pdf"
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (capturedImages.before_weight_img) {
              setBeforeWeightPreview(capturedImages.before_weight_img);
            }
          }}
          size="small"
          variant="outlined"
        >
          Preview
        </Link>
      </div>
    </div>
   
    <div>
      {beforeWeightPreview && (
        <div className="preview-container">
          <h3> Before Weight Preview Image</h3>
          <img
            src={REACT_APP_BACKEND_SERVER_URL + beforeWeightPreview}
            alt="Preview"
          />
          <br />
          <Button
            onClick={() => setBeforeWeightPreview(null)}
            size="small"
            variant="outlined"
          >
            Close Preview
          </Button>
        </div>
      )}
    </div>
         
  </div>

  {/* Save Button */}
  {/* <div className="button-container">
    <button className="save-button">Save</button>
  </div>  */}


  
              {/* <div>
                <label>After Weight:</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    style={{ width: "30rem" }}
                    type="number"
                    value={afterWeight}
                    onChange={(e) => setAfterWeight(e.target.value)}
                    placeholder="Enter After Weight"
                  />
  
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: "8px",
                    }}
                  >
                    {capturedImages.after_weight_img && (
                      <img
                        src={REACT_APP_BACKEND_SERVER_URL+capturedImages.after_weight_img}
                        alt="Captured"
                        style={{
                          maxWidth: "300px",
                          maxHeight: "300px",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                        }}
                      />
                    )}
  
                    <CameraAltIcon
                      className="exclude-from-pdf"
                      onClick={() => toggleWebcam("after_weight_img")}
                      style={{ cursor: "pointer" }}
                    />
                    <Link
                      className="exclude-from-pdf"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (capturedImages.after_weight_img) {
                          setAfterWeightPreview(capturedImages.after_weight_img);
                        }
                      }}
                      size="small"
                      variant="outlined"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
                <div>
                  {afterWeightPreview && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        textAlign: "center",
                      }}
                    >
                      <h3>After Weight Preview Image</h3>
                      <img
                        src={REACT_APP_BACKEND_SERVER_URL+afterWeightPreview}
                        alt="Preview"
                        style={{
                          maxWidth: "300px",
                          maxHeight: "300px",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                        }}
                      />
                      <br />
                      <Button
                        onClick={() => setAfterWeightPreview(null)}
                        size="small"
                        variant="outlined"
                        style={{ marginTop: "10px" }}
                      >
                        Close Preview
                      </Button>
                    </div>
                  )}
                </div>
              </div>
  
              <div>
                <label>Difference:</label>
                <input
                  style={{ width: "30rem" }}
                  type="number"
                  value={difference}
                  onChange={(e) => setDifference(e.target.value)}
                  placeholder="Enter Difference Weight"
                />
              </div>
              <div>
                <label>Adjustment:</label>
                <input
                  style={{ width: "30rem" }}
                  type="number"
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  placeholder="Enter Adjustment Weight"
                />
              </div>
              <div>
                <label>Enamel Weight:</label>
                <input
                  style={{ width: "30rem" }}
                  type="number"
                  value={finalWeight}
                  onChange={(e) => setFinalWeight(e.target.value)}
                  placeholder="Enter Enamel Weight"
                />
              </div>
              <div>
                <label>Final Weight:</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    style={{ width: "30rem" }}
                    type="number"
                    value={barcodeWeight}
                    onChange={(e) => setBarcodeWeight(e.target.value)}
                    placeholder="Enter Final Weight"
                  />
  
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: "8px",
                    }}
                  >
                    {capturedImages.final_weight_img && (
                      <img
                        src={REACT_APP_BACKEND_SERVER_URL+capturedImages.final_weight_img}
                        alt="Captured"
                        style={{
                          maxWidth: "300px",
                          maxHeight: "300px",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                        }}
                      />
                    )}
  
                    <CameraAltIcon
                      className="exclude-from-pdf"
                      onClick={() => toggleWebcam("final_weight_img")}
                      style={{ cursor: "pointer" }}
                    />
                    <Link
                      className="exclude-from-pdf"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (capturedImages.final_weight_img) {
                          setFinalWeightPreview(capturedImages.final_weight_img);
                        }
                      }}
                      size="small"
                      variant="outlined"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
                <div>
                  {finalWeightPreview && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        textAlign: "center",
                      }}
                    >
                      <h3>Final Weight Preview Image</h3>
                      <img
                        src={REACT_APP_BACKEND_SERVER_URL+finalWeightPreview}
                        alt="Preview"
                        style={{
                          maxWidth: "300px",
                          maxHeight: "300px",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                        }}
                      />
                      <br />
                      <Button
                        onClick={() => setFinalWeightPreview(null)}
                        size="small"
                        variant="outlined"
                        style={{ marginTop: "10px" }}
                      >
                        Close Preview
                      </Button>
                    </div>
                  )}
                </div>
              </div> */}
            </form>
  
            <br></br>
            {webcamVisible && (
              <div
                className="centered-webcam"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "10px 0",
                }}
              >
                <Webcam
                  ref={webcamRef}
                  style={{
                    width: "200px",
                    height: "300px",
                    // border: "2px solid #ccc",
                  }}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={1}
                />
                <Button
                  onClick={() => captureImage("image")}
                  variant="contained"
                  size="small"
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#25274D",
                    color: "white",
                  }}
                >
                  Capture
                </Button>
              </div>
            )}
  
            <div
              className="button-group"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Button
                className="exclude-from-pdf"
                onClick={createNewProduct}
                variant="contained"
                size="small"
                style={{
                  backgroundColor: "#25274D",
                  color: "white",
                  width: "20%",
                  top:"10px"
                }}
              >
                Save
              </Button>
  
            
            </div>
           
          </div>
        </div>
      )
    );
  
}

export default AddProduct

