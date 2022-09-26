const express = require('express'); //import the express module
const app = express(); //initialize an instance of an express server
const morgan = require('morgan'); //import the morgan module
const { quotes } = require('./data'); //import the 'quotes' array

let id = quotes.length; //set an 'id' variable equal to the length of the 'quotes' array

const { getRandomElement } = require('./utils'); //import the 'getRandomElement' helper function

const PORT = process.env.PORT || 4001; //define the port that the express server will listen on

app.use(express.static('public')); //serve static files from the 'public' directory
app.use(
    express.urlencoded({
        extended: true
    })
);
app.use(express.json()); //facilitate the extraction of JSON data sent in the request body

app.get('/api/quotes', (req, res, next) => { //when a 'GET' request is received
    let response = { //define the shape of a success response object
        quotes: []
    }
   if(!req.query.person) { //if no 'person' variable was passed in the query string
        response.quotes = quotes; //set the 'quotes' property of the response object equal to the 'quotes' array
        res.send(response); //send the response object
    } else { //otherwise
        const person = req.query.person; //define a 'person' variable
        const personQuotes = quotes.filter((quote) => { //define a 'personQuotes' array that holds all the quotes attributed to the 'person'
            return quote.person.toLowerCase() === person.toLowerCase();
        });
        response.quotes = personQuotes; //set the 'quotes' property of the response object equal to the 'personQuotes' array
        res.send(response); //send the response object
    }
});

app.get('/api/quotes/random', (req, res, next) => { //when a 'GET' request is made for a random quote
    const randomQuote = getRandomElement(quotes); //define the random quote
    const response = { //define the success response object
        quote: randomQuote
    };
    res.send(response); //send the response
});

app.post('/api/quotes', (req, res, next) => { //when a 'POST' request is made in order to create a new quote
    const { person, quote, context, year } = req.query; //extract the query string variables
    let response = { //define the shape of a success response object
        quote: {}
    };
    if(person && quote && context && year) { //if the requisite variables evaluate to truthy
        id = quotes.length + 1; //create a new 'id' property for the quote, which is equal to the length of the 'quotes' array plus one
        const quoteToAdd = { //define a quote object to add to the 'quotes' array
            id: id,
            person: person,
            quote: quote,
            context: context,
            year: year
        };
        quotes.push(quoteToAdd); //add the quote object to the 'quotes' array
        response.quote = quoteToAdd; //define the 'quote' property of the response object
        res.status(201).send(response); //send the response object
    } else {
        res.status(400).send(); //otherwise, send a '400' error code response
    }
});

app.put('/api/quotes/:id', (req, res, next) => { //when a 'PUT' request is received...
    let { id } = req.params; //extract the 'id' parameter
    id = parseInt(id); //convert the 'id' variable from a string to an integer
    const { person, quote, context, year } = req.body; //extract the variables sent in the request body
    const quoteToUpdate = quotes.filter((quote) => { //filter the 'quotes' array by id, returning the quote to update in a single-element array
        return quote.id === id;
    })[0];
    let response = { //define the shape of a success response object
        quote: {}
    };
    if(quoteToUpdate && person && quote && context && year) { //if there is a quote with the given id and the 'person', 'quote', 'context', and 'year' variables evaluate to truthy
        const updatedQuote = { //define the updated quote
            id: id,
            person: person,
            quote: quote,
            context: context,
            year: year
        };
        const updateIndex = quotes.indexOf(quoteToUpdate); //define the index of the quote to update within the 'quotes' array
        quotes.splice(updateIndex, 1, updatedQuote); //update the relevant element of the 'quotes' array
        response.quote = updatedQuote; //set the 'quote' property of the response object
        res.status(201).send(response); //send the response object
    } else {
        res.status(400).send(); //otherwise, send a '400' error code response
    }
});

app.delete('/api/quotes/:id', (req, res, next) => { //when a 'DELETE' request is received
    const { id } = req.params; //extract the 'id' parameter
    const quoteToDelete = quotes.filter((quote) => { //filter the 'quotes' array by id, returning the quote to delete in a single-element array
        return quote.id === parseInt(id);
    })[0];
    if(quoteToDelete) { //if a quote with the given id was found in the 'quotes' array
        const deletionIndex = quotes.indexOf(quoteToDelete); //define the index of the quote to delete within the 'quotes' array
        quotes.splice(deletionIndex, 1); //delete the relevant element of the 'quotes' array
        for(let i = 0, j = 1; i < quotes.length; i++, j++) { //for the length of the 'quotes' array
            quotes[i].id = j; /* assign a new id number to all elements of the 'quotes' array, based on their index; this allows new quotes to be created
                                 with an id that is one greater than the length of the 'quotes' array, without id duplication */
        }
        res.status(204).send(); //send a '204 No Content' success status code
    } else {
        res.status(400).send(); //otherwise, send a '400' error code response
    }
});

app.listen(PORT); //start the express server
