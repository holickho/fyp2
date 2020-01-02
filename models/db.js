// dbPassword = 'mongodb+srv://hewsan:6271138san@cluster0-yfhzn.mongodb.net/test';

// module.exports = {
//     mongoURI: dbPassword
// };

//request statement from Mongoose
const mongoose = require('mongoose');

//connect to MongoDB 
mongoose.connect('mongodb://localhost:27017/SentimentAnalysisDB', { useNewUrlParser: true }, (err) => {
    if (!err)
        console.log('MongoDB connection succeeded.');
    else
        console.log('Error in DB connection : ' + err);
});

//add a request statement for user model
require('./user.model');
require('./translate.model');



