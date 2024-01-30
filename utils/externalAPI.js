const axios = require('axios');
const Book = require('../models/Book');

const generateAPI = async (apiKey) => {
    try {
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=popular&key=${apiKey}`;

        const response = await axios.get(apiUrl);

        const externalBooks = response.data.items.map((item) => {
            return {
                title: item.volumeInfo.title,
                author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
                genres: item.volumeInfo.categories || [],
                synopsis: item.volumeInfo.description || 'No synopsis available',
                publicationDate: item.volumeInfo.publishedDate ? new Date(item.volumeInfo.publishedDate) : null,
                coverImage: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null,
            };
        });

        await Book.deleteMany({});
        await Book.create(externalBooks);

        const books = await Book.find();

        return books;
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching books from the external API');
    }
};

module.exports = generateAPI;