const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const mongoose = require('mongoose')
mongoose.Promise = Promise
mongoose.connect('mongodb://localhost:27017/usersData')
.then(() => console.log('Mongoose up'))

const User = require('./schemas/users')

app.use(bodyParser.json())

app.post('/api/login', async (req, res)=>{
    const {username, password} = req.body
    const resp = await User.findOne({username, password})
    if(!resp){
        //login incorrect
        res.json({
            success: false,
            message: "Incorrect details"
        })
    }
    else{
        res.json({
            success: true
        })
        //make session and logged in
    }
})

app.post('/api/register', async (req, res) =>{
    const {username, password} = req.body

    const existingUser = await User.findOne({username})

    if(existingUser){
        res.json({
            success: false,
            message: "Username already in use"
        })
        return
    }

    const user = new User({
        username,
        password
    })

    const result = await user.save();
    res.json({
        success: true,
        message: "Seems good, welcome"
    })
})

app.listen(1234, ()=> console.log('Server listening at 1234'))