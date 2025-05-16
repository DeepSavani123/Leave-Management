require('dotenv').config();
require('./config/dbConnect.js');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./routes');
const app = express();
const port  = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
        withCredentials: true
    }
));
app.use('/image', express.static('public'));
app.use('/api', router);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})