import 'dotenv/config';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
import productsRouter from "./routes/productsRoute.js";

app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use((req,res,next)=>{
    console.log("Request:", req.method, req.path,req.body);
    next();
})

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use('/products', productsRouter);

export default app;
