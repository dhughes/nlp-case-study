## Natural Language Processing Case Study

This repository contains approximately six hours of work towards a simple program that can evaluate hotel reviews with positive reviews for a given topic.

This is an approximation of the breakdown of time spent working on this case study:

**May 8**

Worked for a few hours:
- Getting back up to speed with node.js
- Learning [Bluebird](http://bluebirdjs.com/docs/getting-started.html)
- Brainstormed nlp strategy (some unstructured stream-of-thought notes remain in notes.txt)

17:55 (5:55pm) - 19:22 (6:30pm) = 1:30
- Basic file reading
- Filtering reviews

**May 9**

08:15 - 09:56 = 1:45
- Everything else

Total time spent was around 6 hours, give or take.

## Usage

This code was written using Node.js with NPM for dependency management. If you don't have Node installed, you can use a package management tool like Homebrew or just download it from https://nodejs.org.

To test out this case study do the following:

* Clone the repository locally
* In the cloned directory run `npm install` to download and install dependencies.
* You can run the program itself by running `node nlp.js`. 

The program will prompt you for a search term. Enter a term and you will see the results returned. You can search as many time as you would like. Use `ctrl-c` to exit the program.

If you wish to add additional JSON data to search across, you can add as many JSON files as you wish in the project's `data` directory.

## Solution Explanation

I approached this project by first spending a lot of time thinking and brainstorming. I probably spent an hour, maybe more, just thinking about ideas, writing pesudocode, and debating the pros and cons of various approaches. In the end, I decided I had these constraints:

* Time (which I had been burning through)
* It was suggested that I should use a scripting language. I chose JavaScript because that's the scripting language I've had the most recent experience in. 
* I did not need to write this in a manner that would be applicable to a large scale production application.

This led me to the conclusion that the first thing I needed to do was to simply read and parse the JSON data into memory. I ended up using a library named Bluebird to allow me to load data asynchronously using promises. The use of promises shaped the rest of the program.

Once the data is loaded into memory I show a search prompt and wait for user input. Once received, the program analyzes the parsed JSON data in memory. It does so by breaking each review into individual sentences, including the title. Sentences that do not contain the search term are filtered out. Those that do contain the term are given a score. 

Scoring works by looking for positive, negative, and intensifier words from the semantics.json file. The positive and negative scores are summed and the result is multiplied by the sum of the intensifier, giving the sentence a final score.

Once all of the sentences are scored, the individual scores are summed to give the hotel an overall score. From there, the hotels are sorted based on their total score and the results are printed to the console, along with some basic details. 

## Solution Analysis

My solution works, but is infantile in many ways. The first way is that I'm processing the entire set of data in totality each time. For example, if I search for the word food two times in a row, all of the work done to score and sort the hotels is done two times. This wouldn't scale.

I would rather see an index where each word or phrase is associated with a hotel with a pre-calculated score. This score could be updated as new data arrives, and could be used to identify and sort the results quickly. I suspect that this is also a naive approach, but it would be a step in the right direction. 

Another problem is that the search term is matched across the entire sentence, regardless of word boundaries. So "room" matches "bathroom" or "broom". I'd like to match full words instead. However, this is also a challenge due to stemming. I think "room" _should_ match "rooms" but not necessarily "roominesses" or "brooming". Stemming is even more critical for understanding semantic meaning. Consider "perfect" and "perfectly" and "happy" vs "unhappy". 

I think this leads to the concept of synonyms too. As the case study says, staff and personnel are synonyms. I'm not taking that into account. Synonyms might also be useful for creating a larger set of positive, negative, and intensifier words, along with their stems. 

I did find a resource called [WordNet](https://wordnet.princeton.edu/wordnet/) from Princeton that appears to fit the bill.  It provides "synsets" which are collections of words that are often interchangeable. I didn't try to leverage this because I felt it might be outside the spirit of the case study. I do think it would be possible to use a database like this to make a fairly comprehensive set of words or phrases, their positive and negative connotations, and use that to analyze sentences and partial sentences in reviews to extract some basic meaning. How this data is stored and used to query for hotels is a different question.

Another challenge is that, even though I'm breaking reviews into sentences, the sentences are often complex. Consider this example from a search for "room": 

	My two night stay at the Shores was lovely on many levels: Great room, nice balcony, very pleasant staff members, good food at the restaurant, great fire pits out by the beach, nice pool, nice TV in the room, good safe, strong water pressure in the shower.

My program considers this a very positive review, giving it 21 points. However, while this one sentence does contain the word "room" and it has a positive word "great" associated with it, it should probably only get a score of 2, overall. The score is 21 because my program sees all of the other positive words and intensifiers and uses those to calculate the score as well.

Here is where we begin to enter into the problem of semantics and grammar. Frankly, this sentence _is_ a very positive review, just not of the room itself. But, how do I identify that fact from the information I have? I _could_ break the sentence apart further using comas. That would likely improve overall accuracy, but I can't depend on humans to use english correctly. (Much less that the review is actually _in_ english.)

I considered analyzing nearness to other words. Basically, I would establish a graph of words. If I see the word "great" near the word "room", then it would be given a higher score. IE: "great room" or "the room was great" would score higher than "Room was on 3rd floor and the spa downstairs was great." I'm honestly not sure how I'd model this yet, nor how I'd relate that information back to a specific hotel.

## Other Challenges

- The data wasn't entirely consistent. For example, one hotel didn't have a name. 
- The semantics.json file wasn't very robust.
- The semantics.json file contained an error; "bad" was listed as a positive word.

## Summary

Given more time, I could likely identify some reasonable strategies for analyzing and searching the hotel review data. Given access to existing research in this area and tools such as WordNet, I could probably do a much better job. 
