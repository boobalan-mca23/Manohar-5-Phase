import axios from "axios"
import {REACT_APP_BACKEND_SERVER_URL} from "../config/index"
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const transform_text = (num) => {
  if (num === undefined || num === null) return "";
  // Force convert to string always
  const str = String(num);
  // If "__" not found, return whole string
  if (!str.includes("__")) return str;
  return str.split("__")[0];
};

export const handleWeight = async () => {
    try {
      const res = await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/weight/getWeight`);
      return res.data;  // Ensure the function returns the weight data
    } catch (err) {
      toast.warn("weight mechine not Connected",{autoClose:2000})
      // alert("weight mechine not Connected ")
      // console.log(err.message);
      return null;  // Return null if there's an error
    }
  };
  
  export const weightVerify = (value, weight1, weight2) => {
    // Check for the initial invalid condition
    if (!weight1 || !weight2 || isNaN(weight1) || isNaN(weight2)) {
          alert("Please Enter the Value")
        return;
    }

    // Convert to number if they are strings
    weight1 = parseFloat(weight1);
    weight2 = parseFloat(weight2);

    // Calculate weight difference
    const weight = (weight1 - weight2).toFixed(3);
    const diffValue = parseFloat(weight);

    // Check if the difference is positive within range
    if (diffValue >= 0.000 && diffValue <= 0.100) {
        alert(`Verify Success on ${value} weight difference`);
    }
    // Check if the difference is negative within range
    else if (diffValue < 0.000 && diffValue >= -0.100) {
        alert(`Verify Success on ${value} weight difference`);
    }
    // Check if the difference is greater than positive range
    else if (diffValue > 0.100) {
        window.confirm(`Difference ${diffValue} exceeds the upper limit. Verify failed on ${value} weight difference. Correct Range >= 0.000 to <= 0.100. Do you want to continue?`);
    }
    // All other cases (negative difference exceeds range)
    else {
        window.confirm(`Difference ${diffValue} is below the lower limit. Verify failed on ${value} weight difference. Correct Range -0.100 to <= 0.000. Do you want to continue?`);
    }
};


  export const weightVerifyBoth=(bulkWeightBefore,totalBeforeWeight,bulkWeightAfter,totalAfterWeight)=>{
  let isTrue=""
  const before= (bulkWeightBefore - totalBeforeWeight).toFixed(3); // Fix to 3 decimals
  const after= (bulkWeightAfter - totalAfterWeight).toFixed(3);
  // Convert `before` back to a number for comparison
  const diffValue1 = parseFloat(before);
  const diffValue2=parseFloat(after)

  if (
    !(
      (diffValue1>= 0.000 &&diffValue1 <= 0.100) || 
      (diffValue1>= -0.100 && diffValue1 <= -0.000)
    )
  ) {
    isTrue=window.confirm(`Difference ${diffValue1} Verify failed on Before weight difference. Do you want to continue?`)
    return isTrue
  }

  if (
    !(
      (diffValue2>= 0.000 &&diffValue2<= 0.100) || 
      (diffValue2>= -0.100 && diffValue2<= -0.000)
    )
  ) {
     isTrue=window.confirm(`Difference ${diffValue2} Verify failed on After weight difference. Do you want to continue?`)
     return isTrue
  }

  else{
   
    alert(`Verify Success on Both weight difference`)
   }
}
