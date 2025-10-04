import React from 'react';
import '../Navbarr/Navbarr.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import images from '../../Components/Logo/mano.jpg'

const Navbarr = () => {
  return (
  <> 
  <div className='nav-bar'> 
  <div className="positionn">
 
  
    <Link to='/home'> 
          <b style={{ cursor: 'pointer', color: 'white'  }}> Products </b>
          </Link>
          <Link to="/billing">
            <b style={{ cursor: 'pointer', color: 'white' }}> Billing </b>
          </Link>
          <Link to="/restore">
            <b style={{ cursor: 'pointer', color: 'white' }}> Restore </b>
          </Link>
          <Link to="/"> 
          <h3 className='hom'> Home</h3> </Link>
          <img src={images} alt='jewellery' className='imge'  />   
        </div>
        
        </div>
       
  </>
  )
}

export default Navbarr