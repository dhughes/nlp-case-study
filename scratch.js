const Promise = require('bluebird');

const join = Promise.join;
const fs = Promise.promisifyAll(require("fs"));

const data = "./data/";

fs.readdirAsync(data).map(fileName => {
  const stat = fs.statAsync(data + fileName);
  const contents = fs.readFileAsync(data + fileName).catch(_ => {
  });

  return join(stat, contents, (stat, contents) => ({
    stat: stat,
    fileName: fileName,
    contents: contents
  }));

// The return value of .map is a promise that is fulfilled with an array of the mapped values
// That means we only get here after all the files have been statted and their contents read
// into memory. If you need to do more operations per file, they should be chained in the map
// callback for concurrency.
})
    .call("sort", (a, b) => a.fileName.localeCompare(b.fileName))

    .each(file => {
      const contentLength = file.stat.isDirectory() ? "(directory)" : file.contents.length + " bytes";
      console.log(file.fileName + " last modified " + file.stat.mtime + " " + contentLength)

    });



