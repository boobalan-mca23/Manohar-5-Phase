// AddProduct.js (drop-in replacement) ------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { REACT_APP_BACKEND_SERVER_URL } from "../../../config";
import { toast } from "react-toastify";

const AddProduct = ({ lotId, close, refresh }) => {
  const [items, setItems] = useState([]);
  const [goldSmiths, setGoldSmiths] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null); // {id, itemName, itemCode}
  const [selectedGoldsmith, setSelectedGoldsmith] = useState(null); // {id, name, goldSmithCode}

  const [grossWeight, setGrossWeight] = useState("");
  const [stoneWeight, setStoneWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [file, setFile] = useState(null);

  // camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Lot info (both DB id and external lotId)
  const [plainLotDbId, setPlainLotDbId] = useState(null);
  const [plainLotExternalId, setPlainLotExternalId] = useState(null);

  useEffect(() => {
    fetchLists();
    if (lotId) fetchPlainLot(lotId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lotId]);

  const fetchLists = async () => {
    try {
      const [itemsRes, gsRes] = await Promise.all([
        axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/masterItem`),
        axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/goldSmith`),
      ]);
      setItems(itemsRes.data.allMasterItem || itemsRes.data || []);
      setGoldSmiths(gsRes.data.data || gsRes.data || []);
    } catch (err) {
      console.error("Fetch lists failed:", err);
      toast.error("Failed to load items/goldsmiths");
    }
  };

  const fetchPlainLot = async (param) => {
    try {
      const res = await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/plainLot/${param}`);
      // controller returns: { success:true, lotInfo: { id, lotId, ... } }
      const lotInfo = res.data.lotInfo || res.data;
      if (lotInfo) {
        setPlainLotDbId(lotInfo.id ?? null);
        setPlainLotExternalId(lotInfo.lotId ?? null);
        console.log("PlainLot fetched:", { id: lotInfo.id, lotId: lotInfo.lotId });
      } else {
        console.warn("PlainLot response shape unexpected:", res.data);
      }
    } catch (err) {
      console.error("Failed to fetch plainLot:", err);
      toast.error("Failed to fetch lot info");
    }
  };

  // camera helpers
  const openCamera = async () => {
    try {
      setCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error", err);
      toast.error("Camera not available");
    }
  };
  const takePicture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, size, size);
    canvas.toBlob((blob) => {
      const fileImg = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setFile(fileImg);
      // stop tracks
      const tracks = video.srcObject?.getTracks() || [];
      tracks.forEach((t) => t.stop());
      setCameraOpen(false);
    }, "image/jpeg", 0.9);
  };

  useEffect(() => {
    if (grossWeight !== "" && stoneWeight !== "") {
      const g = parseFloat(grossWeight) || 0;
      const s = parseFloat(stoneWeight) || 0;
      setNetWeight((g - s).toFixed(3));
    }
  }, [grossWeight, stoneWeight]);

  // MAIN submit: try DB id first, on Lot Id not found -> retry with external lotId
  const handleSubmit = async () => {
    // validations
    if (!selectedItem || !selectedGoldsmith) {
      toast.error("Select item & goldsmith");
      return;
    }
    if ((grossWeight === "") || (stoneWeight === "")) {
      toast.error("Enter gross and stone weight");
      return;
    }
    if (!plainLotDbId && !plainLotExternalId) {
      toast.error("Lot info missing");
      return;
    }

    // helper to build FormData with a chosen plainLotId value
    const buildFormData = (plainLotIdValue) => {
      const fd = new FormData();
      fd.append("plainLotId", String(plainLotIdValue)); // <-- this is the field backend expects
      fd.append("productName", selectedItem.itemName || "");
      fd.append("workerName", selectedGoldsmith.name || "");
      fd.append("grossWeight", String(grossWeight));
      fd.append("stoneWeight", String(stoneWeight));
      fd.append("netWeight", String(netWeight || (parseFloat(grossWeight||0) - parseFloat(stoneWeight||0)).toFixed(3)));
      // codes for product id generation
      fd.append("goldSmithCode", selectedGoldsmith.goldSmithCode || "");
      fd.append("itemCode", selectedItem.itemCode || "");
      if (file) fd.append("file", file);
      return fd;
    };

    // Debug logger
    const logFormData = (fd) => {
      console.log("---- FormData entries ----");
      for (let pair of fd.entries()) {
        if (pair[0] === "file" && pair[1] instanceof File) {
          console.log(pair[0], pair[1].name, pair[1].type, pair[1].size);
        } else {
          console.log(pair[0], pair[1]);
        }
      }
      console.log("--------------------------");
    };

    // Try with DB id first (plainLotDbId)
    const tryOrder = [];
    if (plainLotDbId) tryOrder.push({ label: "DB id", value: plainLotDbId });
    if (plainLotExternalId && String(plainLotExternalId) !== String(plainLotDbId)) tryOrder.push({ label: "external lotId", value: plainLotExternalId });

    let lastErr = null;
    for (let attempt of tryOrder) {
      try {
        const fd = buildFormData(attempt.value);
        console.log("Attempting createPlainProducts with", attempt.label, "=", attempt.value);
        logFormData(fd);

        const res = await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/plainProducts`, fd, { timeout: 30000 });
        console.log("Create success:", res.data);
        toast.success("Product created");
        refresh?.();
        close?.();
        return;
      } catch (err) {
        lastErr = err;
        console.error(`Create attempt failed (tried ${attempt.label}=${attempt.value}):`, err);
        // If server responded with JSON message "Lot Id is Not Found", continue to next attempt.
        const backendMsg = err?.response?.data?.message || err?.response?.data?.err;
        if (backendMsg && typeof backendMsg === "string" && backendMsg.toLowerCase().includes("lot id is not found")) {
          // try next attempt
          console.warn("Server said Lot Id is Not Found; trying next candidate (if any)...");
          continue;
        } else {
          // non-recoverable error — show and stop trying
          const userMsg = err?.response?.data?.message || "Server error creating product";
          toast.error(userMsg);
          return;
        }
      }
    }

    // If we reach here, all attempts failed
    console.error("All create attempts failed:", lastErr);
    toast.error("Failed to create product. Check console/network for details.");
  };

  return (
    <div className="popup-container">
      <div className="popup">
        <h3>Add Product</h3>

        <label>Product (MasterItems)</label>
        <select
          value={selectedItem ? selectedItem.id : ""}
          onChange={(e) => {
            const obj = items.find((it) => String(it.id) === String(e.target.value));
            setSelectedItem(obj || null);
          }}
        >
          <option value="">-- Select item --</option>
          {items.map((it) => (
            <option key={it.id} value={it.id}>
              {it.itemName} ({it.itemCode})
            </option>
          ))}
        </select>
        {selectedItem && <div><small>Selected:</small> {selectedItem.itemName} — {selectedItem.itemCode}</div>}

        <label>Worker (Goldsmith)</label>
        <select
          value={selectedGoldsmith ? selectedGoldsmith.id : ""}
          onChange={(e) => {
            const obj = goldSmiths.find((g) => String(g.id) === String(e.target.value));
            setSelectedGoldsmith(obj || null);
          }}
        >
          <option value="">-- Select worker --</option>
          {goldSmiths.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.goldSmithCode})
            </option>
          ))}
        </select>
        {selectedGoldsmith && <div><small>Selected:</small> {selectedGoldsmith.name} — {selectedGoldsmith.goldSmithCode}</div>}

        <label>Gross Weight</label>
        <input value={grossWeight} onChange={(e) => setGrossWeight(e.target.value)} />

        <label>Stone Weight</label>
        <input value={stoneWeight} onChange={(e) => setStoneWeight(e.target.value)} />

        <label>Net Weight</label>
        <input value={netWeight} readOnly />

        <div style={{ marginTop: 8 }}>
          <button onClick={openCamera}>Open Camera</button>
          {cameraOpen && (
            <div>
              <video ref={videoRef} autoPlay style={{ width: 240, height: 240 }} />
              <div>
                <button onClick={takePicture}>Capture</button>
                <button onClick={() => {
                  const tracks = videoRef.current?.srcObject?.getTracks() || [];
                  tracks.forEach((t) => t.stop());
                  setCameraOpen(false);
                }}>Close</button>
              </div>
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          )}
        </div>

        <label>Or upload image</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />

        <div style={{ marginTop: 12 }}>
          <button onClick={handleSubmit}>Save</button>
          <button onClick={() => { close?.(); }}>Cancel</button>
        </div>

        <div style={{ marginTop: 8 }}>
          <small>Debug: plainLotDbId = {String(plainLotDbId)}, plainLotExternalId = {String(plainLotExternalId)}</small>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
