const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors  = require('cors');


PORT=8080;

// connect to db
let db;
(async () => {
	db = await open({
		filename: 'Management_Data.db',
		driver: sqlite3.Database
	});
})();

app = express();
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(cors());

app.get('/rentals', async (req, res) => {
	try {
		const all_data = await db.all(" SELECT * FROM Listings"); 
        const rentals = [];
		// const rentalsMap = {};

		// all_data.forEach(row => {
		// 	if (!rentalsMap[row.id]) {  // Assuming `id` is a unique identifier
        //         rentalsMap[row.id] = { ...row }; // Store unique listings
        //         rentals.push(rentalsMap[row.id]);
        //     }
        // });
		rentals.push(all_data);
		res.json(all_data);   
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

const bcrypt = require('bcrypt');

app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      "INSERT INTO SignUp (Username, Email, Password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.json({ message: "User registered successfully!", userId: result.lastID });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error inserting into database" });
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.get(
      "SELECT * FROM SignUp WHERE Username = ?",
      [username]
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid username" });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Optional: You can generate a session token or JWT later
    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.Username, email: user.Email }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


	app.get('/rentals/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const rental = await db.get("SELECT * FROM Listings WHERE ApartmentID = ?", [id]);

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    res.json(rental);
  } catch (error) {
    console.error('Error fetching rental by ID:', error);
    res.status(500).json({ error: 'Failed to fetch rental' });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
