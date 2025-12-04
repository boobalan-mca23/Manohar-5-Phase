import Table from "react-bootstrap/esm/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import SearchIcon from "@mui/icons-material/Search";
import { TextField, InputAdornment } from "@mui/material";
import RestorePageIcon from "@mui/icons-material/RestorePage";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "./RemovedLots.css";
import React from "react";
import { useState } from "react";
import AlertDialog from "./DialogBox";
import CircularProgress from "@mui/material/CircularProgress";

const RemovedLotTable = (props) => {
  const [open, setOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [access, setAccess] = useState("");
  const [id, setId] = useState("");
  const [index, setIndex] = useState("");

  const { removedLots, handleDelete, handleRestore ,loading} = props;

  const handleConfirm = () => {
    access === "restore" ? handleRestore(id, index) : handleDelete(id, index);
  };

  const handleRestoreLot = (id, index) => {
    setOpen(true);
    setConfirmMessage(`Are You Want To Restore This Lot ${id}`);
    setAccess("restore");
    setId(id);
    setIndex(index);
  };

  const handleDeleteLot = (id, index) => {
    setOpen(true);
    setConfirmMessage(
      `Are you sure you want to permanently delete this lot? All products under this lot will also be removed. Lot ID: ${id}`
    );
    setAccess("delete");
    setId(id);
    setIndex(index);
  };

  return (
    <>
      <div className="removed-lot-container">
        <div className="removed-lot-header">
          <div className="removed-lot-title">
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
        </div>

        <Table striped bordered hover className="tab">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Lot Name</th>
              <th>Lot Type</th>
              <th>Actions</th>
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
                    <div className="lot-btn-flex">
                      <button
                        className="lot-btn-restore"
                        onClick={() => handleRestoreLot(item.id, index)}
                      >
                        <RestorePageIcon />
                        Restore
                      </button>

                      <button
                        className="lot-btn-delete"
                        onClick={() => handleDeleteLot(item.id, index)}
                      >
                        <DeleteForeverIcon />
                        Delete
                      </button>
                    </div>
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
