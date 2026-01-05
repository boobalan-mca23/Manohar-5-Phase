// const express = require('express')
// const {PrismaClient} = require('@prisma/client')
// const prisma = new PrismaClient();

// const getAllBills = async (req,res) => {
//     try {
//         const allBills = await prisma.bills.findMany();
//         res.status(200).json(allBills)
//     } catch (error) {
//         console.log(error)
//         res.status(404).json({error : 'No bills'})
//     }
// }

// const createBills = async (req,res) => {
//     try {

//         const randomDigit = Math.floor(1000+ Math.random()*9000);
//         const time = Date.now();

//         const bill_number = `${randomDigit}${time}`

//         const newBill = await prisma.bills.create({
//             data : {
//                 bill_number,
//                 created_at : new Date()
//             }
//         })
//         res.status(200).json(newBill)
//     } catch (error) {
//        console.log(error)
//        res.status(404).json({error : 'No bills created '})
//     }
// }

// const deleteBills = async (req,res) => {
//     try {
//         const {id} = req.params;

//         const delBill = await prisma.bills.delete({
//             where : {
//                 id : parseInt(id)
//             }
//         })
//         res.status(200).json({message : "Deleted Successfully", delBill})
//     } catch (error) {
//         console.log(error)
//         res.status(404).json({error : "No Bills deleted"})
//     }
// }

// module.exports = {getAllBills,createBills,deleteBills}



const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getAllBills = async (req, res) => {
  try {
    const allBills = await prisma.bills.findMany({orderBy:{
      created_at:"desc"
    }});
    res.status(200).json(allBills);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "No bills" });
  }
};

const createBills = async (req, res) => {
  try {
    const randomDigit = Math.floor(1000 + Math.random() * 9000);
    const time = Date();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const bill_number = `${year}-${month}-${day}----${randomDigit}`;

    const newBill = await prisma.bills.create({
      data: {
        bill_number,
        created_at: new Date(),
      },
    });

    res.status(200).json(newBill);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "No bills created " });
  }
};

const deleteBills = async (req, res) => {
  try {
    const { id } = req.params;

    const delBill = await prisma.bills.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ message: "Deleted Successfully", delBill });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "No Bills deleted" });
  }
};

// change hold bills to sold

const modifyBillHold = async (req, res) => {
  try {
    const { bill_number } = req.body;
    if (bill_number) {
      const bill = await prisma.bill_items.findMany({
        where: {
          bill_number: String(bill_number),
        },
        select: {
          bill_number: true,
          product_id: true,
          productInfo: true,
        },
      });
      console.log("🚀 ~ modifyBillHold ~ bill:", bill);

      const filteredHoldData = bill.filter(
        (e) => e.productInfo.product_type === "hold"
      );

      const productIdsToUpdate = filteredHoldData.map(
        (item) => item.productInfo.id
      );

      if (productIdsToUpdate.length === 0) {
        return res
          .status(400)
          .json({ msg: "No products found with type 'hold'" });
      }

      const updateResult = await prisma.product_info.updateMany({
        where: {
          id: {
            in: productIdsToUpdate,
          },
        },
        data: {
          product_type: "sold",
        },
      });

      return res
        .status(200)
        .json({ msg: "successfully modified", result: updateResult });
    } else {
      return res.status(400).json({ msg: "Unable to delete the lot" });
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const getBillsByBillNumber = async (req, res) => {
  try {
    const bill_no = req.params.bill_number;
    const billName=await prisma.bills.findUnique({
      where:{
        bill_number:bill_no
      },
      select:{
        bill_name:true
      }
    })
    const allBills = await prisma.bill_items.findMany({
      where: {
        bill_number: bill_no,
      },
      select: {
        productInfo: true,
      },
    });
    const billmod = allBills.map((elem) => {
      return {
        ...elem.productInfo,
        
      };
    });
    const activeProducts=billmod.filter((item)=>item.product_type==="active")
    const soldProducts=billmod.filter((item)=>item.product_type==="sold")
    

    res.status(200).json({ products: billmod ,billName:billName,
      activeProducts:activeProducts,
      soldProducts:soldProducts});
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "No bills" });
  }
};




const postBillDetails = async (req, res) => {
  try {
    const { button, bill_name,selected_products } = req.body;
 
    console.log(selected_products, "rrrrrrrrrrrrrr");
 
    const random4Digit = Math.floor(1000 + Math.random() * 9000);
    const todayDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
 
    const resultString = `${random4Digit}${todayDate}`;
    console.log()
    const newBill = await prisma.bills.create({
      data: {
        bill_number: resultString,
        bill_name,
      },
    });
 
    const billNumber = newBill.bill_number;
    console.log('billNumber',billNumber)
    if (billNumber) {
      const mappedData = selected_products.map((e) => {
        return {
          bill_number: billNumber,
          product_id: e.id,
        };
      });
      console.log('mappedData',mappedData)
      
      const postBillitems = await prisma.bill_items.createMany({
        data: mappedData,
      });

      console.log("iiii", postBillitems);
 
      const productIdsToUpdate = selected_products.map((e) => e.productId);
      
      console.log("productIdToUpadate",productIdsToUpdate);

      const updateResult = await prisma.product_info.updateMany({
        where: {
          product_number: {
            in: productIdsToUpdate,
          },
        },
        data: {
          product_type: button === "Sell" ? "sold" : "hold",
        },
      });
      console.log(newBill, "pppppppppppppppppppppppppppppppppppppppppppppppp");
      res.status(200).json({ bill: newBill });
    } else {
      res.status(404).json({ error: "No bill number" });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "No bills" });
  }
};

