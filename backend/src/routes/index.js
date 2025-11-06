import express from "express";
import helloRouter from "./hello.route.js";
import mediaRouter from "./media.route.js";
import shareLinkRouter from "./shareLink.route.js";

const router = express.Router();

router.use("/hello", helloRouter);
router.use("/media", mediaRouter);
router.use("/", shareLinkRouter);

export default router;
