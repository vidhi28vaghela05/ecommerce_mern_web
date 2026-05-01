const express = require("express");
const contactController = require("../../controllers/contact.controller");

const router = express.Router();

// Public route — anyone can submit a contact message
router.post("/", contactController.submit);

module.exports = router;
