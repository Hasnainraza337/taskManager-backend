const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");

router.post("/create-contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contactData = { name, email, message };
    contactData.id =
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

    const contact = new Contact(contactData);
    await contact.save();

    res.status(201).json({
      message:
        "Thank you! Your message has been sent successfully. Our team will contact you soon.",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error , Try Again" });
  }
});

router.get("/get-contacts", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error , Try Again" });
  }
});

router.delete("/delete-contact/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findOneAndDelete({ id });
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error , Try Again" });
  }
});

module.exports = router;
