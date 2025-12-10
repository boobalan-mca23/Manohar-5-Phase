// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// const getBillItems = async (req, res) => {
//     try {
//         const getitems = await prisma.bill_items.findMany({
//             include: {
//                productInfo: {   
//                     select: {
//                         serial_number: true,
//                     }
//                 }
//             }
//         });
        
        
//         res.status(200).json({ message: "Success", getitems });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Can't retrieve bill items" });
//     }
// };


// const getItemBySerialNumber = async (req,res) => {
//     try {
//         const {serial_number} = req.params;
//         const getItem = await prisma.bill_items.findMany({
//             include : {
//                 productInfo :true
//             }
//         })
//         res.status(200).json(getItem)
//     } catch (error) {
//        console.log(error)
//        res.status(404).json({error : "No items found "}) 
//     }
// }

// const createBillItems = async (req, res) => {
//     try {
        
//         const latestBill = await prisma.bills.findFirst({
//             orderBy: {
//                 created_at: 'desc'
//             }
//         });

        

        
//         const latestProduct = await prisma.product_info.findFirst({
//             orderBy: {
//                 created_at: 'desc'
//             }
//         });

        

        
//         const newItem = await prisma.bill_items.create({
//             data: {
//                 bill_number: latestBill.bill_number,
//                 product_id: latestProduct.id,
//                 created_at: new Date()
//             }
//         });

//         res.status(201).json({
//             message: "successfully created",
//             newItem
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "An error occurred while creating the bill item" });
//     }
// };



// module.exports = { getBillItems,getItemBySerialNumber,createBillItems };