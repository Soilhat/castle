const castle = require('./castle');
const michelin = require('./michelin');

michelin.get().then(async()=>{
	castle.getProperties().then(async(properties)=>{
		console.log("properties" + properties);
		//const prices = castle.getPrices(property);
		//console.log(prices);
	});
});