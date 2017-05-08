const Promise = require('bluebird');

const fs = Promise.promisifyAll(require("fs"));

const data = "./data/";

fs.readdirAsync(data)
    .map(fileName => fs.readFileAsync(data + fileName, 'utf8'))
    .map(JSON.parse)
    .each(hotel => {
      console.log(hotel.HotelInfo.Name);
    });



