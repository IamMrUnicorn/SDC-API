const express = require("express");
const path = require("path");
const db = require('./database')

const app = express()

app.use(express.json());


app.get('/users', async (req, res) => {
  try {
    const users = await db.any('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = 3000; // Or any other port number you prefer
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
