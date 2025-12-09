import React, { useState, useRef, useEffect} from "react";
import axios from "axios";
import { Link } from "@mui/material";
import "../Products/View.css";
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
let isGeneratingPdf = false;

const WeightFormPopup = ({
  showPopup,
  closePopup,
  productId,
  product,
  productInfo,
  updateProductList,
}) => {
  console.log(product, "1111111111111111");
  console.log(productInfo, "detailssssssss");
  const [capturedImages, setCapturedImages] = useState({
    before_weight_img: null,
    after_weight_img: null,
    final_weight_img: null,

  });
  console.log("kkkkkkkkkk",capturedImages)
  
  
  const [beforeWeight, setBeforeWeight] = useState(productInfo.before_weight);
  const [afterWeight, setAfterWeight] = useState(productInfo.after_weight);
  const [barcodeWeight, setBarcodeWeight] = useState(
    productInfo.barcode_weight
  );
  const [previewImage, setPreviewImage] = useState(null);
  const [difference, setDifference] = useState(productInfo.difference);
  const [adjustment, setAdjustment] = useState(productInfo.adjustment);
  const [products, setProducts] = useState([]);
  const [showBarcode, setShowBarcode] = useState(false);
  const [selectedProductNo, setSelectedProductNo] = useState();
  // const [beforeWeightPreview, setBeforeWeightPreview] = useState(null);
  // const [afterWeightPreview, setAfterWeightPreview] = useState(null);
  // const [finalWeightPreview, setFinalWeightPreview] = useState(null);
  const [product_number, setProductNumber] = useState(
    transform_text(productInfo.product_number ? productInfo.product_number : "")
  );
  const [finalWeight, setFinalWeight] = useState(
    productInfo.final_weight || ""
  );

  const [webcamVisible, setWebcamVisible] = useState(false);
  const [currentField, setCurrentField] = useState(null);
 
  const webcamRef = useRef(null);
  const popupRef = useRef(null);
   const [updateImg,setUpdateImg]=useState([
   {
     before_weight_img:"",
     after_weight_img:"",
     final_weight_img:""
   }
  ])
  const [saving, setSaving] = useState(false);
  const barcodeRef = useRef(null);
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

  const handleExportPdf = async () => {
    if (barcodeRef.current) {
      try {
        const canvas = await html2canvas(barcodeRef.current, {
          backgroundColor: null,
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: [55, 12],
        });
        pdf.addImage(imgData, "PNG", 9, 3, 40, 7);
        const pdfBlob = pdf.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);

        window.open(pdfUrl, "_blank");
      } catch (error) {
        console.error("Error exporting barcode as PDF:", error);
      }
    }
  };

const handleBulkExportPdf = async (items) => {

  console.log("ietetteee", items);
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
    //  qrCodeContainer.style.marginLeft = "1rem";
     qrCodeContainer.style.fontWeight = "bold";
     qrCodeContainer.style.fontSize = "9px";
     qrCodeContainer.style.marginBottom = "2px";
     qrCodeContainer.style.width = "2px";

     const barcodeContainer = document.createElement("div");
     qrCodeContainer.appendChild(barcodeContainer);

     const barcodeSvg = (
       <Barcode value={items.product_number} size={30} format="svg" />
     );
     const svgContainer = ReactDOMServer.renderToStaticMarkup(barcodeSvg);
     barcodeContainer.innerHTML = svgContainer;

     const detailsContainer = document.createElement("div");
     detailsContainer.style.display = "flex";
     detailsContainer.style.flexDirection = "column";

     const barcodeWeightText = document.createElement("span");
     barcodeWeightText.textContent = ` ${items.barcode_weight}`;
     barcodeWeightText.style.fontSize = "9px";
     barcodeWeightText.style.fontWeight = "bold";
     barcodeWeightText.style.marginLeft = "7px";
     detailsContainer.appendChild(barcodeWeightText);

     const productNumberText = document.createElement("span");
     productNumberText.textContent = ` ${transform_text(items.product_number)}`;
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
     logoImg.style.marginBottom = "4px";
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

    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  } catch (error) {
    console.error("Error exporting barcodes as PDF:", error);
  } finally {
    isGeneratingPdf = false;
  }
  
};


