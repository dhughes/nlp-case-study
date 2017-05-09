const Promise = require('bluebird'); // this gives us the ability to turn callbacks into promises
const fs = Promise.promisifyAll(require("fs"));

// the location of the json data files
const data = "./data/";

// a constant (for now) term to search on
const term = "breakfast";

// read the semantics file in (synchronously for ease for now)
const semantics = JSON.parse(fs.readFileSync("semantics.json", "utf8"));

// this is a quick hack to give the negative words negative values
semantics.negative = semantics.negative.map(negative => ({
  "phrase": negative.phrase,
  "value": -negative.value
}));


/**
 * Calculate the score for a sentence based on the semantics data. The higher the
 * number, the better the score. Score is based off the positive and negative words
 * found in the sentence multiplied by the intensifier's value.
 * @param sentence
 * @returns {number}
 */
let calculateSentenceScore = function (sentence) {
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
 * @returns {boolean}
 */
let containsTerm = function (sentence, term) {
  // todo: strip out non-word characters (, ", &, etc)

  // todo: consider partial words. IE "ice" would match concise, which isn't what I want. This is just a start
  return sentence != undefined && sentence.indexOf(term) != -1;
};

/**
 * Returns an array of objects that contain a sentence and its "score" based
 * on its correlation to the search term.
 *
 * @param hotel
 * @returns {*}
 */
let calculateHotelReviewScoresForTerm = function (hotel, term) {
  return hotel.Reviews
      // extract all of the sentences related to this review
      .flatMap(review => [review.Title].concat(review.Content.split(/(\.|!|\?)+?/)))

      // filter out any sentences that don't contain the search term
      .filter(sentence => containsTerm(sentence, term))

      // reduce this to a collection of scores
      .reduce((acc, sentence) => acc.concat({
        sentence: sentence.trim(),
        score: calculateSentenceScore(sentence)
      }), [])

      // sort this so that the most positive reviews are first;
      .sort((a, b) => -(a.score - b.score));
};

// start by listing the files in the data directory
fs.readdirAsync(data)
// Read each json file in the .data directory
    .map(fileName => fs.readFileAsync(data + fileName, 'utf8'))

    // Parse each file. Each item now represents a hotel with its reviews
    .map(JSON.parse)

    // This maps each hotel to an object that contains the hotel data and a total score based on the search term
    .map(hotel => {
          let scores = calculateHotelReviewScoresForTerm(hotel, term);

          // create an object that contains hotel information and the scores  for sentences in the reviews
          return {
            scores: scores,
            negativeCount: scores.reduce((acc, score) => score.score < 0 ? acc + 1 : acc, 0),
            positiveCount: scores.reduce((acc, score) => score.score > 0 ? acc + 1 : acc, 0),
            neutralCount: scores.reduce((acc, score) => score.score === 0 ? acc + 1 : acc, 0),
            finalScore: scores.reduce((acc, score) => acc + score.score, 0),
            hotel: hotel.HotelInfo
          }
        }
    )
    .then(data => {
      // sort the results based on their score
      data.sort((a, b) => -(a.finalScore - b.finalScore));

      // todo: consider formatting console output (color, bold, etc)
      console.log("Your results for '" + term + "' are:\n");


      data.forEach(result => {
        let output = `${result.hotel.Name ? result.hotel.Name : 'Unknown Hotel Name (Sorry!!)'}\n\n` +
            `   Total Score:  ${result.finalScore} (${result.positiveCount} positive, ${result.negativeCount} negative, ${result.neutralCount} neutral)\n` +
            `   Link:         ${result.hotel.HotelURL}\n\n` +
            `   Five most positive reviews\n\n`;

        // get the most positive reviews
        result.scores
            .slice(0, 5)
            .forEach(sentence => output += `\t ... ${sentence.sentence} ...\n`);
        output += "\n";

        output += "\tFive most negative reviews:\n\n";

        // get the most negative reviews
        result.scores
            .reverse()
            .slice(0, 5)
            .forEach(sentence => output += `\t ... ${sentence.sentence} ...\n`);


        console.log(output + "\n");

      });
    });


// stolen from https://gist.github.com/samgiles/762ee337dff48623e729
Array.prototype.flatMap = function (lambda) {
  return Array.prototype.concat.apply([], this.map(lambda));
};