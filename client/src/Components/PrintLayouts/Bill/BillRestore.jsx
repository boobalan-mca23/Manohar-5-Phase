import {cleanPlainProduct,transform_text } from "../../utils";

const BillRestore=(props)=>{
    const {restoreProducts=[],selectedColumns={}}=props

     // Restore Products Calculation
   const totalRestoreBeforeWeight = restoreProducts
    .reduce((acc, product) => acc + parseFloat(product.before_weight || 0), 0)
    .toFixed(3);
  const totalRestoreAfterWeight =  restoreProducts
    .reduce((acc, product) => acc + parseFloat(product.after_weight || 0), 0)
    .toFixed(3);
  const totalRestoreDifference =  restoreProducts
    .reduce((acc, product) => acc + parseFloat(product.difference || 0), 0)
    .toFixed(3);
  const totalRestoreAdjustment =restoreProducts
    .reduce((acc, product) => acc + parseFloat(product.adjustment || 0), 0)
    .toFixed(3);
   const totalRestoreBarcodeWeight =restoreProducts.reduce((acc, product) => {

  if (product.itemType === "PLAIN") {
    return acc + parseFloat(product.netWeight || 0);
  } else {
    // STONE
    return acc + parseFloat(product.barcode_weight || 0);
  }
}, 0).toFixed(3);

  const totalRestoreFinalWeight=restoreProducts.reduce((acc,product)=>{
    if (product.itemType === "PLAIN") {
    return acc + parseFloat(product.stoneWeight || 0);
  } else {
    // STONE
    return acc + parseFloat(product.final_weight || 0);
  }
  },0).toFixed(3)
    return(
     <>
               <p style={styles.title} >Restore Products</p>
               <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>S.No</th>
                                        <th style={styles.th}>Product No</th>
                                        {selectedColumns.beforeWeight && <th style={styles.th}>Before Weight</th>}
                                        {selectedColumns.afterWeight && <th style={styles.th}>After Weight</th>}
                                        {selectedColumns.difference && <th style={styles.th}>Difference</th>}
                                        {selectedColumns.adjustment && <th style={styles.th}>Adjustment</th>}
                                        {selectedColumns.barcodeWeight && <th style={styles.th}>Final Weight</th>}
                                        {selectedColumns.finalWeight && <th style={styles.th}>Enamel Weight</th>}
                                    </tr>
                        </thead>
            
                         <tbody>
                            {restoreProducts.length > 0 ? (
                                restoreProducts.map((product, index) => (
                                <tr key={index}>
                                    <td style={styles.td}>{index + 1}</td>
                                    <td style={styles.td}>
                                    {product.itemType === "STONE"
                                        ? transform_text(product.product_number)
                                        : cleanPlainProduct(product.product_number)}
                                    </td>
            
                                    {selectedColumns.beforeWeight && (
                                    <td style={styles.td}>
                                        {product.itemType === "STONE" ? product.before_weight : "-"}
                                    </td>
                                    )}
            
                                    {selectedColumns.afterWeight && (
                                    <td style={styles.td}>
                                        {product.itemType === "STONE" ? product.after_weight : "-"}
                                    </td>
                                    )}
            
                                    {selectedColumns.difference && (
                                    <td style={styles.td}>
                                        {product.itemType === "STONE" ? product.difference : "-"}
                                    </td>
                                    )}
            
                                    {selectedColumns.adjustment && (
                                    <td style={styles.td}>
                                        {product.itemType === "STONE" ? product.adjustment : "-"}
                                    </td>
                                    )}
            
                                    {selectedColumns.barcodeWeight && (
                                    <td style={styles.td}>
                                        {product.itemType === "PLAIN"
                                        ? product.netWeight
                                        : product.barcode_weight}
                                    </td>
                                    )}
            
                                    {selectedColumns.finalWeight && (
                                    <td style={styles.td}>
                                        {product.itemType === "PLAIN"
                                        ? product.stoneWeight
                                        : product.final_weight}
                                    </td>
                                    )}
                                </tr>
                                ))
                            ) : (
                                <tr>
                                <td style={styles.td} colSpan="8">
                                    No products found
                                </td>
                                </tr>
                            )}
                            </tbody>
            
                        <tfoot>
                            <tr>
                                <td style={styles.tfootTd}>Total</td>
                                <td style={styles.tfootTd}>-</td>
            
                                {selectedColumns.beforeWeight && (
                                <td style={styles.tfootTd}>{totalRestoreBeforeWeight}</td>
                                )}
                                {selectedColumns.afterWeight && (
                                <td style={styles.tfootTd}>{totalRestoreAfterWeight}</td>
                                )}
                                {selectedColumns.difference && (
                                <td style={styles.tfootTd}>{totalRestoreDifference}</td>
                                )}
                                {selectedColumns.adjustment && (
                                <td style={styles.tfootTd}>{totalRestoreAdjustment}</td>
                                )}
                                {selectedColumns.barcodeWeight && (
                                <td style={styles.tfootTd}>{totalRestoreBarcodeWeight}</td>
                                )}
                                {selectedColumns.finalWeight && (
                                <td style={styles.tfootTd}>{totalRestoreFinalWeight}</td>
                                )}
                            </tr>
                      </tfoot>
              </table>
     </>
 )
}
const styles = {
   table: {
    marginTop:"2px",
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "15px",
  },

  th: {
    border: "1px solid #000",
    padding: "8px",
    backgroundColor: "#f2f2f2",
    fontWeight: "bold"
  },

  td: {
    border: "1px solid #000",
    padding: "6px"
  },

  tfootTd: {
    border: "1px solid #000",
    padding: "8px",
    fontWeight: "bold",
    backgroundColor: "#eaeaea"
  },
  title:{
   textAlign:"center",
   marginTop:"2px",
   fontWeight:"bold"
 }
};
export default BillRestore