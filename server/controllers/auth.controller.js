const {PrismaClient} =require('@prisma/client')
const prisma = new PrismaClient()
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')

exports.userRegister=async(req,res)=>{
     const { userName,phone,password,role,access}=req.body

    try{
         if(!userName||!password||!role||!phone||!access){
          return res.status(400).json({message:"Missing fields"})
        }  
        
        const existUser=await prisma.user.findUnique({where:{
            userName:userName
        }})

       if(existUser) return res.status(400).json({message:"UserName Already Exist"})
       const hashPassword=await bcrypt.hash(password,10)
       console.log('hashPassword',hashPassword);
       
       const newUser=await prisma.user.create({
        data:{
            userName:userName||"",
            password:password||"",
            hashPassword,
            phone:phone||"",
            role:role||"user",
            access:{
                create:{
                      userCreateAccess :access?.userCreateAccess||false,
                      goldSmithAccess  :access?.goldSmithAccess||true,
                      itemAccess       :access?.itemAccess||true,
                      productAccess    :access?.productAccess||true,
                      billingAccess    :access?.billingAccess||true,
                      restoreAccess    :access?.restoreAccess||false,   
                      deleteLotAccess  :access?.deleteLotAccess||false
                }
            }
          }
       })
       return res.status(201).json({suceess:true,message:"User Created SuccessFully",newUser})
    }
    catch(err){
        console.log(err.message)
        return res.status(500).json({err:err.message})

    } 
}


exports.loginUser=async(req,res)=>{
      const {userName,password}=req.body
      console.log('req.body',req.body)
      try{
          if(!userName||!password){
              return res.status(400).json({message:"Missing UserName and Password fields"})
          }
          const user = await prisma.user.findUnique({ where: { userName } });
         if (!user)
         return res.status(400).json({ message: "Invalid UserName " });

        const isMatch = await bcrypt.compare(password, user.hashPassword);
        if (!isMatch)
          return res.status(400).json({ message: "Invalid Password " });

          const token = jwt.sign({
          userId:user.id,name:user.userName,role:user.role
         },
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRES_IN}
        )

      const userAccess= await prisma.user.findUnique({
        where:{
          id:user.id
        },
        include:{
          access:{
            select:{
               userCreateAccess:true,
               billingAccess:true,
               restoreAccess:true,
               productAccess:true,
               goldSmithAccess:true,
               itemAccess:true,
               deleteLotAccess:true 
            }
          }
        }
       })
        const userInfo={
        userName:user.name,
        role:user.role,
        access:userAccess.access[0]
        }
       return res.status(200).json({jwtExpires:process.env.JWT_EXPIRES_IN,success:true,message: "Login successful",token,userInfo});


       }catch(err){
          console.log(err.message)
         return res.status(500).json({err:err.message})
       }
}