import { useState, useEffect, useCallback} from "react";
import RemovedLotTable from "./RemovedLotTable";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config";
import axios from "axios";
import "./RemovedLots.css";
import { Snackbar, Alert } from "@mui/material";


const RemoveLot = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPage, setTotalPage] = useState(1);
  const [removedLots, setRemovedLots] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");  // actual debounced value
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [selectedProduct,setSelectedProduct]=useState({
      count:0,
      selectedItems:[]
  })

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  useEffect(() => {
  const delay = setTimeout(() => {
    setSearch(searchInput);  // update real search only after 300ms
  }, 300);

  return () => clearTimeout(delay);
}, [searchInput]);

  const fetchRemovedLots = useCallback(async () => {
    try {
      
      const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/restoreLot/getDiactivateLots`,
        { params: { page, limit ,search} }
      );

      setRemovedLots(response.data.deletedLots);
      setTotalPage(response.data.totalPage ? response.data.totalPage:1  );
     
      setTimeout(() => setLoading(false), 1000);
      

    } catch (err) {
      console.log("err", err.message);
      setSnackbar({
        open: true,
        message: "Failed to Fetch Removed Lots",
        severity: "error",
      });
       setLoading(false);
    }
  }, [page, limit,search]);


  const handleRestore = async () => {
    try {
      const payload={
         selectedProduct:selectedProduct.selectedItems
      }
      const resposne = await axios.put(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/restoreLot/changetoActivate`,
      payload
           
      );
      if (resposne.data.success === true) {
        setSnackbar({
          open: true,
          message: resposne.data.message,
          severity: "success",
        });
      const updatedRemovedLots = removedLots.filter(
         (item) => !selectedProduct.selectedItems.includes(item.id)
        );
        
        setRemovedLots(updatedRemovedLots);
         
        // also clear selected items
      
         setSelectedProduct({
        count: 0,
        selectedItems: []
       });
      }
    } catch (err) {
      console.log("err", err.message);
      setSnackbar({
        open: true,
        message: "Error on Restore Lot",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const payload={
         selectedProduct:selectedProduct.selectedItems
      }

      const resposne = await axios.put(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/lot/lotDelete`,
        payload
      );

      if (resposne.data.success === true) {
        setSnackbar({
          open: true,
          message: resposne.data.message,
          severity: "success",
        });
       const updatedRemovedLots = removedLots.filter(
         (item) => !selectedProduct.selectedItems.includes(item.id)
        );
        setRemovedLots(updatedRemovedLots);
         
        // also clear selected items
      
         setSelectedProduct({
        count: 0,
        selectedItems: []
       });

        
      }
    } catch (err) {
      console.log("err", err.message);
      setSnackbar({
        open: true,
        message: "Error on Delete Lot",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchRemovedLots();
  }, [fetchRemovedLots]);

  return (
    <>
      <RemovedLotTable
        removedLots={removedLots}
        handleDelete={handleDelete}
        handleRestore={handleRestore}
        loading={loading}
        setSearchInput={setSearchInput} 
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />
      
        <div >
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ◀ Prev
        </button>

        <span>
          Page {page} of {totalPage}
        </span>

        <button disabled={page === totalPage} onClick={() => setPage(page + 1)}>
          Next ▶
        </button>
      </div>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 8, ml: 4 }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          style={{
            backgroundColor:
              snackbar.severity === "error" ? "#bc1823" : "#4BB543",
            color: "#fff4dcc",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RemoveLot;
