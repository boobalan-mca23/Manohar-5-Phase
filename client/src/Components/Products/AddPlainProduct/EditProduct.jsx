import React, { useState, useEffect } from "react";
import axios from "axios";
import { REACT_APP_BACKEND_SERVER_URL } from "../../../config";
import { toast } from "react-toastify";

const EditProduct = ({ product, close, refresh }) => {
  const [productName, setProductName] = useState(product.productName);
  const [workerName, setWorkerName] = useState(product.workerName);
  const [grossWeight, setGrossWeight] = useState(product.grossWeight);
  const [stoneWeight, setStoneWeight] = useState(product.stoneWeight);
  const [netWeight, setNetWeight] = useState(product.netWeight);
  const [file, setFile] = useState(null);

  useEffect(() => {
    setNetWeight(
      (parseFloat(grossWeight || 0) - parseFloat(stoneWeight || 0)).toFixed(3)
    );
  }, [grossWeight, stoneWeight]);

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("workerName", workerName);
    formData.append("grossWeight", grossWeight);
    formData.append("stoneWeight", stoneWeight);
    formData.append("netWeight", netWeight);
    if (file) formData.append("file", file);

    try {
      await axios.put(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/plainProducts/${product.id}`,
        formData
      );
      toast.success("Product Updated");
      refresh();
      close();
    } catch (err) {
      toast.error("Failed to Update");
    }
  };

  return (
    <div className="popup-container">
      <div className="popup">
        <h3>Edit Product</h3>

        <label>Product Name</label>
        <input value={productName} onChange={(e) => setProductName(e.target.value)} />

        <label>Worker Name</label>
        <input value={workerName} onChange={(e) => setWorkerName(e.target.value)} />

        <label>Gross Weight</label>
        <input value={grossWeight} onChange={(e) => setGrossWeight(e.target.value)} />

        <label>Stone Weight</label>
        <input value={stoneWeight} onChange={(e) => setStoneWeight(e.target.value)} />

        <label>Net Weight</label>
        <input value={netWeight} readOnly />

        <label>Replace Image</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <div className="actions">
          <button onClick={handleUpdate}>Update</button>
          <button onClick={close}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
