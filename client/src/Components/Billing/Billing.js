
import React, { useState, useEffect } from "react";
import "../Billing/Billing.css";
import { useNavigate } from "react-router-dom";
import Table from "react-bootstrap/esm/Table";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbarr from "../Navbarr/Navbarr";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config";

const Billing = () => {
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_BACKEND_SERVER_URL}/bills/getAll`
        );
        setBills(response.data);
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };
    fetchBills();
  }, []);


  const deleteProduct = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this bill?");
    if (!isConfirmed) {
     
      return;
    }
    try {
      const response = await axios.delete(
        `${REACT_APP_BACKEND_SERVER_URL}/bills/delete/${id}`
      );
      if (response.status === 200) {
        alert("Bill deleted successfully");
        setBills((prevBills) => prevBills.filter((bill) => bill.id !== id));
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
    }
  };


    const handleAddBill = async (billType) => {
    try {
      // navigate(`/billing/bill/add`);
      navigate(`/billing/bill`);
      setBills((prevBills) => [...prevBills]);
    } catch (error) {
      console.error("Error creating a new bill:", error);
    }
  };

  
  // const handleAddBill = async (billType) => {
  //   try {
  //     const response = await axios.post("http://localhost:5000/bills/create", {
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     const newBill = response.data;
  //     const { bill_number, created_at } = newBill;
  
  //     navigate(`/billing/${bill_number}/add/${billType}`);
  //     setBills((prevBills) => [
  //       ...prevBills,
  //       { bill_number, created_at: new Date(created_at).toLocaleString() },
  //     ]);
  //   } catch (error) {
  //     console.error("Error creating a new bill:", error);
  //   }
  // };

  return (
    <>
    <Navbarr />
    <div className="billing-page">
      <div className="bill">
        <button onClick={() => handleAddBill("customer")}>
          Add New Bill Customer
        </button>
      </div>
      <div className="tab-container">
  <Table className="tab">
    <thead>
      <tr>
        <th>S.No</th>
        <th>Created at</th>
        <th>Bill Name</th>
        <th>View</th>
      </tr>
    </thead>

    <tbody>
      {bills.map((bill, index) => (
        <tr key={bill.bill_number}>
          <td>{bill.id}</td>
          <td>{new Date(bill.created_at).toLocaleDateString("en-GB")}</td>
          <td>{bill.bill_name}</td>

          <td>
            <Link to={`/billing/${bill.bill_number}`}>
              <button className="vieww">View</button>
            </Link>

            <button className="vieww" onClick={() => deleteProduct(bill.id)}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
</div>

      </div>
    </>
  );
};

export default Billing;
