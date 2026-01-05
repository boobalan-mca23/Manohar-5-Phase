import React from "react";
import {cleanPlainProduct,transform_text } from "../../utils";
import BillRestore from "./BillRestore";
import BillSold from "./BillSold";

const BillPrintLayout=React.forwardRef((props, ref) => {
    const {scannedProducts=[],
          selectedColumns={},
          billName,
          restore=[],
          sold=[]}=props

    const totalBeforeWeight = scannedProducts
    .reduce((acc, product) => acc + parseFloat(product.before_weight || 0), 0)
    .toFixed(3);
  const totalAfterWeight = scannedProducts
    .reduce((acc, product) => acc + parseFloat(product.after_weight || 0), 0)
    .toFixed(3);
  const totalDifference = scannedProducts
    .reduce((acc, product) => acc + parseFloat(product.difference || 0), 0)
    .toFixed(3);
  const totalAdjustment = scannedProducts
    .reduce((acc, product) => acc + parseFloat(product.adjustment || 0), 0)
    .toFixed(3);
   const totalBarcodeWeight = scannedProducts.reduce((acc, product) => {

  if (product.itemType === "PLAIN") {
    return acc + parseFloat(product.netWeight || 0);
  } else {
    // STONE
    return acc + parseFloat(product.barcode_weight || 0);
  }
}, 0).toFixed(3);

  const totalFinalWeight=scannedProducts.reduce((acc,product)=>{
    if (product.itemType === "PLAIN") {
    return acc + parseFloat(product.stoneWeight || 0);
  } else {
    // STONE
    return acc + parseFloat(product.final_weight || 0);
  }
  },0).toFixed(3)
    return(

      <>
          <div>
             <div style={styles.header}>
                 <h4>Bill Name:{billName}</h4>
                 <h2>Manohar Jewellery</h2>
                 <h4>Date:{new Date().toLocaleDateString("en-IN")}</h4>
             </div>
          
             <div>
                <p style={{ textAlign: "center",margin: "8px 0",fontWeight: "bold"}}>Bill Products</p>
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
                {scannedProducts.length > 0 ? (
                    scannedProducts.map((product, index) => (
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
                    <td style={styles.tfootTd}>{totalBeforeWeight}</td>
                    )}
                    {selectedColumns.afterWeight && (
                    <td style={styles.tfootTd}>{totalAfterWeight}</td>
                    )}
                    {selectedColumns.difference && (
                    <td style={styles.tfootTd}>{totalDifference}</td>
                    )}
                    {selectedColumns.adjustment && (
                    <td style={styles.tfootTd}>{totalAdjustment}</td>
                    )}
                    {selectedColumns.barcodeWeight && (
                    <td style={styles.tfootTd}>{totalBarcodeWeight}</td>
                    )}
                    {selectedColumns.finalWeight && (
                    <td style={styles.tfootTd}>{totalFinalWeight}</td>
                    )}
                </tr>
          </tfoot>
            </table>
           
           <BillRestore
            restoreProducts={restore}
            selectedColumns={selectedColumns}
           />
           
           <BillSold
             soldProducts={sold}
             selectedColumns={selectedColumns}
            />


             </div>

          </div>
      </>
  )
})

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: "20px",
    borderBottom: "2px solid #000",
    // paddingBottom: "10px"
  },

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

};


export default BillPrintLayout