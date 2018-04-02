'use strict'

let request = require('request');//request for HTTP calls.
let cheerio = require('cheerio');//cheerio for navigating the DOM.
let json2csv = require('json2csv').Parser;//json 2 csv for converting the scraped data into a csv file.
let fs = require('fs');//'fs' for creating files and folders
let moment = require('moment');//'moment' for managing dates and times
let fields = ['Title', 'Price', 'ImageURL', 'url','Time'];
let url = 'http://shirts4mike.com/';
let allShirts = [];

//creating an error function
let errorMessage = function(err){
  console.error("There’s been an error. Cannot connect to " + url);
}

// creating requests
request(url, function (err, resp, body) { //http://shirts4mike.com/
  if(!err && resp.statusCode == 200){
    let $ = cheerio.load(body);
    let shirtsPath = $(".shirts > a").attr("href");
    let shirtsUrl = url + shirtsPath;
  request(shirtsUrl, function (err, resp, body) {//http://shirts4mike.com/shirts.php
    if (!err && resp.statusCode == 200) {
      let $ = cheerio.load(body);
      $(".products > li > a").each(function () {
        let localShirtsUrl = (url + $(this).attr("href"));

        request(localShirtsUrl, function (err, resp, body){//http://shirts4mike.com/shirts.php/id={shirt}

         if(!err && resp.statusCode == 200){
           let $ = cheerio.load(body);
           let title = $(".shirt-details > h1").text().slice(4); // slice to remove the price form the title
           let price = $(".price").text();// getting the price text
           let imageUrl = $('.shirt-picture > span > img').attr("src");//img url

           /**
             * create JSON object for each shirt
             & @param shirts {object}
           */

           let shirts = {};
           shirts.Title = title;
           shirts.Price = price;
           shirts.ImageURL = imageUrl;
           shirts.url = localShirtsUrl;
           shirts.Time = moment().format('MMMM Do YYYY, h:mm:ss a');//adding current time with 'moment'
           allShirts.push(shirts);
           let dataFolder = './data';
           if (!fs.existsSync(dataFolder)){//create a data foler if one does not exsists
             fs.mkdirSync(dataFolder);
           }
           // using json2csv npm to create csv form  json shirts object
           const json2csvParser = new json2csv({ fields });
           const csv = json2csvParser.parse(allShirts);
           let date = moment().format('YYYY[-]MM[-]DD')// today date created with 'moment'
           fs.writeFile(dataFolder + "/" + date + '.csv', csv, function(err) {
             if (err) {
               console.log('Cant create the file');
             }
           });
           //end localShirtsUrl if
         }else{
           errorMessage(err);
         }
        })//end localShirtsUrl request
    });//end each
    // end shirtsUrl if
  }else{
    errorMessage(err);
  }
  });// end shirtsUrl request
  //end url if
} else {
  errorMessage(err);
}
});//end url request
