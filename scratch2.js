const Promise = require('bluebird'); // this gives us the ability to turn callbacks into promises
const fs = Promise.promisifyAll(require("fs"));

// the location of the json data files
const data = "./data/";

// a constant (for now) term to search on
const term = "staff";

// read the semantics file in (synchronously for ease for now)
const semantics = JSON.parse(fs.readFileSync("semantics.json", "utf8"));

// this is a quick hack to give the negative words negative values
semantics.negative = semantics.negative.map(negative => ({
  "phrase": negative.phrase,
  "value": -negative.value
}));


/**
 * Calculate the score for a sentence based on the semantics data
 * @param sentence
 * @returns {number}
 */
let calculateScore = function (sentence) {
  // identify the intensifier(s) in the sentence. I'm keeping this as a variable because I might want to use this later
  let intensifiers = semantics.intensifier.filter(intensifier => sentence.indexOf(intensifier.phrase) != -1);

  // find the total associated multiplier for this sentence
  let multiplier = intensifiers.reduce((acc, intensifier) => acc + intensifier.multiplier, 1);

  // find positive/negative words.
  let connotations = semantics.positive.concat(semantics.negative).filter(connotation => sentence.indexOf(connotation.phrase) != -1);

  // find and return the adjusted score for these connotations and multiplier
  return multiplier * connotations.reduce((acc, connotation) => acc + connotation.value, 1);
};


/**
 * Indicates if the sentence contains a given term
 * @param sentence
 * @param term
 * @returns {function(*=): boolean}
 */
let containsTerm = function (sentence, term) {
  // todo: strip out non-word characters (, ", &, etc)

  // todo: consider partial words. IE "ice" would match concise, which isn't what I want. This is just a start
  return sentence != undefined && sentence.indexOf(term) != -1;
};

// start by listing the files in the data directory
fs.readdirAsync(data)
// Read each data file
    .map(fileName => fs.readFileAsync(data + fileName, 'utf8'))
    // Parse each file. Each item now represents a hotel
    .map(JSON.parse)

    // ???
    .map(hotel => {
          let scores = hotel.Reviews
          // parse out all of the sentences related to this review
              .flatMap(review => [review.Title].concat(review.Content.split(/(\.|!|\?)+?/)))

              // filter out any sentences that don't contain the search term
              .filter(sentence => containsTerm(sentence, term))

              // reduce this to a collection of scores
              .reduce((acc, sentence) => acc.concat({
                sentence: sentence,
                score: calculateScore(sentence)
              }), []);

          // todo: consider whether or not to include the scores in the results
          return {
            total: scores.reduce((acc, score) => acc + score.score, 0),
            hotel: hotel.HotelInfo
          }
        }
    )
    .then(data => {
      // sort the results based on their score
      data.sort((a, b) => a.total < b.total);

      console.log(data);
    });

/*// print the results
 .each(hotel => {
 console.log(hotel);
 console.log("...");
 });*/


// stolen from https://gist.github.com/samgiles/762ee337dff48623e729
Array.prototype.flatMap = function (lambda) {
  return Array.prototype.concat.apply([], this.map(lambda));
};