const handleExportdetailsPdf = async () => {
  console.log('captured images',capturedImages)
  if (popupRef.current) {
    try {
      const logoWidth = 20;
      const logoHeight = 20;
      console.log("Capturing content...");
      const elementsToHide = document.querySelectorAll(".exclude-from-pdf");
      elementsToHide.forEach((el) => (el.style.display = "none"));

      const productDetails = [
        ["Product Number", product_number],
        ["Before Weight", beforeWeight],
        ["After Weight", afterWeight],
        ["Difference", difference],
        ["Adjustment", adjustment],
        ["Enamel Weight", finalWeight],
        ["Final Weight", barcodeWeight],
      ];

      const pdf = new jsPDF("p", "mm", "a4");
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      let currentY = margin;

      pdf.setFontSize(16);
      pdf.text("Product Details", pageWidth / 2, currentY, { align: "center" });
      currentY += 10;

      const logoX = pageWidth - margin - logoWidth;
      pdf.addImage(
        manoImage,
        "JPEG",
        logoX,
        margin - 10,
        logoWidth,
        logoHeight
      );

      elementsToHide.forEach((el) => (el.style.display = ""));

      pdf.autoTable({
        startY: currentY,
        margin: { left: margin, right: margin },
        body: productDetails.map(([key, value]) => [key, value]),
        theme: "grid",
        head: [["Field", "Value"]],
        styles: {
          fontSize: 10,
          cellPadding: 1,
        },
        headStyles: {
          fillColor: "#25274D",
          textColor: "#ffffff",
        },
      });

      currentY = pdf.autoTable.previous.finalY + 10;

      const imageWidth = 60;
      const imageHeight = 100;

      const totalHeightRequired = currentY + imageHeight;
      if (totalHeightRequired > pageHeight) {
        console.log(
          "Not enough space on the current page, reducing image size..."
        );
        imageWidth = 50; 
        imageHeight = 85; 
      }


      const imageStartX = (pageWidth - 2 * imageWidth) / 2; 

      pdf.text("Before Weight Image", imageStartX, currentY);
      pdf.addImage(
        capturedImages.before_weight_img,
        "JPEG",
        imageStartX,
        currentY + 5,
        imageWidth,
        imageHeight
      );

      pdf.text("After Weight Image", imageStartX + imageWidth, currentY);
      pdf.addImage(
        capturedImages.after_weight_img,
        "JPEG",
        imageStartX + imageWidth,
        currentY + 5,
        imageWidth,
        imageHeight
      );

      currentY += imageHeight + 10;

      pdf.text("Final Weight Image", pageWidth / 2, currentY, {
        align: "center",
      });
      pdf.addImage(
        capturedImages.final_weight_img,
        "JPEG",
        (pageWidth - imageWidth) / 2,
        currentY + 5,
        imageWidth,
        imageHeight
      );

      console.log("Saving PDF...");
      pdf.save("product_details.pdf");

      elementsToHide.forEach((el) => (el.style.display = ""));
    } catch (error) {
      console.error("Error exporting popup as PDF:", error);
    }
  }
};

  const handleGenerateBarcode = (productNo) => {
    if (!productNo) {
      console.error("Product number is undefined or invalid!");
      return;
    }
    setSelectedProductNo(productNo);
    setShowBarcode(true);
  };


