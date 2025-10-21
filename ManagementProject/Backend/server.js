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

app.post('/signup', async (req, res) => {
	try{ 
		const { name, email, password } = req.body;
		console.log(name, email, password)
		const result = await db.run(
		"INSERT INTO SignUp (Username, Email , Password) VALUES (?, ?, ?)", [name, email, password]);
    	res.json({ message: "User registered!", userId: result.lastID });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error inserting into database" });
  }
});

app.get('/login', async (req, res) => {
	const {username1, password1} = req.body;
	try{
		const user = await db.get("SELECT Username, Password FROM SignUp WHERE Username = ? ",  [username1]);
		if (!user){
			return res.json({message: "Invalid Username"});
		}
	}catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'Failed to fetch data' });
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
