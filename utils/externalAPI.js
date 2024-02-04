const axios = require('axios');
const Book = require('../models/Book');
const randomSearchTerm = getRandomWord();


function getRandomWord() {
    // function to generate a random word (you can use an external service or a predefined list)
    // For simplicity, let's use a predefined list in this example
    const words = ['science', 'fiction', 'history', 'technology', 'art', 'love', 'horror'];
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

const generateAPI = async (apiKey, startIndex = 0, maxResults = 10) => {
    try {
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${randomSearchTerm}&startIndex=${startIndex}&maxResults=${maxResults}&key=${apiKey}`;

        const response = await axios.get(apiUrl);
        return response;
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching books from the external API');
    }
};

module.exports = generateAPI;