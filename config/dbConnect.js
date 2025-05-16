const mongoose = require('mongoose');

const { MONGODB_URL } = process.env
mongoose.connect(MONGODB_URL).then(() => {
    console.log('Database Connected!');
}).catch((err) => { console.log(err) });