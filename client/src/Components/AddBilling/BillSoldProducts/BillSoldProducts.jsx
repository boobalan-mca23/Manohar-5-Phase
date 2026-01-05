import { cleanPlainProduct, transform_text } from "../../utils"; 
const BillSoldProducts=(props)=>{
    const {soldProducts,selectedColumns}=props



  // Sold Products Calculation

    const totalSoldBeforeWeight =soldProducts
    .reduce((acc, product) => acc + parseFloat(product.before_weight || 0), 0)
    .toFixed(3);
  const totalSoldAfterWeight =soldProducts
    .reduce((acc, product) => acc + parseFloat(product.after_weight || 0), 0)
    .toFixed(3);
  const totalSoldDifference = soldProducts
    .reduce((acc, product) => acc + parseFloat(product.difference || 0), 0)
    .toFixed(3);
  const totalSoldAdjustment = soldProducts
    .reduce((acc, product) => acc + parseFloat(product.adjustment || 0), 0)
    .toFixed(3);
   const totalSoldBarcodeWeight = soldProducts.reduce((acc, product) => {

  if (product.itemType === "PLAIN") {
    return acc + parseFloat(product.netWeight || 0);
  } else {
    // STONE
    return acc + parseFloat(product.barcode_weight || 0);
  }
}, 0).toFixed(3);

  const totalSoldFinalWeight=soldProducts.reduce((acc,product)=>{
    if (product.itemType === "PLAIN") {
    return acc + parseFloat(product.stoneWeight || 0);
  } else {
    // STONE
    return acc + parseFloat(product.final_weight || 0);
  }
  },0).toFixed(3)

    return(
      
         <>
            <table  className="addbill-table">
                       <thead>
                                <tr>
                                <th>  S.No </th>
                                <th> Product.No </th>
                                {selectedColumns.beforeWeight && <th> Before Weight </th>}
                                {selectedColumns.afterWeight && <th> After Weight </th>}
                                {selectedColumns.difference && <th> Difference </th>}
                                {selectedColumns.adjustment && <th> Adjustment </th>}
                                {selectedColumns.barcodeWeight&& <th> Final Weight</th>}
                                {selectedColumns.finalWeight && <th> Enamel Weight </th>}
                                                                  
                          </tr>   
                       </thead>
                       <tbody>
                         {soldProducts.length > 0 ? (
                           soldProducts.map((product, index) => (
                             <tr key={index}>
                            <td>{index + 1}</td>
                              <td> { product.itemType==="STONE"? transform_text(product.product_number):cleanPlainProduct(product.product_number)}</td>
                             {selectedColumns.beforeWeight && <td>{product.itemType==="STONE"? product.before_weight:"-"}</td>}
                             {selectedColumns.afterWeight && <td>{product.itemType==="STONE"? product.after_weight:"-"}</td>}
                             {selectedColumns.difference && <td>{product.itemType==="STONE"?product.difference:"-"}</td>}
                             {selectedColumns.adjustment && <td>{product.itemType==="STONE"?product.adjustment:"-"}</td>}
                             {selectedColumns.barcodeWeight&& <td>{product.itemType==="PLAIN"?product.netWeight:product.barcode_weight}</td>}
                             {selectedColumns.finalWeight && <td>{product.itemType==="PLAIN"?product.stoneWeight:product.final_weight}</td>} 
                              
                             </tr>
                           ))
                         ) : (
                           <tr>
                             <td colSpan="8">No Sold products found.</td>
                           </tr>
                         )}
                       </tbody>
                        <tfoot>
                         <tr className="bill-tfoot">
                         <td ><b>Total Weight </b></td>
                         <td><b>-</b></td>
                         {selectedColumns.beforeWeight && <td><b>{totalSoldBeforeWeight}</b></td>}
                         {selectedColumns.afterWeight && <td><b>{totalSoldAfterWeight}</b></td>}
                         {selectedColumns.difference && <td><b>{totalSoldDifference}</b></td>}
                         {selectedColumns.adjustment && <td><b>{totalSoldAdjustment}</b></td>}
                         {selectedColumns.barcodeWeight &&<td><b>{totalSoldBarcodeWeight}</b></td>}
                         {selectedColumns.finalWeight && <td><b>{totalSoldFinalWeight}</b></td>}
                         </tr>
                       </tfoot>
                      </table>
         </>
    )
}

export default BillSoldProducts