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
  const { minPrice, maxPrice, minBeds, minBaths} = req.query;

  let query = "SELECT * FROM Listings WHERE 1=1";
  const params = [];

  if (minPrice) {
    query += " AND Pricing >= ?";
    params.push(minPrice);
  }

  if (maxPrice) {
    query += " AND Pricing <= ?";
    params.push(maxPrice);
  }

  if (minBeds) {
    query += " AND Bed >= ?";
    params.push(minBeds);
  }

  if (minBaths) {
    query += " AND Bath >= ?";
    params.push(minBaths);
  }

 

  try {
    const rentals = await db.all(query, params);

    const rentalsWithImage = await Promise.all(
      rentals.map(async (rental) => {
        const image = await db.get(
          "SELECT ImageURL FROM ApartmentImage WHERE ApartmentID = ? LIMIT 1",
          [rental.ApartmentID]
        );

    return {
          ...rental,
          Img: image ? image.ImageURL : null,
        };
      })
    );
    console.log(rentalsWithImage);
    res.json(rentalsWithImage);
  } catch (error) {
    console.error("Error fetching filtered rentals:", error);
    res.status(500).json({ error: "Failed to fetch rentals" });
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
  const { email, password } = req.body;

  try {
    const user = await db.get(
      "SELECT * FROM SignUp WHERE Email = ?",
      [email]
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid username" });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.Username, 
        email: user.Email }
        
    });
    console.log("User logged in:", user.Email, user.Username, user.id);

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
    const images = await db.all("SELECT ImageURL FROM ApartmentImage WHERE ApartmentID = ?", [id]);
    const descriptions = await db.all("SELECT Description FROM ApartmentImage WHERE ApartmentID = ?", [id]);
    console.log("Images:", images); // 👈 log image rows
    console.log("Descriptions:", descriptions); // 👈 log description rows

    // Combine into one object
    const rentalWithImages = {
      ...rental,
      Img: images || [],
      Des: descriptions || []
    };

    console.log("Final combined object:", rentalWithImages); // 👈 optional, for verification
    res.json(rentalWithImages);
  } catch (error) {
    console.error("Error fetching rental details:", error);
    res.status(500).json({ error: "Failed to fetch rental details" });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
