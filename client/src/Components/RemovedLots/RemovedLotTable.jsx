import Table from "react-bootstrap/esm/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import SearchIcon from "@mui/icons-material/Search";
import { TextField, InputAdornment } from "@mui/material";
import RestorePageIcon from "@mui/icons-material/RestorePage";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Checkbox from "@mui/material/Checkbox";
import "./RemovedLots.css";
import React from "react";
import { useState } from "react";
import AlertDialog from "./DialogBox";
import CircularProgress from "@mui/material/CircularProgress";

const RemovedLotTable = (props) => {
  const [open, setOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [access, setAccess] = useState("");
  
  const { removedLots, handleDelete, handleRestore ,loading,selectedProduct,setSelectedProduct
  } = props;

  const handleSelect = (id, checked) => {
  setSelectedProduct((prev) => {
    let updatedList = [...prev.selectedItems];

    if (checked) {
      // Add id if not exist
      if (!updatedList.includes(id)) {
        updatedList.push(id);
      }
    } else {
      // Remove when unchecked
      updatedList = updatedList.filter((item) => item !== id);
    }

    return {
      count: updatedList.length,
      selectedItems: updatedList,
    };
  });
};

const handleSelectAll = (checked) => {
  if (checked) {
    const allIds = removedLots.map((item) => item.id);
    setSelectedProduct({
      count: allIds.length,
      selectedItems: allIds,
    });
  } else {
    setSelectedProduct({
      count: 0,
      selectedItems: [],
    });
  }
};


  const handleConfirm = () => {
    access === "restore" ? handleRestore() : handleDelete();
  };

  const handleRestoreLot = () => {
     if(selectedProduct.selectedItems.length!==0){
         setOpen(true);
         setConfirmMessage(`Are You Want To Restore The Selected Lots LOT ID: ${selectedProduct.selectedItems}`);
         setAccess("restore");
     }
   
   
  };

  const handleDeleteLot = () => {
     if(selectedProduct.selectedItems.length!==0){
      setOpen(true);
      setConfirmMessage(
      `Are you sure you want to permanently delete this lot? All products under this lot will also be removed.
    LOT ID:  ${selectedProduct.selectedItems}`);
      setAccess("delete");
     }
   
  };

  return (
    <>
      <div>
        <div>
          <div >
            <h2>Removed Lots Information</h2>
            <FontAwesomeIcon icon={faTrashAlt} fontSize={20} />
          </div>
          <TextField
            autoComplete="off"
            placeholder="Search By Lot Id,Type etc.."
            variant="outlined"
            margin="normal"
            fullWidth={false}
            className="removed-lot-search"
            onChange={(e)=>{ props.setSearchInput(e.target.value)}}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                backgroundColor: "#f8f9fa",
                padding: "0px",
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 10px",
                fontSize: "17px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">
                  <SearchIcon style={{ color: "#373333ff" }} />
                </InputAdornment>
              ),
            }}
          />
        <div >
                      <button
                        
                        onClick={()=>{handleRestoreLot()}}
                      >
                        <RestorePageIcon />
                        Restore Selected({selectedProduct.count})
                      </button>

                      <button
                       
                        onClick={()=>{handleDeleteLot()}}
                      >
                        <DeleteForeverIcon />
                        Permantely Delete Selected({selectedProduct.count})
                      </button>
                      </div>
        </div>

        <Table striped bordered hover className="tab">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Lot Name</th>
              <th>Lot Type</th>
               <th>
               <Checkbox
              style={{ color: "white" }}
              checked={selectedProduct.selectedItems.length === removedLots.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
               />
               Select All
             </th>

            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Show loader for 5 sec
              <tr>
                <td colSpan={5}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "20px 0",
                    }}
                  >
                    <CircularProgress size="2rem" />
                    <p style={{ marginTop: "10px", fontWeight: "bold" }}>
                      Loading...
                    </p>
                  </div>
                </td>
              </tr>
            ) : removedLots.length >= 1 ? (
              // Show data
              removedLots.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    {new Date(item.created_at)
                      .toLocaleDateString("en-GB")
                      .replace(/\//g, "-")}
                  </td>
                  <td>{item.lot_name}</td>
                  <td
                    style={{ color: item.type === "STONE" ? "green" : "blue" }}
                  >
                    <b>{item.type}</b>
                  </td>
                  <td> 
                    <input
                     type="checkbox"
                     checked={selectedProduct.selectedItems.includes(item.id)}
                     onChange={(e) => handleSelect(item.id, e.target.checked)}
                     />

                  </td>
                </tr>
              ))
            ) : (
              // After loader stops → no data
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  <b>No Lots Available</b>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <AlertDialog
          open={open}
          setOpen={setOpen}
          setAccess={setAccess}
          confirmMessage={confirmMessage}
          handleConfirm={handleConfirm}
        />
      </div>
    </>
  );
};

export default React.memo(RemovedLotTable);
