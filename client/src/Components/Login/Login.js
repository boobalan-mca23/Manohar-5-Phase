import React from 'react';
import '../../Components/Login/Login.css';
import { useNavigate } from 'react-router-dom';
import images from '../../Components/Logo/nec.avif'
import { Link } from 'react-router-dom';
import img from '../../Components/Logo/mano.jpg'


 
const Login = () => {
  const navigate= useNavigate()

  const handleClick=  () => {
    navigate('/home')

   }
 
  return (
    <>
    
      <div className='ggg'>


      <div className='nav-bar'> 
  <div className="positionn">
 
  
          <Link to="/"> 
          <h3 className='hom'> Home</h3> </Link>
          <img src={img} alt='jewellery' className='imge'  />   
        </div>
        
        </div>
     
      
          <img src={images} alt='jewellery' className='img' onClick={handleClick} />    
          
          <div className='sty' onClick={handleClick}>
            <div className='genie' onClick={handleClick}>
              Login to Manohar Jewellery  
            </div>
            <div className='logi'>
            <h3 >Login </h3> </div> 

          
            
          </div>
      
          
       

       
      </div>
    </>
  );
};
 
export default Login;