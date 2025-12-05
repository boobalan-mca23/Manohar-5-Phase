const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt=require('bcryptjs')

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { phone, password, role, access } = req.body;

  try {
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ message: "User ID is required and must be numeric" });
    }
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User not found in the database" });
    }
    let hashedPassword = existingUser.hashPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        phone: phone ?? existingUser.phone,
        password: password ?? existingUser.password,
        hashPassword:hashedPassword,
        role: role ?? existingUser.role,
        access: {
          update: {
            where: {
              id: access.id,
            },
            data: {
              userCreateAccess: access?.userCreateAccess || false,
              goldSmithAccess: access?.goldSmithAccess || false,
              itemAccess: access?.itemAccess || false,
              productAccess: access?.productAccess || false,
              billingAccess: access?.billingAccess || false,
              restoreAccess: access?.restoreAccess || false,
              deleteLotAccess:access?.deleteLotAccess || false
            },
          },
        },
      },
      include: { access: true },
    });

    return res.status(200).json({
      suceess: true,
      message: "User Updated SuccessFully",
      updatedUser,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    if (isNaN(id)) {
      return res.status(400).json({ message: "User ID is required and must be numeric" });
    }
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res .status(404).json({ message: "User not found in the database" });
    }

     const user=await prisma.user.findUnique({
      where:{
        id:parseInt(id)
      },
      include:{
        access:true
      }
    })
       return res.status(200).json({success:true,user})

  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: err.message });
  }
};

exports.getAllUser=async(req,res)=>{
     try{
         const allCustomers=await prisma.user.findMany({
          orderBy:{
            id:"desc"
          },
          include:{
            access:true
          }
         })
         return res.status(200).json({success:true,allCustomers})
     }
     catch(err){
         console.log('err',err.message)
         return res.status(500).json({err:err.message})
     }
}

exports.deleteUser=async(req,res)=>{
    const {id}=req.params
 
    try{
        if(isNaN(id)) return res.status(400).json({message:"User id is Required"})
       
        const ifExist=await prisma.user.findUnique({where:{id:parseInt(id)}})
        if(!ifExist) return res.status(400).json({message:"User not found in the database"})
        
        const deleteUser=await prisma.user.delete({
        where:{
            id:parseInt(id)
        }
       })
        return res.status(200).json({success:true,message:"User Deleted SuceesFully",deleteUser})
      }
      catch(err){
      console.log('err',err.message)
      return res.status(500).json({err:err.message})
    }
}
