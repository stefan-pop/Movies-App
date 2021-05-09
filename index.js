const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();


app.listen(8080, () => {
    console.log('Server running');
})