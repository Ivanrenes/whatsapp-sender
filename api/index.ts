import express from "express";
import cors from 'cors'
import wppRouter from "./routers/wpp";

const app = express();

app.use(cors());

app.use("/api/wpp", wppRouter);


app.get("/", (req, res) => res.send("Ready to use!"));


app.listen(8081, () => console.log("Server ready on port 8081."));

module.exports = app;