import express from 'express';
import {check, validationResult} from 'express-validator';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';

import connectDatabase from "./config/db";
import User from './models/User';
import auth from './middleware/auth';
import Post from "./models/Post";

//Initialize express application
const app = express();

//Connect database
connectDatabase();

//Configure middleware
app.use(express.json({extended: false}));
app.use(cors({
    origin: "http://localhost:3000"
}));

//GET endpoints
//API endpoints
/*
    @route GET /
    @desc Test Endpoint
*/ 
app.get('/', (req, res) => 
    res.send('http get request sent to root api endpoint')
);

/*
    @route GET /api/auth
    @desc Authenticate user
*/
app.get("/api/auth", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send("Unknown server error.");
    }
});

/*
    @route GET api/posts
    @desc Get posts
*/
app.get("/api/posts", auth, async(req, res) => {
    try {
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    } catch(error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

//POST endpoints
/*
    @route POST api/login
    @desc Login user
*/
app.post('/api/login', [
    check('email', "Please enter a valid email").isEmail(),
    check('password', "A password is required!").exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } else {
        const { email, password } = req.body;

        try {
            //Check if User exits
            let user = await User.findOne({ email: email });
            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Invaild email or password!" }] });
            }

            //Check password
            const match = await bcrypt.compare(password, user.password);
            if(!match) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Invaild email or password!" }] });
            }

            //Generate and return JWT token
            returnToken(user,res);
        }
        catch (error) {
            res.status(500).send("Server error");
        }
    }
});

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
            
            //Generate and return JWT token
            returnToken(user, res);
        }
        catch(error) {
            res.status(500).send("Server error");
        }
    }
});

/*
    @route POST api/posts
    @desc Create Post
*/
app.post("/api/posts", auth, 
        [
            check("title", "Title text is required!")
                .not()
                .isEmpty(),
            check("body", "Body test is required!")
                .not()
                .isEmpty()
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
            } else {
              const { title, body } = req.body;

              try {
                //Get the user who created the post
                const user = await User.findById(req.user.id);

                //Create a new post
                const post = new Post({
                  user: user.id,
                  title: title,
                  body: body
                });

                //Save to the db and return
                await post.save();

                res.json(post);
              } catch (error) {
                res.status(500).send("Server error");
              }
            }
        }
    );

const returnToken = (user, res) => {
    const payload = {
        user: {
            id: user.id
        }
    };

    jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: "10hr" },
        (err, token) => {
            if (err) throw err;
            res.json({ token: token });
        }
    )
};

const port = 5000; //Number of port to connect to

//Connection listener
app.listen(port, () => console.log(`Express server running on port ${port}`));