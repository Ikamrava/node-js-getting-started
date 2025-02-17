import {db} from "../db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const register = (req,res)=>{
    console.log(req.body)


        const q = "select * from users where email = ? or username = ?"
          db.query(q,[req.body.email,req.body.username],(err,data)=>{
              if(err) return res.json(err)
              if (data.length) return res.status(409).json("User already exist")
        
              const salt = bcrypt.genSaltSync(10)
              const hash = bcrypt.hashSync(req.body.password, salt)
      
              const qu = "INSERT INTO users(username,password,email) Values (?,?,?)" 
              db.query(qu,[req.body.username,hash,req.body.email],(err,data)=>{
                  if (err) console.log(err)
                  return res.status(200).json("User has been created")
              })
          
          })
}

export const login = (req,res)=>{
    const q = "select * from users where username = ?"
    db.query(q,[req.body.username],(err,data)=>{
        if(err) return res.json(err)
        if (data.length === 0) return res.status(404).json("User does not exist")
        const ispasswordCorrect = bcrypt.compareSync(req.body.password,data[0].password)
        if (!ispasswordCorrect) return res.status(400).json("Wrong username or password")

      const token =  jwt.sign({id:data[0].id},"jwtkey")
      
      const {password, ...other} = data[0]

      
    res.cookie("access_token", token,{
            httpOnly: true
          }).status(200).json(other)
    })
}



export const logout = (req,res)=>{
    res.clearCookie("access_token",{
        sameSite :"none",
        secure:true,
    }).status(200).json("User has been logged out")
}