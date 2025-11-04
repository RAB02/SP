const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors  = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { verifyAdmin, verifyAdminStatus } = require('./middleware/authAdmin.js');
const SECRET_KEY = 'SECRET_KEY';

PORT=8080;

// connect to db
let db;
(async () => {
	db = await open({
		filename: './db/Management_Data.db',
		driver: sqlite3.Database
	});
})();
app = express();
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }
));
app.use(cookieParser());

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

    const token = jwt.sign(
      {
        id: user.id,
        email: user.Email,
        username: user.Username,
        role: 'user',
      },
      SECRET_KEY,
      { expiresIn: '1h' } // expires in 1 hour
    );

    res.cookie('userToken', token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

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

app.get('/verify', (req, res) => {
  const token = req.cookies?.userToken;
  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({
      loggedIn: true,
      user: { id: decoded.id, email: decoded.email, username: decoded.username },
    });
  } catch (err) {
    res.status(401).json({ loggedIn: false });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('userToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });
  res.json({ success: true, message: 'User logged out' });
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

// ✅ Admin login route
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await db.get('SELECT * FROM admin WHERE email = ?', [email]);
    if (!admin) return res.status(400).json({ error: 'Invalid admin username' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    // ✅ Set cookie
    res.cookie('adminToken', token, {
      httpOnly: true, 
      secure: false, 
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Admin login successful',
      admin: { id: admin.id, email: admin.email },
    });

    console.log('✅ Admin logged in:', admin.email);
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/admin/logout', (req, res) => {
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: false,   
    sameSite: 'lax'
  });
  res.json({ success: true, message: 'Admin logged out' });
});

app.get('/admin/verify', verifyAdminStatus);

app.get('/admin/dashboard', verifyAdmin, async (req, res) => {
  try {
    const apartments = await db.get('SELECT COUNT(*) AS count FROM Listings');
    const users = await db.get('SELECT COUNT(*) AS count FROM SignUp');
    console.log('Parsed admin dashboard response:', apartments, users)


    res.json({
      apartmentCount: apartments.count,
      userCount: users.count,
      adminEmail: req.admin.email,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
