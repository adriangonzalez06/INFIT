const express = require("express");
const router = express.Router();
const infogenericdietCtl = require("../controller/infogenericdiet.controller.js");

router.get("/", infogenericdietCtl.getAll);
router.post("/", infogenericdietCtl.create);
router.get("/:id", infogenericdietCtl.getById);
router.put("/:id", infogenericdietCtl.update);
router.delete("/:id", infogenericdietCtl.delete);

module.exports = router;
