const express = require('express');
const path = require('path');
const cors = require('cors'); // Import the cors middleware

const app = express();
const PORT = process.env.PORT || 5000;

// Use cors middleware to enable Cross-Origin Resource Sharing
app.use(cors());

// Serve Bootstrap CSS from node_modules
app.use('/css/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
//May need to serve the JavaScript files similarly - not sure if this is necessary, need testing
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});