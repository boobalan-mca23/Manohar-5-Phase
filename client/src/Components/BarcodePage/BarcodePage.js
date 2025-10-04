
import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import Barcode from 'react-barcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../BarcodePage/BarcodePage.css';

const BarcodePage = () => {
  const { sNo } = useParams();
  const barcodeRef = useRef();

  const downloadPDF = async () => {
    if (barcodeRef.current) {
      const canvas = await html2canvas(barcodeRef.current);
      const imgData = canvas.toDataURL('image/png');

      
      const pdfWidth = 100; 
      const pdfHeight = 35; 

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight], 
      });

      
      pdf.addImage(imgData, 'PNG', 10, 5, pdfWidth - 20, pdfHeight - 10); 

     
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
    }
  };

  return (
    <>
      <div className="nav-color"></div>
      <div className="container">
        <div className="card">
          <h3>Generated Barcode:</h3>
          {sNo ? (
            <div ref={barcodeRef}>
              <Barcode value={sNo} width={4.5} height={50} fontSize={10} margin={5} />
            </div>
          ) : (
            <p>No serial number provided.</p>
          )}

          {sNo && (
            <button onClick={downloadPDF} className='button-style'>
              Open as PDF
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default BarcodePage;





