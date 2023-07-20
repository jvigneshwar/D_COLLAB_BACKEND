const express = require("express");
const mongoose = require("mongoose");
const User = require('./models/userSchema');
const cors = require("cors");
const fs = require("fs");
const jwt = require('jsonwebtoken');
const Post = require("./models/postSchema");
const Suggest = require("./models/suggestSchema");
const cloudinary = require("cloudinary");

const app = express();
app.use(cors());

app.use(express.json({ limit: '10mb' }));

mongoose.set("strictQuery", true)
mongoose.connect("mongodb+srv://cg:ASas12.,@cluster0.0bv09xe.mongodb.net/?retryWrites=true&w=majority")
    .then(() => {
        app.listen(4000, () => {
            console.log("listerning to port 4000");
        });
    })
    .catch(e => console.log("db not connected\n" + e.message));

cloudinary.config({
    cloud_name: 'dqwfvbure',
    api_key: '962853429899996',
    api_secret: 'TmoVSB3haO9qS5-cpmykjuDW18M'
});

// -----------------------------------------------------------------------------------------

app.get("/", (req, res) => {
    res.send("connected");
})

// -----------------------------------------------------------------------------------------

app.post("/api/register", async (req, res) => {
    try {
        const user = await User.create({
            username: req.body.username,
            userimg: req.body.userImg,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })
        res.json({ status: "ok" });
    }
    catch (err) {
        res.json({ status: "failed", error: "Duplicate mailid" });
    }
})

// -----------------------------------------------------------------------------------------

app.post("/api/login", async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.body.username,
            password: req.body.password
        })
        if (user) {
            const token = jwt.sign({
                username: user.username,
                email: user.email
            }, 'ASas12.,')
            res.json({ status: "ok", user: token });
        }
        else {
            res.json({ status: "failed", user: false })
        }
    }
    catch (err) {
        res.json({ status: "failed", user: false })
    }
})

// -----------------------------------------------------------------------------------------

app.get("/api/home", async (req, res) => {
    const token = req.headers['x-access-token'];
    try {
        const decode = jwt.verify(token, 'ASas12.,')
        const posts = await Post.find({}, '_id imageName imageUrl author').populate('author', 'userimg');
        const user = await User.find({}, { "username": 1, "userimg": 1 })
        res.json({ status: "ok", posts, user });
    }
    catch (err) {
        res.json({ status: "failed" });
    }
})

// -----------------------------------------------------------------------------------------

app.get("/api/profile", async (req, res) => {
    const token = req.headers['x-access-token'];
    try {
        const decode = jwt.verify(token, 'ASas12.,')
        const user = await User.findOne({ username: decode.username }).populate('posts', 'imageUrl')
        // console.log(user);
        res.json({
            status: "ok",
            username: user.username,
            userImg: user.userimg,
            posts: user.posts
        });
    }
    catch (err) {
        res.json({ status: "failed" });
    }
})

// -----------------------------------------------------------------------------------------

app.post('/api/upload', async (req, res, next) => {
    const { image, username } = req.body;
    try {
        const result = await cloudinary.v2.uploader.upload(image, {
            folder: 'dcollabPosts'
        })
        const user = await User.findOne({ username: username })
        const post = new Post({
            imageName: result.public_id,
            imageUrl: result.secure_url,
            author: user._id,
            rating: 0,
            ratingCount: 0,
            Suggestions: []
        })
        const savedPost = await post.save();
        user.posts.push(savedPost._id);
        await user.save();
        res.json({ status: "ok" })
    }
    catch (err) {
        res.json({ status: "failed" });
    }
});

// -----------------------------------------------------------------------------------------

app.get("/images/:imageName", (req, res) => {
    const imagename = req.params.imageName;
    const path = "uploads/" + imagename;
    if (fs.existsSync(path)) {
        const readStream = fs.createReadStream(path);
        readStream.pipe(res);
    }
    else {
        res.send("<center><h1>404 Not Found</h1></center>");
    }
})

// -----------------------------------------------------------------------------------------

app.get("/post/:postid", async (req, res) => {
    try {
        const post = await Post.findById(req.params.postid, 'imageName imageUrl author rating ratingCount Suggestions')
            .populate('author', 'username userimg')
            .populate('Suggestions')
        res.json(post);
    }
    catch {
        res.json({ status: "failed" });
    }
})

// -----------------------------------------------------------------------------------------

app.post("/postSuggest", async (req, res) => {
    try {
        const decode = jwt.verify(req.headers['x-access-token'], 'ASas12.,')
        const suggest = new Suggest({
            suggestBody: req.body.suggestBody,
            author: decode.username,
            rectangle: req.body.rectangle
        })
        await suggest.save();
        const post = await Post.findById(req.body.postId);
        post.Suggestions.push(suggest._id)
        await post.save();
        res.json({ status: "ok" });
    }
    catch (err) {
        res.json({ status: "failed" });
    }
})

// -----------------------------------------------------------------------------------------

app.get("/searchUser", (req, res) => {
    try {
        const username = req.query.q;
        if (!username || username.trim() === '') {
            return res.json([]);
        }
        User.find({ username: new RegExp(username, 'i') }, { "username": 1, "userimg": 1, _id: 1 })
            .then(data => {
                res.json(data)
            })
            .catch(err => console.log(err));
    }
    catch (err) {
        res.json({ status: "failed" });
    }
})

// -----------------------------------------------------------------------------------------

app.post("/postRating", async (req, res) => {
    try {
        let post = await Post.findById(req.body.id);
        post.rating = post.rating + parseInt(req.body.rating);
        post.ratingCount = post.ratingCount + 1;
        const savedPost = await post.save()
        res.json({ status: "ok", savedPost })
    }
    catch (err) {
        res.json({ status: "failed" });
    }
})

// -----------------------------------------------------------------------------------------

app.get("/profileView/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId, { "username": 1, "userimg": 1, "posts": 1 }).populate('posts', 'imageName')
        res.json({ status: "ok", user })
    }
    catch (err) {
        res.json({ status: "failed" });
    }
})

// -----------------------------------------------------------------------------------------

app.get("/api/loogedin", async (req, res) => {
    const token = req.headers['x-access-token'];
    try {
        const decode = jwt.verify(token, 'ASas12.,')
        // console.log(decode);
        res.json({ status: "ok" });
    }
    catch (err) {
        res.json({ status: "failed" });
    }
})

// -----------------------------------------------------------------------------------------


app.use((req, res) => {
    res.status(404)
    res.send("<center><h1>404 Not Found</h1></center>");
})


