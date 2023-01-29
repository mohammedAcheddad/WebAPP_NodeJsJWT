const mongoose = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const { UserRouter } = require("./routes/users");
const { memosRouter } = require("./routes/memos");

// Connect to MongoDB Atlas
mongoose
.connect(
"mongodb+srv://icemed700:tcYUr8l87NHkwVuS@testnode.qe06emk.mongodb.net/?retryWrites=true&w=majority"
)
.then(() => console.log("Connected to MongoDB Atlas"))
.catch((err) => console.log(err));

// Initialize Express app
const app = express();

// Serve static files
app.use(express.static("./public"));

// Middleware to parse JSON data in the request body
app.use(express.json());

app.use("/favicon.ico", (req, res) => {
    res.status(204).end();
  });

app.use("/users", UserRouter);
// Use JWT for authentication
app.use((req,res,next)=>{
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token,"SECRET");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({message: "Unauthorized"});
    }
})

app.use("/memos", memosRouter);

// Listen on port 30000
const port = 30000;
app.listen(port, () => {
console.log("Server listening on port: ", port);
});