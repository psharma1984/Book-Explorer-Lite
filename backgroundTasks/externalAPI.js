const axios = require('axios');
const randomSearchTerm = getRandomWord();


function getRandomWord() {
    // function to generate a random word 
    const words = [
        'science', 'fiction', 'history', 'technology', 'art', 'love', 'horror',
        'fantasy', 'adventure', 'mystery', 'romance', 'thriller', 'biography',
        'self-help', 'travel', 'cooking', 'business', 'finance', 'psychology',
        'philosophy', 'religion', 'politics', 'nature', 'health', 'fitness',
        'education', 'comics', 'graphic novels', 'sports', 'music', 'gardening',
        'parenting', 'crafts', 'diy', 'photography', 'architecture', 'design',
        'fashion', 'food', 'drinks', 'literature', 'poetry', 'journalism',
        'technology', 'programming', 'coding', 'web development', 'machine learning',
        'data science', 'artificial intelligence', 'blockchain', 'cybersecurity',
        'virtual reality', 'augmented reality', 'internet of things', 'cloud computing',
        'big data', 'digital marketing', 'social media', 'e-commerce', 'startup',
        'entrepreneurship', 'leadership', 'management', 'creativity', 'innovation',
        'communication', 'negotiation', 'time management', 'productivity', 'strategy',
        'critical thinking', 'problem solving', 'decision making', 'emotional intelligence'
    ];
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

const generateAPI = async (apiKey) => {
    try {
        console.log(randomSearchTerm);
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${randomSearchTerm}&key=${apiKey}`;
        const response = await axios.get(apiUrl);
        return response;
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching books from the external API');
    }
};

module.exports = generateAPI;