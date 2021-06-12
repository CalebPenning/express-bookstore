// integration tests

process.env.NODE_ENV = "test"

const request = require("supertest")

const app = require("../app")
const db = require("../db")

// isbn of test book
let bookIsbn

beforeEach(async () => {
    let result = await db.query(`
    INSERT INTO
        books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES(
            '123411223',
            'https://amazon.com/book',
            'Caleb',
            'english',
            300,
            'Self Published',
            'book', 2020)
        RETURNING isbn`)
    bookIsbn = result.rows[0].isbn 
})

describe("POST /books", async () => {
    test("Creates a new book", async () => {
        const response = await request(app)
            .post(`/books`)
            .send({
                isbn: "12314212",
                amazon_url: "https://book.com",
                author: "tester",
                language: "english",
                pages: 113,
                publisher: "good at business",
                title: "hilarious book",
                year: 2041
            })
        expect(response.statusCode).toBe(201)
        expect(response.body.book).toHaveProperty("isbn")
    })

    test("Prevents creating book without required title", async () => {
        const response = await request(app)
            .post(`/books`)
            .send({year: 2222})
        expect(response.statusCode).toBe(400)
    })
})

describe("GET /books", async () => {
    test("Gets a list of 1 book", async () => {
        const response = await request(app).get(`/books`)
        const books = response.body.books
        expect(books).toHaveLength(1)
        expect(books[0]).toHaveProperty("isbn")
        expect(books[0]).toHaveProperty("amazon_url")
    })
})

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
});
  
  
afterAll(async function () {
    await db.end()
});
  