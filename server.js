const express = require('express')
const app = express()
app.use(express.static('public')) //serve our files in public statically
console.log('Server running on http://localhost:5000')
app.listen(5000) 