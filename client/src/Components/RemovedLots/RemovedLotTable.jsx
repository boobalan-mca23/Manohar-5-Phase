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
  
  const { removedLots, handleDelete, handleRestore ,loading,selectedProduct,setSelectedProduct, page, totalPage, setPage } = props;

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
      <div className="rl-table-wrapper">
    <div className="rl-table-header">
            <h2>Removed Lots Information</h2>
            <FontAwesomeIcon icon={faTrashAlt} fontSize={20} />
          </div>
      
         <div className="rl-action-buttons">
          <TextField
            autoComplete="off"
            placeholder="Search By Lot Id,Type etc.."
            variant="outlined"
            margin="normal"
            fullWidth={false}
            className="rl-search"
            onChange={(e)=>{ props.setSearchInput(e.target.value)}}
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">
                  <SearchIcon style={{ color: "#373333ff" }} />
                </InputAdornment>
              ),
            }}
          />
          <button
            className="rl-action-button-1"
            onClick={()=>{handleRestoreLot()}}>
            <RestorePageIcon />{`Restore Selected [${selectedProduct.count}]`}
          </button>
          <button
            className="rl-action-button-2"
            onClick={()=>{handleDeleteLot()}}>
            <DeleteForeverIcon /> {`Permantely Delete Selected [${selectedProduct.count}]`}
          </button>
          </div>


        <Table striped bordered hover className="rl-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Lot Name</th>
              <th>Lot Type</th>
              <th><Checkbox
                  style={{
                    color:"whitesmoke"
                  }}
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
                  <div className="rl-loader"
                  >
                    <CircularProgress size="2rem" />
                    <p>Loading...</p>
                  </div>
                </td>
              </tr>
            ) : removedLots.length >= 1 ? (
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
              <tr>
                <td
                  colSpan={5}
                  className="rl-no-data"
                >
                  <b>No Lots Available</b>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <div className="rl-nav-button" >
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
