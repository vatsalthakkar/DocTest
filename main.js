const textract = require('textract');
const natural = require('natural');
const WordPOS = require('wordpos');
wordpos = new WordPOS();
const fs=require('fs');

var reportStatement='';



var wordcounttest=0;
var nouncounttest=0;
var verbcountbase=0;
var verbcounttest=0;
var nounstest;
var tokenstest;
var allTexttest='';
var efficiency=100.0;
var wordcountbase=0;
var nouncountbase=0;
var nounsbase;
var tokensbase;
var allTextbase='';
var testing={};
testing['base']={};
testing['test']={};
var baseNounPercentage;
var testNounPercentage;


//Processing the base file here
var baseProcess=function(file){
 return new Promise(function(resolve,reject){
 	textract.fromFileWithPath(file, function( error, text ) {
	var tokenizer = new natural.WordTokenizer();
	tokensbase=tokenizer.tokenize(text);
	allTextbase=text;
	wordcountbase=tokensbase.length;
		
	wordpos.getNouns(text,function(result){
	    	nouncountbase=result.length;
	    	resolve('success');
	});
});

    
 });
}

//Function for processing test file here.
var testProcess=function(file){
 return new Promise(function(resolve,reject){
 	textract.fromFileWithPath(file, function( error, text ) {
	var tokenizer = new natural.WordTokenizer();
	tokenstest=tokenizer.tokenize(text);
	allTexttest=text;
	wordcounttest=tokenstest.length;
		
	wordpos.getNouns(text,function(result){
	    	nouncounttest=result.length;
	    	resolve('success');
	});
});

    
 });
}

// After both the files have been processed, excute this.
Promise.all([baseProcess('test.docx'),testProcess('test.docx')]).then(function(){
	testing.base['no. of words']=wordcountbase;
	testing.base['no. of nouns']=nouncountbase;
	testing.test['no. of words']=wordcounttest;
	testing.test['no. of nouns']=nouncounttest;
 	if(wordcounttest>=(85*wordcountbase/100)&&wordcounttest<=(115*wordcountbase/100)){
 		if(wordcountbase>wordcounttest){
 			efficiency-=wordcounttest*100/wordcountbase;
 		}
 		else
 		{
 			efficiency+=wordcounttest*100/wordcountbase;
 		}

 		baseNounPercentage=nouncountbase/wordcountbase*100;
 		testing.base['noun%']=baseNounPercentage;
		testNounPercentage=nouncounttest/wordcounttest*100;
		testing.test['noun%']=testNounPercentage;
 		if(Math.abs(baseNounPercentage-testNounPercentage)<=15){

 				if(nouncountbase>nouncounttest){
 			efficiency-=nouncounttest*100/nouncountbase;
 		}
 		else{
 			efficiency+=nouncounttest*100/nouncountbase;

 		}
 		var similarity=natural.JaroWinklerDistance(allTextbase,allTexttest)*100;
 		reportStatement+="<br> Similarity in document is "+similarity+" %"+"<br>";

 			if(similarity>50){
 				efficiency-=similarity/10;
 			}

 			reportStatement+="efficiency "+efficiency+" %";

 			testing['Note']={'DocumentReport':reportStatement};

 		}
 		else{
 			reportStatement+="noun percentage is very less";
 		}
 	}
 	else{
 		reportStatement+="word count is not in range";
 	}
 	//writing the results into json file
 	var json=JSON.stringify(testing,null,2);
 	fs.writeFile('data.json',json,'utf-8',(err)=> {
 		if(err){
 			return;
 		}
 		console.log("Done");

 	})

});


	
