"use strict";

const router = require("express").Router();
const ctrl   = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

router.post("/login",   ctrl.login);
router.get("/me",       requireAuth, ctrl.me);
router.get("/verify",   requireAuth, ctrl.verify);
router.post("/logout",  requireAuth, ctrl.logout);

module.exports = router;
