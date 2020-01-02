const express = require('express');
const multer = require("multer");
const path = require("path");
var router = express.Router();

// Set Storage Engine
const storage = multer.diskStorage({
    destination: "./public/images/uploads/",
    filename: function (req, file, cb){
        var filename = file.originalname + '-' + Date.now() + path.extname(file.originalname);
        cb(null, filename);
        req.session.imgName = filename;
    }
  });

  // Init Upload
const upload = multer({
    storage:storage,
    limits: {filesize: 1000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('myImage');

function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname){
        return cb(null, true);
    }
    else{
        cb('Error: Images Only!');
    }
}

// router.post("/upload",(req, res) => {
//     upload(req,res, (err) => {
//         if(err){
//             res.send(err);
//         }
//         else{
//             if (req.file == undefined){
//                 res.send('Error: No File Selected!');
//             }
//             else {
//                 res.send('File Uploaded!');
//             }
//         }
//     });
// });


router.post("/imgPath",(req, res) => {
    var id = req.body.id;
    var ObjectId = require('mongoose').Types.ObjectId;
    MS_ROJAK.collection.findOneAndUpdate({_id: ObjectId(id)}, {$set:{'imgpath': req.session.imgName }}, {new: true}, (err, doc) => {
        if (doc != null){
            res.send('Success!');
        }
        else{
            res.send('Fail to store image name!');
        }
    });
});

module.exports = router;