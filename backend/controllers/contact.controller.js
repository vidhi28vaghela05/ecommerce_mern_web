const Contact = require("../models/contact.model");

// POST /api/contact — submit a contact message
exports.submit = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const contact = await Contact.create({ name, email, message });
    res.status(201).json({ message: "Message sent successfully.", contact });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/contacts — admin view all messages
exports.list = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ contacts });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/contacts/:id/status — mark as read/replied
exports.updateStatus = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: "Not found." });
    res.json({ contact });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/contacts/:id
exports.remove = async (req, res, next) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted." });
  } catch (err) {
    next(err);
  }
};
