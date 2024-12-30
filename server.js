import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000", // Update with your front-end URL
    credentials: true,
}));

const secret = "your_secret_key";

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "yourpassword", // Use your actual password here
    database: "agro_market"
});

db.connect((err) => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

// Serve static files from the "public" directory
app.use(express.static(path.join(process.cwd(), "public")));

// Root route to serve the main page (index.html)
app.get("/", (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});

// Register route
app.post("/register", async (req, res) => {
    const { name, dob, email, password } = req.body;

    // Check if email already exists
    const checkEmailSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkEmailSql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Error checking email" });
        if (results.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (name, dob, email, password) VALUES (?, ?, ?, ?)";
        db.query(sql, [name, dob, email, hashedPassword], (err) => {
            if (err) return res.status(500).json({ error: "Registration failed" });
            res.status(201).json({ message: "User registered successfully" });
        });
    });
});

// Login route
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: "User not found" });

        const user = results[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id }, secret, { expiresIn: "1h" });
        res.cookie("authToken", token, { httpOnly: true }).json({ message: "Login successful" });
    });
});

// Logout route
app.post("/logout", (req, res) => {
    res.clearCookie("authToken").json({ message: "Logged out successfully" });
});

// Middleware to protect routes requiring authentication
const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) return res.status(403).json({ error: "Access denied" });

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.userId = decoded.id;
        next();
    });
};

// Protected route example: Get user profile
app.get("/profile", verifyToken, (req, res) => {
    const sql = "SELECT * FROM users WHERE id = ?";
    db.query(sql, [req.userId], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: "User not found" });

        const user = results[0];
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            dob: user.dob
        });
    });
});

// Start the server
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});

// Check login state
app.get("/check-login", verifyToken, (req, res) => {
 res.json({ loggedIn: true }); // User is logged in
});

// If no valid token, return loggedIn as false
app.get("/check-login", (req, res) => {
 res.json({ loggedIn: false }); // User is not logged in
});

app.post('/api/create-listing', verifyToken, (req, res) => {
    const { listingType, title, price, location, image } = req.body;

    if (!listingType || !title || !price || !location || !image) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = `INSERT INTO products (user_id, type, title, price, location, image) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [req.userId, listingType, title, price, location, image];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to create listing" });
        }
        res.status(201).json({ message: "Listing created successfully" });
    });
});

app.get("/api/products", verifyToken, (req, res) => {
    let { type, priceMin, priceMax } = req.query;

    // Start the base SQL query to fetch products
    let sql = `
        SELECT products.*, users.name AS user_name
        FROM products
        LEFT JOIN users ON products.user_id = users.id
        WHERE products.user_id = ?;
    `;

    let queryParams = [req.userId]; // Ensure that we're fetching products only for the logged-in user

    // Add filtering based on type, priceMin, and priceMax if provided
    if (type) {
        sql += " AND type = ?";
        queryParams.push(type);
    }
    if (priceMin) {
        sql += " AND price >= ?";
        queryParams.push(parseFloat(priceMin));
    }
    if (priceMax) {
        sql += " AND price <= ?";
        queryParams.push(parseFloat(priceMax));
    }

    console.log("SQL query being executed: ", sql); // Log SQL query for debugging
    console.log("Query parameters:", queryParams); // Log query parameters

    // Execute the query
    db.query(sql, queryParams, (err, results) => {
        if (err) {
            console.error("Database error:", err); // Log the full error
            return res.status(500).json({ error: "Error fetching products" });
        }

        console.log('Results:', results); // Log the results to check user_name
        res.json(results); // Send back the products with user names
    });
});

app.get("/api/allproducts", (req, res) => {
    // Start the base SQL query to fetch all products
    let sql = `
        SELECT products.*, users.name AS user_name
        FROM products
        LEFT JOIN users ON products.user_id = users.id;
    `;

    // Execute the query
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err); // Log the full error
            return res.status(500).json({ error: "Error fetching products" });
        }

        console.log('Results:', results); // Log the results to check user_name
        res.json(results); // Send back all products with user names
    });
});


// Add this route to handle updating the user's name
app.post('/update-name', verifyToken, (req, res) => {
    const { newName } = req.body;

    if (!newName) {
        return res.status(400).json({ error: "Name is required" });
    }

    const sql = "UPDATE users SET name = ? WHERE id = ?";
    db.query(sql, [newName, req.userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to update name" });
        }
        res.json({ message: "Name updated successfully" });
    });
});


