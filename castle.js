//const request = require('request');
const cheerio = require('cheerio');
var request = require("request-promise");
var fs = require('fs');

var Hotels = [];
var properties = { table : []};
var restaurants = { table : []};

getHotels = async function(){
    await request('https://www.relaischateaux.com/us/site-map/etablissements', async function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            const hotels = $('#countryF');
            const list = hotels.next().first().children().next();
            list.children().children().each(function(i, element){
                var a = $(this);
                var title = a.text();
                var url = a.attr('href');
                var str = title.replace(/\s\s+/g, " ")
                // Our parsed meta data object
                var metadata = {
                    title: str,
                    url: url
                }
                Hotels.push(metadata);
            })
        }
    });
}

getRest = async function(){
    return new Promise(async(resolve, reject) => {
        try {
            getHotels().then(async()=>{            
                for(var i = 0; i < Hotels.length; i++){
                    var hotel = Hotels[i]
                    /* SCRAPING THE HOTEL PAGES*/
                    await request(hotel.url, async function (error, response, html) {
                        if (!error && response.statusCode == 200) {
                            var s = cheerio.load(html);
                            const rest = s('.jsSecondNavMain');
                            const list = rest.children().next().find('a');
                            var urlRestaurant = list.attr('href');

                            if(typeof urlRestaurant !== 'undefined' && urlRestaurant.match("restaurant")){
                                // THIRD REQUEST
                                await request(urlRestaurant, async function (error, response, html) {
                                    if (!error && response.statusCode == 200) {
                                        var c = cheerio.load(html);
                                        const restos = c('.jsSecondNavSub');
                                        if(restos.length >0){
                                            const listrestos = restos.children();
                                            listrestos.each(async function(i, element){
                                                var l = c(this);
                                                var nomRestaurant = l.find('a').first().text();
                                                var string = nomRestaurant.replace(/\s\s+/g, " ");
                                                fs.readFile('HotelsRestaurants.json','utf8', function readFileCallback(err,data){
                                                    if (err){
                                                      console.log(err);
                                                    } else {
                                                      //obj = JSON.parse(data); //now it an object
                                                      properties.push({namehotel: hotel.title, urlhotel: hotel.url, restaurant: string, url : urlRestaurant})
                                                      json = JSON.stringify(properties); //convert it back to json
                                                      fs.writeFile('HotelsRestaurants.json', json, 'utf8', function(err) {
                                                        if (err) throw err;
                                                      }); // write it back 
                                                    }
                                                })
                                            })
                                        }
                                        else{
                                            const restos = c('.hotelTabsHeaderTitle');
                                            var nomRestaurant = restos.find('h3').text();
                                            var string = nomRestaurant.replace(/\s\s+/g, " ");
                                            fs.readFile('HotelsRestaurants.json','utf8', function readFileCallback(err,data){
                                                if (err){
                                                  console.log(err);
                                                } else {
                                                  //obj = JSON.parse(data); //now it an object
                                                  properties.push({namehotel: hotel.title, urlhotel: hotel.url, restaurant: string, url : urlRestaurant})
                                                  json = JSON.stringify(properties); //convert it back to json
                                                  fs.writeFile('HotelsRestaurants.json', json, 'utf8', function(err) {
                                                    if (err) throw err;
                                                  }); // write it back 
                                                }
                                            })
                                        }
                                    }
                                });
                            };
                        }
                    });
                }
            })
            resolve(properties);
        }
        catch( error ){
            reject(error );
        }
    })
}

getProperties = async function(){
    await getRest().then(async()=>{
        fs.readFile('StaredRestaurants.json','utf8', async function readFileCallback(error,datas){
            if (error){
                console.log(error);
            } else {
                restaurants = JSON.parse(datas); //now it an object
                fs.readFile('HotelsRestaurants.json','utf8', async function readFileCallback(err,data){
                    if (err){
                        console.log(err);
                    } else {
                        properties = JSON.parse(data); //now it an object
                        console.log(restaurants.table.length);
                    }
                })
            }
        })
    })
}

module.exports = {
    getProperties : getProperties
} ;