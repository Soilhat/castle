const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

var obj = {
  table: []
};

getStarred = async function(){
  var step;
  for(step = 1; step < 36; step ++)
  {
    var link = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-' + step;
    await request(link, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        const hotels = $('.poi-search-result');
        //const france = hotels.next().html();
        //console.log(france);
        const list = hotels.find('block__content');
        //console.log(hotels.html());
        hotels.children().children().each(function(i, element){
          var a = $(this).children();
          var title = a.parent().attr('attr-gtm-title');
          var url = 'https://restaurant.michelin.fr' + a.attr('href');
          var str = title.replace(/\s\s+/g, " ")
          // Our parsed meta data object
          var metadata = {
            title: str,
            url: url
          };
          //var metaJSON = JSON.stringify(metadata);
          //obj.push(metaJSON);
          //obj.table.push(metadata);
          //console.log(metaJSON);
          fs.readFile('StaredRestaurants.json','utf8', function readFileCallback(err,data){
            if (err){
              console.log(err);
            } else {
              //obj = JSON.parse(data); //now it an object
              obj.table.push(metadata); //add some data
              json = JSON.stringify(obj); //convert it back to json
              fs.writeFile('StaredRestaurants.json', json, 'utf8', function(err) {
                if (err) throw err;
              }); // write it back 
            }
          })
        });
      }
    });
  }
}

get = async function(){
  getStarred().then(async() =>{})
}

module.exports = {
    get : get
} ;