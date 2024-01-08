require('dotenv').config();
const express = require('express')
const path = require("path")
const app = express()
const hbs = require("hbs")
const mongoURI = process.env.MONGO_URI;

// require("./db/conn")
const Register = require('./models/registers');
const { default: mongoose } = require('mongoose')

const port = 3000

const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../templates/views")
const partials_path = path.join(__dirname, "../templates/partials")

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(express.static(static_path))
app.set("view engine", "hbs")
app.set("views", template_path)
hbs.registerPartials(partials_path)

app.get('/', (req, res) => {
    res.render("index")
})

app.get('/register', (req, res) => {
    res.render("register");
});

mongoose.connect(mongoURI)
.then(() => {
    console.log('Connected to MongoDB!')
    app.listen(process.env.PORT || port, () => {
        console.log(`Node API app is running on port ${port}`)
    })
    
}).catch((error) => {
    console.log(error)
})

// app.listen(process.env.PORT || port, () => {
//     console.log(`Node API app is running on port ${port}`)
// })

app.post('/register', async (req, res) => {
    try {
        const password = req.body.password
        const cpassword = req.body.confirmPassword

        if (password === cpassword) {

            const userData = new Register({
                fullName: req.body.fullName,
                userName: req.body.userName,
                email: req.body.email,
                phone: req.body.phone,
                password: password,
                confirmPassword: cpassword,
                gender: req.body.gender,
            })

            const registered = await userData.save()
            res.status(201).render("index")

        } else {
            res.send("Password are not matching!")
        } 
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyValue) {
            if ("email" in error.keyValue) {
                res.status(400).send("Enter a unique Email.");
            } else if ("phone" in error.keyValue) {
                res.status(400).send("Enter a unique Phone Number.");
            } else {
                res.status(400).send("Duplicate key error.");
            }
        } else {
            res.status(400).send(error.message);
        }
    }
});

app.post('/login', async (req, res) => {
    try {
        const { userName, password } = req.body;
        const user = await Register.findOne({ userName: userName, password: password });


        if (user) {
            res.render("home", { successMessage: "Logged in successfully!" });
        } else {
            res.render("index", { errorMessage: "Invalid username/password" });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.get('/user', (req, res) => {
    res.json({message: "hello"})
})