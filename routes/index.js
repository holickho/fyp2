const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parse');
const TransText = require('../models/translate.model');


// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user,
    layout: 'mainLayout',
  })
);

// Translate
router.get('/translate', ensureAuthenticated, (req, res) =>
  res.render('translate', {
    user: req.user,
    layout: 'mainLayout',
  })
);

// Manage Corpus
router.get('/corpus', ensureAuthenticated, (req, res) =>
  TransText.find({}, function(err, allDetails){
    if(err) {
        console.log('/getcorpus err: ', err);
    } else {
      res.render('corpus', {
        details: allDetails,
        user: req.user,
        layout: 'mainLayout',
      })
      console.log('/getcorpus DOWNLOADED!!');
    }
  })
);

router.get("/",(req, res) => {
  getCorpus(req, res);
});


function getCorpus(req, res){
  
}

// Option
router.get('/option', ensureAuthenticated, (req, res) =>
  res.render('option', {
    user: req.user,
    layout: 'mainPage',
  })
);

// Result
router.get('/result', ensureAuthenticated, (req, res) =>
  res.render('result', {
    user: req.user,
    layout: 'mainPage',
  })
);

//Upload File (Final)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../fyp/views/upload')
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, `${file.originalname}`)
  }
})

const upload = multer({ storage: storage })

router.get('/uploadFile', (req,res)=>{
  res.render('uploadFile');
})
// Uploading single file
router.post('/uploadfile', upload.single('file'), (req, res, next) => {
  const file = req.file
  if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
  }
});

//redirect to sentiment page
router.get('/sentiment', (req, res) => {
  res.render('sentiment');
});

// Main Pages
router.get('/mainPage', ensureAuthenticated, (req, res) =>
  res.render('mainPage.ejs', {
    user: req.user,
    layout: 'mainLayout',
  })
);


module.exports = router;
