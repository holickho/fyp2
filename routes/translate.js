const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const TransText = require('../models/translate.model');
var { PythonShell } = require('python-shell');

// var d = new Date();
// var datestring = (d.getMonth()+1)  + "/" + d.getDay() + "/" + d.getFullYear();
var datestring = new Date();
var oriText = "";
var preproText = "";
var tag = "";
var translated = "";
var currentuser = '';
var output = "";
var value = 1;
var prevalue = 1;
var classy = 1;

router.post('/inputTranslate', (req, res) => {
    doTranslation(req, res);
});

router.post('/languageOption', (req, res) => {
    languagesOption(req, res);
});

router.post('/PreprocessOption', (req, res) => {
    preprocessOption(req, res);
});

router.post('/ClassifierSelection', (req, res) => {
    classSelection(req, res);
});

router.get('/mainPage', (req,res) => {
    updateFrontEnd(req, res);
});

function classSelection(req, res){
    var classifier = req.body.classSelected;
    console.log(classifier);
    if (classifier == 'SVM'){
        classy = 1;
        console.log('classifier = '+ classifier);
    }
    else if (classifier == 'LR'){
        classy = 2;
        console.log('classifier = '+ classifier);
    }
    else if (classifier == 'NB'){
        classy = 3;
        console.log('classifier = '+ classifier);
    }
    else if (classifier == 'DT'){
        classy = 4;
        console.log('classifier = '+ classifier);
    }
    res.send({});
}

function languagesOption(req, res){
    var language = req.body.lang;
    console.log(language);
    if (language == 'English'){
        value = 1;
        console.log('value = '+ value);
    }
    else if (language == 'EnglishMalay'){
        value = 2;
        console.log('value = '+ value);
    }
    else if (language == 'EngChinese'){
        value = 3;
        console.log('value = '+ value);
    }
    res.send({});
}


function preprocessOption(req, res){
    var process = req.body.PTtype;
    console.log(process);
    if (process == 'Pre2Trans'){
        prevalue = 1;
        console.log('prevalue = '+ prevalue);
    }
    else if (process == 'Trans2Pre'){
        prevalue = 2;
        console.log('prevalue = '+ prevalue);
    }
    res.send({});
}

function doTranslation(req, res) {
    inputText = "";
    var inputText = req.body.inputText;
    oriText = inputText;
    currentuser = req.user.name;
    console.log('translate.js doTranslation()');
    console.log('translate.js req.body.inputText: ', req.body.inputText);
    
    console.log('current VALUE :' + value);
    console.log('current PREVALUE :' + prevalue);
    let response = null;

    if (value == 1){
        if(prevalue == 1){
            console.log('ENGLISH ONLY with PRE-2-TRANS');
            response = runPy2(inputText, res);
        }
        if(prevalue == 2){
            console.log('ENGLISH ONLY with TRANS-2-PRE');
            response = runPy2(inputText, res);
        }
    }
    else if (value == 2){
        if(prevalue == 1){
            console.log('ENG-MALAY with PRE-2-TRANS');
            response = runPy2(inputText, res);
        }
        if(prevalue == 2){
            console.log('ENG-MALAY with TRANS-2-PRE');
            response = runPy2(inputText, res);
        }
    }
    else if (value == 3){
        if(prevalue == 1){
            if(classy == 1)
            response = runPy("--init_comb 1 --tgt_clf 1 --sentences \"" + inputText + "\"");
            if(classy == 2)
            response = runPy("--init_comb 1 --tgt_clf 2 --sentences \"" + inputText + "\"");
            if(classy == 3)
            response = runPy("--init_comb 1 --tgt_clf 3 --sentences \"" + inputText + "\"");
            if(classy == 4)
            response = runPy("--init_comb 1 --tgt_clf 4 --sentences \"" + inputText + "\"");
        }
        if(prevalue == 2){
            if(classy == 1)
            response = runPy("--init_comb 2 --tgt_clf 1 --sentences \"" + inputText + "\"");
            if(classy == 2)
            response = runPy("--init_comb 2 --tgt_clf 2 --sentences \"" + inputText + "\"");
            if(classy == 3)
            response = runPy("--init_comb 2 --tgt_clf 3 --sentences \"" + inputText + "\"");
            if(classy == 4)
            response = runPy("--init_comb 2 --tgt_clf 4 --sentences \"" + inputText + "\"");
        }
    }
    console.log('translate.js response: ', response);
}

