import express from "express";

import {getQR, getIsClientReady} from "../controllers/wpp";

const router = express.Router();

router.get("/auth", async (req, res) => {
    try {
      const qrStream = await getQR();

      return qrStream.pipe(res);
    } catch (error) {
      res.status(500)
    }
});

export default router;