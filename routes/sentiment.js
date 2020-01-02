
router.get('/sentiment', (req, res) =>{
    res.sendFile("sentiment.ejs");
});

router.post('/dashboard', (req,res)=>{
    sentiment(req, res);
})



function sentiment(req, res){
var table;
var afinn = {}

function preload(){
    afinn = loadJSON('afinn111.json');
}

function setup(){
    noCanvas();
    console.log(afinn);

    var txt = select('#txt');
    txt.input(typing);

    function typing(){
        console.log(txt.value());
        var textinput = txt.value();
        var words = textinput.split(/\W/);
        console.log(words);

        var scoredwords = [];
        var score = 0;
        for(var i =0; i < words.length; i++){
            var word = words[i].toLowerCase();
            if(afinn.hasOwnProperty(word)){
                score += Number(afinn[word]);
                scoredwords.push(word + ':' + score);
            }
        }
        var scoreP = select('#score');
        scoreP.html('score' + score);
        var comp = select('#comparative');
        comp.html('comparative: ' + score/words.length);
        var wordlist = select('#wordlist');
        wordlist.html(scoredwords);
    }
}

function draw(){

}
}

module.exports = router;