function insertTranslation(){
    console.log('translate.js insertTranslation()');
    console.log('translate.js datestring: ', datestring);
    var input_Text = oriText;
    var preText = preproText;
    var tagging = tag;
    var outputText = translated;
    var datetime = datestring;
    var by = currentuser;
    var langType = value;
    var transType = prevalue;

    const new_sentence = new TransText({ inputText: input_Text, preText: preText, tagging: tagging, outputText: outputText, 
                                        datetime: datetime, by: by, langType: langType, transType: transType});

    console.log('input Text       : ' + input_Text);
    console.log('preprocess Text  : ' + preText);
    console.log('tagging          : ' + tagging);
    console.log('output Text      : ' + outputText);
    console.log('datetime         : ' + datetime);
    console.log('username         : ' + by);
    console.log('language type    : ' + langType);
    console.log('translation type : ' + transType);

    new_sentence.save(function(err) {
        if(err) {
            console.log('Mongoose FAILED!!', err);
        } else {
            console.log('Mongoose UPDATED!!');
        }
    });
}


function runPy2(word, res) { // the 'word' = the input value of the sentences
    console.log('runPy2() : ', word);
    try {
        const spawn = require("child_process").spawn;                                   //require child process to call python
        const pythonProcess = spawn('python',["./python/mengjian/fypDemo1.py", word]);  //set the path of python file
        
        pythonProcess.stdout.on('data', (data,) => {

            // Do something with the data returned from python script

            output = "";
            output += Buffer.from(data).toString();                   //get 'data' from python file

            var arguReturn = new Array();
            arguReturn = output.split("*");                           // split the string value when reach * symbol [check /mengjian/fypDemo.py]

            preproText = arguReturn[0];
            tag = arguReturn[1];
            translated = arguReturn[2];

            console.log('translate.js output :', output);
            console.log(word);
            console.log(preproText);
            console.log(tag);
            console.log(translated);
            
            insertTranslation();                                      // here I update Mongoose table

            const response = {                                        // res the result to the mainpage
                word:word,
                preproText: preproText,
                tag: tag,
                translated: translated
            }
            console.log('translate.js response :', response);
            res.send(JSON.stringify(response));
        });
    } catch (e) {
        console.log("Error caught! e: ", e);
    }
}

function runPy(word) {
    console.log('runPy() : ', word);
    try {
        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python',["./python/jianwen/SubAnalysis_JW.py", word]);
        pythonProcess.stdout.on('data', (data) => {
            // console.log('translate.js data: ', data.toString());
            output += Buffer.from(data).toString();
            console.log('translate.js output :', output);
            insertTranslation();
            // Do something with the data returned from python script
        });
    } catch (e) {
        console.log("Error caught! e: ", e);
    }
}

function runPy1(word) {
    console.log('runPy1() : ', word);
    try {
        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python',["./python/hoonglik/FullTranslate-HL.py", word]);
        pythonProcess.stdout.on('data', (data) => {
            // console.log('translate.js data: ', data.toString());
            output += Buffer.from(data).toString();
            console.log('translate.js output :', output);
            insertTranslation();
            // Do something with the data returned from python script
        });
    } catch (e) {
        console.log("Error caught! e: ", e);
    }
}

module.exports = router;

/*
router.get("/",(req, res) => {
    getCorpus(req, res);
});
 

function getCorpus(req, res){
    TransText.collection('transtext').find({}, function(err, allDetails){
        if(err) {
            console.log('/getcorpus err: ', err);
        } else {
            console.log('/getcorpus DOWNLOADED!!');
            res.render('corpus', { details : allDetails })
        }
    })
}*/

//res.jsonp(full_json[0].length);

//for (var i = 0; i < full_json[0].length; i++){
//    runMain(full_json[0][i], full_json[1][i], inputText, outputText, by);
//}

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

// let options = {
//     mode: 'text',
//     pythonPath: './python/hoonglik',
//     pythonOptions: ['-u'],
//     scriptPath: './python/hoonglik/',//Path to your script
//     args: [word]//Approach to send JSON as when I tried 'json' in mode I was getting error.
// };
//     //await 
//     PythonShell.run('FullTranslate-HL.py', options, function (err, results) {
//         console.log('translate.js Error in script.');
//         // console.log('translate.js err: ', err);
//         console.log('translate.js results: ', results);
//     //On 'results' we get list of strings of all print done in your py scripts sequentially. 
//     if (err) throw err;
//     console.log('%j', results)
//     //results = output;
//     //resolve(results[1])//I returned only JSON(Stringified) out of all string I got from py script
// });

/*
function runPy2(word){
    return new Promise(async function(resolve, reject){
        let options = {
        mode: 'text',
        pythonOptions: ['-u'],
        scriptPath: './python/mengjian/',//Path to your script
        args: [word]//Approach to send JSON as when I tried 'json' in mode I was getting error.
        };

        await PythonShell.run('fypDemo1.py', options, function (err, results) {
            //On 'results' we get list of strings of all print done in your py scripts sequentially. 
            if (err) throw err;
                resolve(results[1])//I returned only JSON(Stringified) out of all string I got from py script
                console.log('results' +results);
        });
    }).catch(() => { /* do whatever you want here */ 
//});
//}