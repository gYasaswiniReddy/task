const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const books = [];
const users = [];

const fetchBooks = async () => {
    const response = await axios.get('https://api.example.com/books');
    return response.data;
};

const getBookByISBN = (isbn) => {
    return books.find(book => book.isbn === isbn);
};

const getBooksByAuthor = (author) => {
    return books.filter(book => book.author.toLowerCase() === author.toLowerCase());
};

const getBooksByTitle = (title) => {
    return books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
};

const getBookReview = (isbn) => {
    const book = getBookByISBN(isbn);
    return book ? book.review : null;
};

app.get('/books', async (req, res) => {
    const bookList = await fetchBooks();
    res.json(bookList);
});

app.get('/books/isbn/:isbn', (req, res) => {
    const book = getBookByISBN(req.params.isbn);
    book ? res.json(book) : res.status(404).send('Book not found');
});

app.get('/books/author/:author', (req, res) => {
    const books = getBooksByAuthor(req.params.author);
    res.json(books);
});

app.get('/books/title/:title', (req, res) => {
    const books = getBooksByTitle(req.params.title);
    res.json(books);
});

app.get('/books/:isbn/review', (req, res) => {
    const review = getBookReview(req.params.isbn);
    review ? res.json({ review }) : res.status(404).send('Review not found');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    users.push({ username, password });
    res.send('User registered');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    user ? res.send('Login successful') : res.status(401).send('Invalid credentials');
});

app.post('/books/:isbn/review', (req, res) => {
    const { isbn } = req.params;
    const { username, review } = req.body;
    const user = users.find(u => u.username === username);
    const book = getBookByISBN(isbn);
    if (user && book) {
        book.review = review;
        res.send('Review added/modified');
    } else {
        res.status(404).send('Book or user not found');
    }
});

app.delete('/books/:isbn/review', (req, res) => {
    const { isbn } = req.params;
    const { username } = req.body;
    const user = users.find(u => u.username === username);
    const book = getBookByISBN(isbn);
    if (user && book && book.review) {
        delete book.review;
        res.send('Review deleted');
    } else {
        res.status(404).send('Book or review not found');
    }
});

const asyncGetBooks = async (callback) => {
    const books = await fetchBooks();
    callback(books);
};

const getBooksByPromise = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = getBookByISBN(isbn);
        book ? resolve(book) : reject('Book not found');
    });
};

app.get('/asyncBooks', (req, res) => {
    asyncGetBooks((books) => res.json(books));
});

app.get('/promiseBooks/:isbn', (req, res) => {
    getBooksByPromise(req.params.isbn)
        .then(book => res.json(book))
        .catch(err => res.status(404).send(err));
});

app.get('/authorBooks/:author', (req, res) => {
    const books = getBooksByAuthor(req.params.author);
    res.json(books);
});

app.get('/titleBooks/:title', (req, res) => {
    const books = getBooksByTitle(req.params.title);
    res.json(books);
});

app.listen(3000, () => console.log('Server started on port 3000'));
