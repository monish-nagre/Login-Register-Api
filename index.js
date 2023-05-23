
const express = require('express');
const axios = require('axios');
const mongoose =  require("mongoose");
const bcrypt = require('bcryptjs');
const app = express();
const port = 3001;

// database ------
const uri = "mongodb+srv://monishnagre2203:monu123@cluster0.ysjk6ig.mongodb.net/"

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("connected to db");
  } catch {
    console.log("error");
  }
}
connect()

// database end 

// Define a schema for the user collection
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

// Create a user model based on the schema
const User = mongoose.model('User', userSchema);

// Middleware to parse JSON requests
app.use(express.json());

app.get('/check', (req, res) => {
  // console.log("working");
  res.json(
    "hello"
  )
})

// POST /register route for user registration
app.post('/register', (req, res) => {
  let { name, email, password } = req.body;

   // Convert email to lowercase
   email = email.toLowerCase();

  User.findOne({email}) 
    .then(userEmail => {
      if(userEmail) {
        return res.json('User email already exists');
      }
   else {
  // Hash the password
  bcrypt.hash(password, 10)
    .then((hashedPassword) => {
      // Create a new user instance
      const user = new User({ name, email, password: hashedPassword });

      // Save the user to the database
      user.save()
        .then(() => res.json('User registered successfully'))
        .catch(error => res.status(500).json('Failed to register user'));
    })
    .catch(error => res.status(500).json('Failed to hash password'));
  }
  }) 
});

// POST /login route for user login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  User.findOne({ email })
    .then(user => {
      if (!user) {
        // User not found
        return res.status(404).json('User not found');
      }

      // Compare the entered password with the hashed password in the database
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            // Passwords match, login successful
            return res.json('Login successful');
          } else {
            // Passwords do not match
            return res.status(401).json('Incorrect password');
          }
        })
        .catch(error => res.status(500).json('Failed to compare passwords'));
    })
    .catch(error => res.status(500).json('Failed to find user'));
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
