//Requiring all the packages needed ... 
var express = require("express") ;
var app = express() ;
var request =require("request") ;
var username ; 
var lr , hr ;
var data ;
var dt ;
var dat ; 
let mp = new Map() ;
let mpp = new Map() ;


// not to use .ejs everytime 
app.set("view engine","ejs");

// For Css files route 
app.use (express.static("public")) ;

///////////////////////////////////
app.get("/",function(req,res){
	res.render("main") ;	
});

//////////////////////////////////

// piece of junk along with info.ejs 
app.get("/info",function(req,res){
	res.render("info");
});



//////////////////////////////////
app.get("/information",function(req,res){
	
	username = req.query.username ;
	// https://codeforces.com/api/user.rating?handle=Fefer_Ivan
	var url = "https://codeforces.com/api/user.rating?handle=" + username + "&apikey=thewdb";
	request(url,function(error,response,body){
	 	if(!error && response.statusCode == 200){
	 		data = JSON.parse(body);
			var xlabel = [] , ylabel = [] ;
			xlabel.push(0) , ylabel.push(1500) ;
			
			//newrating as array ylabel[] and for label using array xlabel[] which is nothing but contest ids
			for(var i = 0 ; i < data["result"].length ; i ++ ){
				ylabel.push(  (Number)( data["result"][i].newRating  )) ;
				xlabel.push( data["result"][i].contestId ) ;
			}
			// for(var i = 0 ; i < ylabel.length ; i ++ ){
			// 	console.log(ylabel[i]) ;
			// }
			var obj = { xlabel : xlabel , ylabel : ylabel , data : data , username : username} ;	
			
	 		res.render("information",{obj : obj }) ;
		}
		else {
			res.render("erro") ;
		}
	 });
});

////////////////////////////////////
function getUserContests(){
	// mp clear 
	mp. clear() ;
	var len = (Number)(dt["result"].length) ;
	for(var i = 0 ; i < len ; i++ ){
		if(dt["result"][i]["verdict"] == "OK"){
			mp.set(dt["result"][i].contestId , 1);
			//console.log("a");
		}
	}
	// for (let [key, value] of mp){
	//   console.log(key + ' = ' + value) ;
	// }
};

function getProbOfUser(){
	// mpp clear 
	mpp. clear() ;
	var n = (Number)(dt["result"].length) ;
	for(var i = 0;i < n ;i ++ ){
		if(dt["result"][i]["verdict"] == "OK"){
			var str =   dt["result"][i]["problem"].contestId + dt["result"][i]["problem"].index  ;
		    mpp.set(str , 1);
		}
	}
};





app.get("/precalc",function(req,res){
	var url2 = "https://codeforces.com/api/user.status?handle=" + username ;
	request(url2,function(error,response,body){
	 	if(!error && response.statusCode == 200){
	 		dt = JSON.parse(body);
			res.redirect("/virtualContest");
		}
		else {
			res.send("Some Error ...") ;
		}
	 });
	
});



app.get("/virtualContest",function(req,res){
	var url1     = "https://codeforces.com/api/contest.list?gym=" + "false" ;
	getUserContests();
	request(url1,function(error,response,body){
	 	if(!error && response.statusCode == 200){
			//console.log(body) ;
	 		var ds = JSON.parse(body) ;
			//{ data: { title: "Express", name: "Arnaud" } }
			var datas = {mp : mp , ds :ds } ;
			
			var virtualContestId = [] ;
			
			var ln = (Number)(datas.ds["result"].length) ;
			
			
			for(var i = 0 ; i < ln ; i ++ ){
				var id = (Number)(datas.ds["result"][i].id);
				var tit = datas.ds["result"][i].name ;
				if( (Number)(datas.mp.get(id)) === 1 || (datas.ds["result"][i]).phase === "BEFORE" ){
					
				}
				else{
					//console.log("a");
					virtualContestId.push({id : id , tit : tit});
				}
				//console.log((Number)(datas.mp.get(id))) ;
			}
			//console.log(virtualContestId.length);
			
			
			
			// for(var i = 0; i < virtualContestId.length; i ++  ){
			// 	console.log(virtualContestId[i]);
			// }
			
	 		res.render("virtualContest",{  virtualContestId : virtualContestId  }) ;
		}
		else {
			res.send("Some Error ...") ;
		}
	 });
});



///////////////////////////////////////////////////////////


app.get("/precal",function(req,res){
	var url3 = "https://codeforces.com/api/user.status?handle=" + username  ;
	request(url3,function(error,response,body){
		if(!error && response.statusCode == 200){
	  		dt = JSON.parse(body) ;
			res.render("ratingrange") ;		
		}
		else {
			res.send("Some Error ...") ;
		}
	});
});

//////////////////////////////////////////////////////////


app.get("/range",function(req,res){
	lr = (Number)(req.query.lr) ;
	hr = (Number)(req.query.hr) ;
	//console.log(lr);
	//console.log(hr);
	getProbOfUser() ;
	var url4 = "https://codeforces.com/api/problemset.problems?" ;
	request(url4,function(error,response,body){
	 	if(!error && response.statusCode == 200){
			var prob = [] ;
			dat = JSON.parse(body) ;
			var N = dat["result"]["problems"].length ; 
			for(var i = 0; i<N;i++){
				var idd  = dat["result"]["problems"][i].contestId ;
				var ind  = dat["result"]["problems"][i].index ;
				var titl = dat["result"]["problems"][i].name ;
				var rat  = dat["result"]["problems"][i].rating ;
				var key = idd + ind ;
				if(mpp.get(key) === 1){
					
				}
				else{
					if(dat["result"]["problems"][i].rating <= hr && dat["result"]["problems"][i].rating >= lr){
						prob.push({idd : idd , ind : ind , titl : titl , rat : rat }) ;
					}
				}
				
				
			}
			
			
			res.render("ratprob",{prob : prob});
		}
		else {
			res.send("Some Error ...") ;
		}
	 });
});




////////For server port /stuff 
var port = process.env.PORT || 3000;
app.listen(port, function () {
   console.log("App has started!");
});


// app.listen(3000, function(req, res) {
// 	console.log("We are live...");
// });