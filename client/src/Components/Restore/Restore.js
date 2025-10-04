import React, { useState, useEffect } from "react";
import "./Restore.css";
import Table from "react-bootstrap/esm/Table";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbarr from "../Navbarr/Navbarr";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config";

const Restore = () => {
  const navigate = useNavigate();
  const [restoreProducts, setRestoreProducts] = useState([]);
 
  useEffect(() => {
    const fetchAllRestore = async () => {
      
      try{
         const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/v1/restore`
      );
        console.log('response',response.data)
        setRestoreProducts(response.data)

      }catch(err){
        alert(err.message)
        console.log(err.message)
      }
      
    };
    fetchAllRestore()
  }, []);

  const handleRestoreDelete=async(id)=>{
   
    let isTrue=window.confirm("Are You Want To Delete Restore")

    if(isTrue){
       try{
      const response=await axios.delete(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/restore/${id}`)
      if(response.status===200){
         const filteredProducts=restoreProducts.filter((item,_)=> item.id!=id)
         setRestoreProducts(filteredProducts)
         alert(response.data.message)
      }
    }catch(err){
       console.log(err.message)
       alert(err.message)
      }
    }

   
  }
  return (
    <>
      <div className="background">
        <Navbarr />
        <br></br>
        <div className="restoreBtnContainer">
          <button
            className="restoreBtn"
            onClick={() =>navigate('/restore/newRestore')}
          >
            Add New Restore
          </button>
        </div>

        <div className="tab-container">
          <Table striped bordered hover className="tab">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Created at</th>
                <th>Restore Name </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restoreProducts.length>=1 ? restoreProducts.map((item,index)=>(
                <tr key={index+1}>
                  <td>{index+1}</td>
                  <td>{new Date(item.created_at).toLocaleDateString("en-GB")}</td>
                  <td>{item.description}</td>
                  <td>
                    <button className="restoreActions" onClick={()=>{navigate(`/restore/ViewRestore/${item.restore_number}`)}}>View</button>
                    <button className="restoreActions" onClick={()=>{handleRestoreDelete(item.id)}}>Delete</button>  
                  </td>
                </tr>
              )):
              
              (<tr>
                  <td colSpan="4">No Restore Product found.</td>
                </tr>)}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default Restore;
