const axios = require('axios');
const Book = require('../models/Book');

const generateAPI = async (apiKey, startIndex = 0, maxResults = 10) => {
    try {
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=random&startIndex=${startIndex}&maxResults=${maxResults}&key=${apiKey}`;

        const response = await axios.get(apiUrl);
        return response;
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching books from the external API');
    }
};

module.exports = generateAPI;