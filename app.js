import 'dotenv/config';
import express from "express";
import morgan from "morgan";
import cors from "cors";

import bucketRoutes from "./routes/bucket.routes.js";
import presignRoutes from "./routes/presigned.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api", bucketRoutes);
app.use("/api/presigned/", presignRoutes)

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`[Server] running on port ${PORT}`);
});