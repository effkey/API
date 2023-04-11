// const jsonServer = require('json-server')
// const cors = require('cors')
// const path = require('path')

// const server = jsonServer.create()
// // const router = jsonServer.router(path.join(__dirname, 'db.json'))
// const fs = require('fs')
// const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json')))
// const router = jsonServer.router(db)

// const middlewares = jsonServer.defaults()

// server.use(cors())
// server.use(jsonServer.bodyParser)
// server.use(middlewares)
// server.use(router)

// const PORT = 8000

// server.listen(PORT, () => {
//   console.log(`JSON Server is running on http://localhost:${PORT}`)
// })

const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const dbFilePath = path.join(__dirname, 'db.json');

// Use JSON Server default middlewares (e.g. logger, static, cors and no-cache)
server.use(middlewares);

// Use CORS
server.use(cors());

// Use JSON Server body parser middleware
server.use(jsonServer.bodyParser);

// Load database file
const db = JSON.parse(fs.readFileSync(dbFilePath));

// Save database file after each change
function saveDatabase() {
  fs.writeFileSync(dbFilePath, JSON.stringify(db));
}

// POST - Add new data to the database
server.post('/data', (req, res) => {
  const data = req.body;

  // Generate unique ID
  const ids = db.data.map(d => d.id);
  const maxId = Math.max(...ids);
  const newId = maxId >= 0 ? maxId + 1 : 0;
  data.id = newId;

  // Validate data
  if (!data.name || !data.value) {
    res.status(400).json({ error: 'Name and value are required' });
    return;
  }

  // Add data to database
  db.data.push(data);

  // Save database and return response
  saveDatabase();
  res.json(data);
});

// PUT - Update existing data in the database
server.put('/data/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  // Find data by ID
  const index = db.data.findIndex(d => d.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Data not found' });
    return;
  }

  // Validate data
  if (!data.name || !data.value) {
    res.status(400).json({ error: 'Name and value are required' });
    return;
  }

  // Update data in database
  db.data[index] = { ...db.data[index], ...data };

  // Save database and return response
  saveDatabase();
  res.json(db.data[index]);
});

// DELETE - Remove existing data from the database
server.delete('/data/:id', (req, res) => {
  const id = parseInt(req.params.id);

  // Find data by ID
  const index = db.data.findIndex(d => d.id === id);
  if (index === -