// update Bill with Products
const updateBill = async (req, res) => {
  const { bill_number } = req.params;
  const {billName,selected_products } = req.body;

   try {
      
      if (!bill_number || isNaN(bill_number)) {
       return res.status(400).json({ message: "Invalid Formate BillNumber" });
     }
   
     const existBill = await prisma.bills.findUnique({ where: { bill_number:bill_number } });
    
      if (!existBill) {
       return res.status(404).json({ message: "Bill not found" });
     }

     const productIds = selected_products.map(p => p.id);

    //  Already existing bill items
    const existingBillItems = await prisma.bill_items.findMany({
      where: {
        bill_number:bill_number,
        product_id: { in: productIds },
      },
    });
    console.log('existingBillItems', existingBillItems)
  
    const existingProductIds = existingBillItems.map(i => i.product_id);

    //  New products (not yet in bill_items)
    const newProductIds = productIds.filter(
      id => !existingProductIds.includes(id)
    );
   
   console.log('newProductIds',newProductIds)

    await prisma.$transaction([
      //  Insert new bill items
      prisma.bill_items.createMany({
        data: newProductIds.map(id => ({
          bill_number: bill_number,
          product_id: id,
        })),
        skipDuplicates: true,
      }),

      //  Update product type to sold (ONLY active ones)
      prisma.product_info.updateMany({
        where: {
          id: { in: productIds },
          product_type: "active",
        },
        data: {
          product_type: "sold",
        },
      }),
      // Update bill Name 

      prisma.bills.update({
         where:{
           id:existBill.id
         },
         data:{
          bill_name:billName
         }
      })
    ]);
    console.log('bill id',existBill.id)

    return res.status(200).json({
      message: "Bill updated successfully",
      status:"ok"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};


// updateProduct and RemoveFrom Bill
const updateProductAndRemoveFromBill = async (req, res) => {
  try {
    const { productId } = req.params;
    const id = Number(productId);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const product = await prisma.product_info.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const billItem = await prisma.bill_items.findFirst({
      where: { product_id: id },
    });

    if (!billItem) {
      return res.status(400).json({ message: "Product not in bill" });
    }
    // we need to remove the produdt to that bill and update the productType as active
   
    await prisma.bill_items.delete({
       where:{
        id:billItem.id
       }
    })

    await prisma.product_info.update({
      where: { id },
      data: { product_type: "active" },
    });

  const allBills = await prisma.bill_items.findMany({
      where: {
        bill_number: billItem.bill_number,
      },
      select: {
        productInfo: true,
      },
    });
    const billmod = allBills.map((elem) => {
      return {
        ...elem.productInfo,
        
      };
    });
    const activeProducts=billmod.filter((item)=>item.product_type==="active")
    const soldProducts=billmod.filter((item)=>item.product_type==="sold")
    
    return res.status(200).json({
      status:"ok",
      message: "Product SucessFully Removed from Bill and Update Status",
      allProducts:billmod,
      activeProducts:activeProducts,
      soldProducts:soldProducts
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message:err.message });
  }
};


module.exports = { getAllBills, createBills, updateBill,deleteBills, modifyBillHold,getBillsByBillNumber,postBillDetails,updateProductAndRemoveFromBill };
