const Promise = require('bluebird'); // this gives us the ability to turn callbacks into promises
const fs = Promise.promisifyAll(require("fs"));

// the location of the json data files
const data = "./data/";

// a constant (for now) term to search on
const term = "breakfast";



// start by listing the files in the data directory
fs.readdirAsync(data)
    // Read each file
    .map(fileName => fs.readFileAsync(data + fileName, 'utf8'))
    // Parse each file. Each item now represents a hotel
    .map(JSON.parse)

    // ???
    .map(hotel =>
      // parse out the various sentences from the reviews and titles
      hotel.Reviews
          // parse out all of the sentences related to this review
          .flatMap(review => [review.Title].concat(review.Content.split(/\.+?/)))
          // filter out any sentences that don't contain the search term
          .filter(sentence => sentence != undefined && sentence.indexOf(term) != -1)

    )

    // print the results
    .each(hotel => {
      console.log(hotel);
      console.log("...");
    });


// stolen from https://gist.github.com/samgiles/762ee337dff48623e729
Array.prototype.flatMap = function(lambda) {
  return Array.prototype.concat.apply([], this.map(lambda));
};