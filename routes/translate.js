const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
var { TRANSTEXT } = require('../models/translate.model');
var { PythonShell } = require('python-shell');
var filename = "Im here";
var output = "";
/*
//Call Python file "FullTranslate"
router.get('/inputTranslate', (req, res) => {

    const { spawn } = require('child_process');
    const pyProg = spawn('python', ['/FullTranslate-HL.py']);
  
    pyProg.stdout.on('data', function(data) {
  
        console.log(data.toString());
        //res.write(data);
        //res.end('end');
    });
});*/

router.post('/inputTranslate', (req, res) => {
    insertTranslation(req, res);
});

function insertTranslation(req, res){
    var inputText = Buffer.from(req.body.inputText).toString('base64');
    var outputText = output;
    var datetime = new Date();
    var by = req.user;

    runPy("--method 1 --text "+ inputText);
    
    //res.jsonp(full_json[0].length);

    //for (var i = 0; i < full_json[0].length; i++){
    //    runMain(full_json[0][i], full_json[1][i], inputText, outputText, by);
    //}

    // Insert translated sentence
    var new_sentence = new { inputText: inputText, outputText: outputText, datetime: datetime, by: by };

    TRANSTEXT.collection.insertOne(new_sentence, function (err, docs) {
        if (err){ 
            return console.error(err);
        } else {
          console.log("Successfully insert new sentence!");
        }
    });
    /*
    // Update the translations in Rawtext collection
    RAWTEXT.collection.findOneAndUpdate({key1: key1, translations:{$ne: lang}}, {$push:{translations:lang}}, {new: true}, (err, doc) => {
        if (err) {
            console.log("Something wrong when updating data!");
        }
    });
    */
    res.contentType('json');
    res.send({ some: JSON.stringify({response:'json'}) });
}

function runPy(word){
    //return new Promise(async function(resolve, reject){
        let options = {
            mode: 'text',
            pythonPath: './python/hoonglik',
            pythonOptions: ['-u'],
            scriptPath: './python/hoonglik',//Path to your script
            args: [word]//Approach to send JSON as when I tried 'json' in mode I was getting error.
        };
            //await 
            PythonShell.run('FullTranslate-HL.py', options, function (err, results) {
            //On 'results' we get list of strings of all print done in your py scripts sequentially. 
            if (err) throw err;
            console.log('%j', results)
            //results = output;
            //resolve(results[1])//I returned only JSON(Stringified) out of all string I got from py script
        });
   //}).catch(() => { /* do whatever you want here */ });
}

//--method 1 --text "143 is a good ways to express"  --export json --name "result"
//" --export json --name "+ filename +""

module.exports = router;

//function runMain(ori_phrase, trans_phrase, by){
//    return new Promise(async function(resolve, reject){
//        let r =  await runPy(ori_phrase)
//        if (r != 'Not found'){
//            insertPhrase("--method 1 --text "+ ori_phrase);
//        }
//        else{
//            console.log(ori_phrase + " is rejected.");
 //       }
 //   }).catch(() => { /* do whatever you want here */ });
//}
    

  