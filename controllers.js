const db = require('./myStorage');
var DB = new myDB('./data');
const mng=require('mongoose');
const my_conn_data="mongodb://al286311:cristian12345@ds117200.mlab.com:17200/midb";
const https=require('https');
//Creamos la conexion con nuestra base de datos

mng.connect(my_conn_data);




getGraph = function(callback){

  https.get("https://api.mlab.com/api/1/databases/midb/collections/items?apiKey=6ajsr5j5WDtkCQ9cwyaLHdp3yWp7VJmq", function(res){
   res.on('data',function(d){
     var data=JSON.parse(d);
     callback({'@graph': data});
   }); //res
    
  }); //get
}





getSentimentTweets = function(name,callback){
  DB.getLastObjects(name,100,function(data,name){
    var lista=data.result;
    var positive=0,negative=0,neutral=0;
    lista.forEach(function(x){
      if(x.polaridad > 0){
        positive++;
      }else if(x.polaridad < 0){
        negative++;
      }else{
        neutral++;
      }
    });
    callback({"result":{"positive":positive,"neutral":neutral,"negative":negative}});
  });
}

function isWord(candidate) {
  if (candidate.length<3) return false;
  return /\w+/.test(candidate);
}

function toLowerCase(word) {
  return word.toLowerCase();
}

getHistogramTweets = function(name,number,callback){
  DB.getLastObjects(name,50,function(data,name){
    var tweetList = data.result;
    var histogram = {};
    tweetList.forEach(function(tweet){
      console.log(tweet);
      if (tweet.texto==undefined) return false;
      var wordList=tweet.texto.split(/\b/);
      wordList = wordList.filter(isWord);
      wordList = wordList.map(toLowerCase);
      wordList.forEach(function(x){
         if(!histogram.hasOwnProperty(x)){
             histogram[x] = 0;
          }
          histogram[x]++; 
      });

     });
    var laux=[];
    for(var k in histogram) laux.push([k,histogram[k]]);

    laux.sort(function (a, b){
      return (b[1] - a[1]);
    }); 
    callback({"result":laux.slice(0,number)});
  });
}

getGeoLocationTweets = function(name,callback){
  DB.getLastObjects(name,100,function(data,name){
    var lista=data.result;
    var listaGeo = {};
    lista.forEach(function(x){
      if(x.coordenadas != null)
        listaGeo[x.id]=x.coordenadas;
    });
    callback({"result":listaGeo});
  });
}

getIdStreamsTweets = function(name, number, callback){
  if(number<=0){
    number = 10;
  }
  DB.getLastObjects(name,number,function(data,name){
    var lista=data.result;
    var listaId = [];
    lista.forEach(function(x){
      listaId.push(x.id);
    });
    callback({"result":listaId});
  });
}

createJSONLD = function(identifier, query){
  return(
  {
    "@context": "http://schema.org/",
    "@type": "SearchAction",
    "identifier": identifier,
    "query": "http://localhost:8000/dataset/"+identifier,
    "agent": "BenLuismi",
    "startTime": Date(),
    "@id": query
  }
  );
}



exports.getIdStreamsTweets = getIdStreamsTweets;
exports.getHistogramTweets = getHistogramTweets;
exports.getSentimentTweets = getSentimentTweets;  
exports.getGeoLocationTweets = getGeoLocationTweets;  
exports.createJSONLD = createJSONLD; 
exports.getGraph = getGraph; 
