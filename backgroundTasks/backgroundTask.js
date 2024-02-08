const Book = require('../models/Book')
const generateAPI = require('./externalAPI');

let startIndex = 0; // Initial startIndex value

async function fetchDataAndStore() {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error('API key is missing');
        }

        const maxResults = 40;
        const response = await generateAPI(startIndex, maxResults, apiKey);
        startIndex += 40;
        const externalBooks = response.data.items.map((item) => {
            return {
                id: item.id,
                title: item.volumeInfo.title,
                author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
                genres: item.volumeInfo.categories || [],
                synopsis: item.volumeInfo.description || 'No synopsis available',
                publicationDate: item.volumeInfo.publishedDate ? new Date(item.volumeInfo.publishedDate) : null,
                coverImage: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null,
            };
        });
        // Check for existing documents with the same IDs
        const existingBooks = await Book.find({ id: { $in: externalBooks.map(book => book.id) } });

        // Filter out books that already exist in the database
        const newBooks = []
        for (const book of externalBooks) {
            let isNew = true
            for (const existingBook of existingBooks) {
                if (book.id === existingBook.id) {
                    isNew = false;
                    break;
                }
            }
            if (isNew) {
                newBooks.push(book);
            }
        }

        // Insert new books into the database
        if (newBooks.length > 0) {
            await Book.create(newBooks);
            console.log(`${newBooks.length} new books added to the database`);
        } else {
            console.log('No new books found');
        }
    } catch (error) {
        console.error('Error fetching and storing data:', error);
    }
}

const fetchInterval = 60000; // 

setInterval(fetchDataAndStore, fetchInterval);

fetchDataAndStore();