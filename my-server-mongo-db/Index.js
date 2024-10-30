const express = require("express");
const app = express();
const port = 3002;
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ObjectId } = require("mongodb");

var session = require("express-session");
app.use(session({ secret: "Shh, its a secret!" }));

app.use(morgan("combined"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
    cors({
        origin: "http://localhost:4200",
        credentials: true,
    })
);
app.use(cookieParser());

const client = new MongoClient("mongodb://127.0.0.1:27017");

const database = client.db("FashionData");
const fashionCollection = database.collection("Fashion");
const userCollection = database.collection("User");

app.listen(port, () => {
    console.log(`My Server listening on port ${port}`);
});

app.get("/", (req, res) => {
    res.send("This Web server is processed for MongoDB");
});

// API lấy danh sách thời trang
app.get("/fashions", async (req, res) => {
    const result = await fashionCollection.find({}).toArray();
    res.send(result);
});

// API lấy thời trang theo ID
app.get("/fashions/:id", async (req, res) => {
    var o_id = new ObjectId(req.params["id"]);
    const result = await fashionCollection.find({ _id: o_id }).toArray();
    res.send(result[0]);
});

// API thêm thời trang
app.post("/fashions", async (req, res) => {
    await fashionCollection.insertOne(req.body);
    res.send(req.body);
});

// API Đăng nhập
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(400)
            .send({ message: "Username and password are required" });
    }

    try {
        const user = await userCollection.findOne({ username, password });
        if (user) {
            // Lưu cả username và mật khẩu vào cookie
            res.cookie("username", username, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
            res.cookie("password", password, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
            });

            res.send({ message: "Login successful" });
        } else {
            res.status(401).send({ message: "Invalid username or password" });
        }
    } catch (error) {
        res.status(500).send({ message: "Error logging in", error });
    }
});

// API lấy thông tin đăng nhập từ cookie
app.get("/get-login-info", (req, res) => {
    const username = req.cookies.username || "";
    const password = req.cookies.password || "";

    if (username && password) {
        res.send({
            username: username,
            password: password,
            message: "Login information retrieved from cookie",
        });
    } else {
        res.send({
            username: "",
            password: "",
            message: "No login information found in cookies",
        });
    }
});

// API Đăng xuất, xóa cookie
app.post("/logout", (req, res) => {
    res.clearCookie("username");
    res.clearCookie("password");
    res.send({ message: "Logged out successfully" });
});

app.get("/contact", cors(), (req, res) => {
    if (req.session.visited != null) {
        req.session.visited++;
        res.send("You visited this page " + req.session.visited + " times");
    } else {
        req.session.visited = 1;
        res.send("Welcome to this page for the first time!");
    }
});
