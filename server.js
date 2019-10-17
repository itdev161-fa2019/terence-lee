import express from 'express';
import connectDatabase from './config/db';
import {check, validationResult} from 'express-validator';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import User from './models/User';

//Initialize express application
const app = express();

//Connect database
connectDatabase();

//Configure middleware
app.use(express.json({extended: false}));
app.use(cors({
    origin: "http://localhost:3000"
}));

//API endpoints
/*
    @route GET /
    @desc Test Endpoint
*/ 
app.get('/', (req, res) => 
    res.send('http get request sent to root api endpoint')
);

/*
    @route POST api/users
    @desc Register user
*/
app.post('/api/users', [
    check('name', "Please enter your name").not().isEmpty(),
    check('email', "Please enter your email").isEmail(),
    check('password', "Please enter a password with at least 6 characters").isLength({min: 6})
], async(req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    } else {
        const { name, email, password } = req.body;

        try {
            //Check if User exits
            let user = await User.findOne({email: email});
            if (user) {
                return res
                    .status(400)
                    .json({errors: [{ msg: "User already exists"}]});
            }

            //Create a new user
            user = new User({
                name: name,
                email: email,
                password: password
            });

            //Encrypt the password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            //Save to the db and return
            await user.save();
            res.send("User successfully registered");
        }
        catch(error) {
            res.status(500).send("Server error");
        }
    }
});

const port = 5000; //Number of port to connect to

//Connection listener
app.listen(port, () => console.log(`Express server running on port ${port}`));