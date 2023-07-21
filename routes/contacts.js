const express = require("express");
const router = express.Router();
const Contacts = require("../models/Contacts");
const fetchuser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

// ROUTE GET 1 : Fetching all contacts using "./api/contacts/allcontacts". Login Required.
router.get("/allcontacts", fetchuser, async (req, res) => {
  try {
    // Getting all the contacts of the user using the id.
    const contacts = await Contacts.find({ user: req.user.id });
    res.json(contacts);
  } catch (error) {
    res.status(500).send("internal server error.");
  }
});

// ROUTER POST 1 : Create a new contact using "/api/contacts/addcontact". Login Required.
router.post(
  "/addcontact",
  fetchuser,
  [
    body("number", "Number should be atleast 10 characters").isLength({
      min: 10,
    }),
  ],
  async (req, res) => {
    const { name, number } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    // Create a new contact and save it.
    try {
      const contact = new Contacts({
        name,
        number,
        user: req.user.id,
      });
      const saveContact = await contact.save();
      res.json(saveContact);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

//ROUTER PUT 1 : Update the contact using "/api/contacts/updatecontact". Login Required.
router.put("/updatecontact/:id", fetchuser, async (req, res) => {
  // Getting data request from user side.
  const { name, number } = req.body;

  // Creating new empty array contact and saving requested data in it.
  const newContact = {};
  if (name) {
    newContact.name = name;
  }
  if (number) {
    newContact.number = number;
  }

  // Finding the contact from database using the id from params.
  let contact = await Contacts.findById(req.params.id);
  if (!contact) {
    return res.status(404).send("Not found.");
  }

  // Checking the requested user is same in databse contact user.
  if (contact.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed.");
  }

  // Saving the requested data in the same contact from database.
  contact = await Contacts.findByIdAndUpdate(
    req.params.id,
    { $set: newContact },
    { new: true }
  );

  // Sending the new updated contact to the user side.
  res.json(contact);
});

// ROUTER DELETE 1 : Delete a contact from database using "/api/contacts/deletecontact/:id". Login Required.
router.delete("/deletecontact/:id", fetchuser, async (req, res) => {
  try {
    // Getting the contact from database using the id from params.
    let contact = await Contacts.findById(req.params.id);

    // Checking if contact is or not.
    if (!contact) {
      return res.status(404).json({ error: "No contact found with this id." });
    }

    // Deleting the contact from database using the id from params
    contact = await Contacts.findByIdAndDelete(req.params.id);
    // Sending a json file after deleting it.
    res.json({ success: "Contact deleted." });
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});
module.exports = router;
