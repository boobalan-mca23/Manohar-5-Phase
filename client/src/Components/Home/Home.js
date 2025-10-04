
import React, { useState, useEffect } from "react";
import {
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/system";
import { RiAddCircleFill, RiDeleteBin6Line, RiEyeLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Home/Home.css";
import Navbarr from "../Navbarr/Navbarr";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config";

const RoundedTextField = styled(TextField)({
  maxWidth: 300,
  backgroundColor: "#f9f9f9",
  marginTop: "9rem",
  "& .MuiOutlinedInput-root": {
    borderRadius: "20px",
    paddingLeft: "16px",
    "& fieldset": {
      borderColor: "#ccc",
    },
    "&:hover fieldset": {
      borderColor: "#888",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
    },
  },
});

const StyledCard = styled(Card)({
  backgroundColor: "#e3f2fd",
  borderRadius: "15px",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  width: "180px",
  margin: "10px",
  "&:hover": {
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
  },
});

const StyledButton = styled(Button)({
  borderRadius: "20px",
  padding: "8px 20px",
  fontSize: "16px",
});

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    padding: "20px",
    borderRadius: "15px",
    backgroundColor: "#fff",
  },
});

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [lotNumber, setLotNumber] = useState("");
  const [lotNumbers, setLotNumbers] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [deleteLotId, setDeleteLotId] = useState(null); // To store lot ID for deletion

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_BACKEND_SERVER_URL}/api/v1/lot`
        );
        console.log("Fetched Lots:", response.data);
        if (response.data && Array.isArray(response.data.result)) {
          setLotNumbers(response.data.result);
        } else {
          console.error(
            "API response does not contain 'result' array:",
            response.data
          );
          setLotNumbers([]);
        }
      } catch (error) {
        console.error("Error fetching lots:", error);
        setLotNumbers([]);
      }
    };

    fetchLots();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setLotNumber("");
  };

  const handleLotNumberChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value === "" || /^[A-Z]{1}\d{0,2}$/.test(value)) {
      setLotNumber(value);
    }
  };

  const handleSaveLotNumber = async () => {
    if (lotNumber) {
      try {
        const response = await fetch(
          `${REACT_APP_BACKEND_SERVER_URL}/api/v1/lot/lot_info`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lot_name: lotNumber,
            }),
          }
        );

        const result = await response.json();

        console.log("Save Response:", result);

        if (response.ok) {
          const newLot = {
            id: result.newLot.id,
            lot_name: lotNumber,
          };

          setLotNumbers((prev) => [...prev, newLot]);
          console.log("New Lot:", newLot);
          setSuccessMessage("Lot created successfully!");
          setLotNumber("");
          handleClose();
        } else {
          console.error("Error:", result.msg);
          setSuccessMessage(result.msg || "Error creating lot.");
        }
      } catch (error) {
        console.error("Failed to save Lot No:", error);
        setSuccessMessage("Failed to save Lot No.");
      }
    } else {
      setSuccessMessage("Lot Name is required.");
    }
  };

  const handleDeleteLotNumber = (index, lotId) => {
    setDeleteIndex(index);
    setDeleteLotId(lotId); // Store lot ID to delete
    setDeleteConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Make a DELETE request to remove the lot from the database
      const response = await axios.delete(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/lot/lot_info/${deleteLotId}`
      );

      if (response.status === 200) {
        const updatedLotNumbers = lotNumbers.filter(
          (lot, index) => index !== deleteIndex
        );
        setLotNumbers(updatedLotNumbers);
        setDeleteConfirmationOpen(false);
        setSuccessMessage("Lot deleted successfully");
      } else {
        setSuccessMessage("Failed to delete lot.");
      }
    } catch (error) {
      console.error("Error deleting lot:", error);
      setSuccessMessage("Error deleting lot.");
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage("");
  };

  const handleCloseDeleteDialog = () => {
    setDeleteConfirmationOpen(false);
    setDeleteIndex(null);
  };

  const handleViewLotDetails = (lot_id, lot_name) => {
    navigate(`/products/${lot_id}?lotname=${lot_name}`);
  };

  const filteredLotNumbers = lotNumbers.filter((lot) =>
    lot.lot_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbarr />
      <div className="background">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <RoundedTextField
              label="Search Lot Number"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Lot No"
              fullWidth
            />
            <IconButton sx={{ ml: 1 }} onClick={handleClickOpen}>
              <RiAddCircleFill
                style={{ marginTop: "9rem", marginLeft: "2rem" }}
                size={32}
                color="rgb(36, 36, 66)"
              />
            </IconButton>
          </Box>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle style={{ fontWeight: "bold" }}>Add Lot Number</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Lot No"
                type="text"
                fullWidth
                variant="outlined"
                value={lotNumber}
                onChange={handleLotNumberChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSaveLotNumber} color="primary" variant="contained">
                Save
              </Button>
            </DialogActions>
          </Dialog>

          <StyledDialog
            open={deleteConfirmationOpen}
            onClose={handleCloseDeleteDialog}
            aria-labelledby="delete-lot-number-dialog"
          >
            <DialogTitle sx={{ fontSize: "18px", fontWeight: "bold", color: "#1976d2" }}>
              Confirm Deletion
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete this Lot No?
              </Typography>
            </DialogContent>
            <DialogActions>
              <StyledButton onClick={handleCloseDeleteDialog} color="secondary" variant="outlined">
                Cancel
              </StyledButton>
              <StyledButton onClick={confirmDelete} color="primary" variant="contained">
                Yes, Delete
              </StyledButton>
            </DialogActions>
          </StyledDialog>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              mt: 2,
              maxWidth: "100%",
            }}
          >
            {filteredLotNumbers.length > 0 ? (
              filteredLotNumbers.map((lot, index) => (
                <StyledCard key={index}>
                  <CardContent sx={{ textAlign: "center", backgroundColor: "rgb(36, 36, 66)" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: "white",
                        mb: 1,
                        fontSize: "1.2rem",
                      }}
                    >
                      {lot.lot_name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 2,
                      }}
                    >
                      <IconButton onClick={() => handleViewLotDetails(lot.id, lot.lot_name)}>
                        <RiEyeLine size={20} color="white" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteLotNumber(index, lot.id)}>
                        <RiDeleteBin6Line size={20} color="white" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </StyledCard>
              ))
            ) : (
              <Typography variant="body1" color="rgb(36, 36, 66)" fontWeight="bold" fontSize="1.5rem">
                No Lot numbers available.
              </Typography>
            )}
          </Box>

          <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity={successMessage.includes("Error") ? "error" : "success"} sx={{ width: "100%" }}>
              {successMessage}
            </Alert>
          </Snackbar>
        </Box>
      </div>
    </>
  );
}

export default Home;
