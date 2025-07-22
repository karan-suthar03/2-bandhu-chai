import 'dotenv/config';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import errorHandler from "./middlewares/errors/errorHandler.js";

const app = express();
import productsRouter from "./routes/productsRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'bandhu-chai-guest-cart-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 48 * 60 * 60 * 1000
    },
    name: 'bandhu.cart.sid'
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use((req,res,next)=>{
    setTimeout(()=>{
        next()
    }, 2000)
})

app.use((req,res,next)=>{
    console.log("Request:", req.method, req.path, req.body);
    if (req.path.startsWith('/cart')) {
        console.log("Cart request - Session ID:", req.sessionID);
        console.log("Current cart:", req.session.cart);
    }
    next();
})

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
