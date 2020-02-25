const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cors = require('cors');

const fansRouter = require('./routers/fans_router')
const PORT = 3000;
const app = express();
app.use(cors());
app.use(express.static(__dirname));
app.use(express.static('./html', { index: 'home.html' }))
app.use(bodyParser.json());
app.use("/fanPost", fansRouter);
async function start() {
    try {
        await mongoose.connect('mongodb+srv://vovan:qwerty12345@cluster0-wqz4o.mongodb.net/todos?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => {
            console.log(`Server has been started`);

        });

    } catch (error) {
        console.log(error);
    }
}
start();
const db = mongoose.connection;
db.once('open', () => console.log('Database connection established'));
db.on('error', (error) => console.error(error));