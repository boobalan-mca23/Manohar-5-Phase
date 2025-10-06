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
    res.status(200).json({ products: billmod });
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
 
     const productsId=mappedData.map((item,_)=>item.product_id)
     
     await prisma.restoreItems.deleteMany({
      where:{
        product_id:{in:productsId}
      }
     })
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



module.exports = { getAllBills, createBills, deleteBills, modifyBillHold,getBillsByBillNumber,postBillDetails };
