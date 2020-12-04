
const http = require('http');
const express = require('express');
const routes = require('./api/routes.js');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;
const app = express();

async function connectMongo(){
 
    try{
      const uri = "mongodb+srv://aneesh540:aneesh540@cluster0.kik1t.mongodb.net/<dbname>?retryWrites=true&w=majority";
      await mongoose.connect(uri, {useNewUrlParser:true,  useUnifiedTopology: true});
      console.log("Connected to Database");
    }

    catch (e){
        console.log("Error connecting database");

    }

}

app.use( (req, res, next) => {
  /** Allow request from all origins CORS for public REST API */
  
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
     "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if(req.method === 'OPTIONS'){
      res.header("Access-Control-Allow-Headers", 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
    }
    next();

});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
connectMongo();

app.use('/', routes);

http.createServer(app).listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});