const handleSave = async () => {
  try {
     setSaving(true)
     const formData=new FormData()
     formData.append('before_weight',parseFloat(beforeWeight))
     formData.append('after_weight',parseFloat(afterWeight))
     formData.append('barcode_weight',parseFloat(barcodeWeight))
     formData.append('difference', parseFloat(difference))
     formData.append('adjustment', parseFloat(adjustment))
     formData.append('final_weight',parseFloat(finalWeight))
    if (updateImg[0].before_weight_img) {
      console.log('b')
     formData.append("before_weight_img", updateImg[0].before_weight_img);
     }
    if (updateImg[0].after_weight_img) {
     formData.append("after_weight_img", updateImg[0].after_weight_img);
      console.log('a')
    }
    if (updateImg[0].final_weight_img) {
       console.log('f')
     formData.append("final_weight_img", updateImg[0].final_weight_img);
    }
     formData.append('itemType',"STONE")
    // const formData=new formData()
    // formData.appendC
 
    const updatedData= await axios.put(
      `${REACT_APP_BACKEND_SERVER_URL}/api/v1/products/update/${productId}`,
      formData,
       {
          headers: {
              "Content-Type": "multipart/form-data",
           },
        }
    );
 
    console.log("Updated Product Data:", updatedData);
 
    
    setSaving(false)
    toast.success("Product saved successfully!");
    window.location.reload();
    
    // const updatedProduct = {
    //   ...product,
    //   ...updatedData,
    // };
    // updateProductList(updatedProduct);
 
 
  } catch (error) {
    setSaving(false)
    console.error("Error updating product:", error);
  }
};


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

  useEffect(() => {
    console.log("Product Object: ", product);
    if (product && product.product_number) {
      console.log("Product Number: ", product.product_number);
    }
  }, [product]);

 

 

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_BACKEND_SERVER_URL}/api/images?productId=${productId}`
        );

        const { before_weight_img, after_weight_img, final_weight_img } =
          response.data || {};
        console.log("API Response:", response.data);
        setCapturedImages({
          before_weight_img: before_weight_img || null,
          after_weight_img: after_weight_img || null,
          final_weight_img: final_weight_img || null,
        });
        console.log("beforeeeeeeeeeeee",before_weight_img)
      
      } catch (error) {
        console.error("Error fetching images:", error);
        
      }
    };

    fetchImages();
  }, [productId]);

  const uploadImage = async (image, fieldName) => {
    
      setUpdateImg(prev => [{
          ...prev[0],
          [fieldName]: image
        }
      ]);
          try {
            const weight = await handleWeight();  // Await the function call and Weight Api
            console.log(weight);
  
            switch (fieldName) {
                case "before_weight_img":
                    setBeforeWeight(weight);
                    break;
                case "after_weight_img":
                    setAfterWeight(weight);
                    break;
                case "final_weight_img":
                    setBarcodeWeight(weight);
                    break;
                default:
                    console.warn("Invalid field:", fieldName);
            }
        }
        catch (err) {
            console.error("Error fetching weight:", err);
             toast.warn('Weight Mechine Not Connected')
        }
      
    
    };

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

    uploadImage(file, currentField);
      // extractDigitalNumber(image);
  }
};


 
  return (
    showPopup && (
      <div className="vw-overlay">
        <div className="vw-modal" ref={popupRef}>
          <div className="vw-close-wrap">
            <div onClick={closePopup} className="vw-close-btn">
              <FontAwesomeIcon className="vw-close-icon" icon={faXmark} />
            </div>
          </div>
          <form className="vw-fields">
            <div>
              <label>Product Number:</label>
              <input
                className="vw-input"
                type="text"
                value={transform_text(product.product_number)}
                onChange={(e) => setProductNumber(e.target.value)}
                placeholder="Enter Product Number"
              />
            </div>

            <div>
              <label>Before Weight:</label>
              <div className="vw-input-row">
                <input
                  onWheel={(e)=>{e.target.blur()}}
                  className="vw-input"
                  type="number"
                  value={beforeWeight}
                  onChange={(e) => setBeforeWeight(e.target.value)}
                  // id="digitalNumber"
                  // value={digitalNumber}
                  // onChange={(e) => setDigitalNumber(e.target.value)}
                  placeholder="Enter Before Weight"
                />

                <div
                  className="vw-tools"
                >
                  {capturedImages.before_weight_img && (
                    <img
                      src={REACT_APP_BACKEND_SERVER_URL+capturedImages.before_weight_img}
                      alt="Captured"
                      className="vw-thumb"
                    />
                  )}

                  <CameraAltIcon
                    className="exclude-from-pdf"
                    onClick={() => toggleWebcam("before_weight_img")}
                    // style={{ cursor: "pointer" }}
                  />
                  <Link
                    className="exclude-from-pdf"
                    // style={{ cursor: "pointer" }}
                    onClick={() => {
                      if (capturedImages.before_weight_img) {
                         setPreviewImage(REACT_APP_BACKEND_SERVER_URL + capturedImages.before_weight_img);
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
                {/* {beforeWeightPreview && (
                  <div
                    className="vw-preview-box"
                  >
                    <h3> Before Weight Preview Image</h3>
                    <img
                      src={REACT_APP_BACKEND_SERVER_URL+beforeWeightPreview}
                      alt="Preview"
                       className="vw-preview-img"
                    />
                    <br />
                    <Button
                      onClick={() => setBeforeWeightPreview(null)}
                      size="small"
                      variant="outlined"
                      className="vw-preview-close"
                    >
                      Close Preview
                    </Button>
                  </div>
                )} */}
              </div>
            </div>

            <div>
              <label>After Weight:</label>
              <div className="vw-input-row">
                <input
                  onWheel={(e)=>{e.target.blur()}}
                  className="vw-input"
                  type="number"
                  value={afterWeight}
                  onChange={(e) => setAfterWeight(e.target.value)}
                  placeholder="Enter After Weight"
                />

                <div
                  className="vw-tools"
                >
                  {capturedImages.after_weight_img && (
                    <img
                      src={REACT_APP_BACKEND_SERVER_URL+capturedImages.after_weight_img}
                      alt="Captured"
                      className="vw-thumb"
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
                         setPreviewImage(REACT_APP_BACKEND_SERVER_URL + capturedImages.after_weight_img);
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
                {/* {afterWeightPreview && (
                  <div
                    className="vw-preview-box"
                  >
                    <h3>After Weight Preview Image</h3>
                    <img
                      src={REACT_APP_BACKEND_SERVER_URL+afterWeightPreview}
                      alt="Preview"
                      className="vw-thumb"
                    />
                    <br />
                    <Button
                      onClick={() => setAfterWeightPreview(null)}
                      size="small"
                      variant="outlined"
                      className="vw-preview-close"
                    >
                      Close Preview
                    </Button>
                  </div>
                )} */}
              </div>
            </div>

            <div>
              <label>Difference:</label>
              <input
                onWheel={(e)=>{e.target.blur()}}
                className="vw-input"
                type="number"
                value={difference}
                onChange={(e) => setDifference(e.target.value)}
                placeholder="Enter Difference Weight"
              />
            </div>
            <div>
              <label>Adjustment:</label>
              <input
                onWheel={(e)=>{e.target.blur()}}
                className="vw-input"
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                placeholder="Enter Adjustment Weight"
              />
            </div>
            <div>
              <label>Enamel Weight:</label>
              <input
                onWheel={(e)=>{e.target.blur()}}
                className="vw-input"
                type="number"
                value={finalWeight}
                onChange={(e) => setFinalWeight(e.target.value)}
                placeholder="Enter Enamel Weight"
              />
            </div>
          
            <div>
              <label>Final Weight:</label>
              <div  className="vw-input-row">
                <input
                  onWheel={(e)=>{e.target.blur()}}
                  className="vw-input"
                  type="number"
                  value={barcodeWeight}
                  onChange={(e) =>setBarcodeWeight(e.target.value)}
                  placeholder="Enter Final Weight"
                />

                <div
                  className="vw-tools"
                >
                  {capturedImages.final_weight_img && (
                    <img
                      src={REACT_APP_BACKEND_SERVER_URL+capturedImages.final_weight_img}
                      alt="Captured"
                      className="vw-thumb"
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
                         setPreviewImage(REACT_APP_BACKEND_SERVER_URL + capturedImages.final_weight_img);
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
                {/* {finalWeightPreview && (
                  <div
                    className="vw-preview-box"
                  >
                    <h3>Final Weight Preview Image</h3>
                    <img
                      src={REACT_APP_BACKEND_SERVER_URL+finalWeightPreview}
                      alt="Preview"
                     className="vw-thumb"
                    />
                    <br />
                    <Button
                      onClick={() => setFinalWeightPreview(null)}
                      size="small"
                      variant="outlined"
                      className="vw-preview-close"
                    >
                      Close Preview
                    </Button>
                  </div>
                )} */}
              </div>
            </div>
          </form>

          <br></br>
          {webcamVisible && (
            <div className="vw-cam-overlay" onClick={() => setWebcamVisible(false)}>
              <div className="vw-cam-box" onClick={(e) => e.stopPropagation()}>

                <button
                  className="vw-cam-close-btn"
                  onClick={() => setWebcamVisible(false)}
                >
                  ×
                </button>

                <Webcam
                  ref={webcamRef}
                  className="vw-cam-video"
                  screenshotFormat="image/jpeg"
                  screenshotQuality={1}
                />

                <button
                  className="vw-cam-btn"
                  onClick={() => {
                    captureImage();
                    setWebcamVisible(false);
                  }}
                >
                  Capture
                </button>
              </div>
            </div>
          )}


          <div
            className="vw-buttons"
          >
            <Button
              // className="exclude-from-pdf"
              onClick={handleSave}
              disabled={saving}
              variant="contained"
              size="small"
              className="vw-btn-primary"
            >
              {saving?"Product Updating...":"Update"}
            </Button>

            <div className="vw-btn-group">
            
              <Button
                onClick={() => handleBulkExportPdf(product)}
               

                className="vw-btn-primary"
              >
                Print Label
              </Button>
              <Button
                // className="exclude-from-pdf"
                onClick={handleExportdetailsPdf}
                variant="contained"
                size="small"
                className="vw-btn-primary"
              >
                Export Details as PDF
              </Button>
            </div>
          </div>
          {showBarcode && selectedProductNo && (
            <div
              ref={barcodeRef}
              className="vw-barcode-box"
            >
              <div
                 className="vw-barcode-svg-wrap"
              >
                <Barcode value={selectedProductNo || ""} size={90} />
              </div>
              <div className="vw-barcode-details">
                <div
                  className="vw-barcode-text"
                >
                  <div>{product.barcode_weight}</div>
                  <div>{transform_text(product.product_number)}</div>
                </div>
                <div>
                  {" "}
                  <img
                    src={imagess}
                    alt="jewelery"
                    className="vw-barcode-logo"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        {previewImage && (
          <div className="vw-preview-overlay" onClick={() => setPreviewImage(null)}>
            <div className="vw-preview-modal" onClick={(e) => e.stopPropagation()}>
              <button className="vw-preview-close" onClick={() => setPreviewImage(null)}>×</button>
              <img src={previewImage} alt="Preview" className="vw-preview-full-img" />
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default WeightFormPopup;
