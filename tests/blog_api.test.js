const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./api_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeAll(async () => {
    await User.deleteMany({})

    const user = {
        username: "username",
        name: 'name',
        password: 'password'
    }

    await api
        .post('/api/users')
        .send(user)
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)

})

describe('when there is initially some blogs saved', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('a specific blog is within the blogs', async () => {
        const response = await api.get('/api/blogs')
        
        const title = response.body.map(blog => blog.title)
        expect(title).toContain("The poop that took a pee")
    })
})

describe('viewing a specific blog', () => {
    test('blog contains an id variable', async () => {
        const response = await api.get('/api/blogs')
        const id = response.body.map(res => res.id)
        expect(id).toBeDefined()
    })

    test('failure', async () => {
        const id = "606fbdb7690f7e3ba43ddb8d"

        await api
            .get(`/api/blogs/${id}`)
            .expect(404)
    })
})

describe('addition of new notes', () => {
    test('succeeds with adding valid data', async () => {
        const user = {
            username: 'username',
            password: 'password'
        }

        const login = await api
                .post('/api/login')
                .send(user)
                .set('Accept', 'application/json')
                .expect('Content-Type', /application\/json/)
        
        const blog = {
            title: 'a new title',
            author: 'a new author',
            url: 'www.newstuff.com',
            likes: 23
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${login.body.token}`)
            .send(blog)
            .expect(200)
            .expect('Content-Type', /application\/json/)


        const response = await helper.blogsInDb()
        expect(response).toHaveLength(helper.initialBlogs.length + 1)
        
        const title = response.map(res => res.title)
        expect(title).toContain('a new title')
    })

    test('missing likes default is 0', async () => {
        const user = {
            username: 'username',
            password: 'password'
        }

        const login = await api
                .post('/api/login')
                .send(user)
                .expect(200)
                .expect('Content-Type', /application\/json/)
        
        const blog = {
            title: 'a new title',
            author: 'a new author',
            url: 'www.newstuff.com',
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${login.body.token}`)
            .send(blog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const response = await helper.blogsInDb();
        const likes = response.map(res => res.likes)
        expect(likes[likes.length-1]).toBe(0)
    })

    test('must include title and url', async () => {
        const user = {
            username: 'username',
            password: 'password'
        }

        const login = await api
                .post('/api/login')
                .send(user)
                .expect(200)
                .expect('Content-Type', /application\/json/)
        
        const blog = {
            author: 'a new author',
            likes: 23
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${login.body.token}`)
            .send(blog)
            .expect(400)

        const response = await helper.blogsInDb()
        expect(response).toHaveLength(helper.initialBlogs.length)
    })

    test('post fails if token is not authorized', async () => {
        const blog = {
            title: 'a new title',
            author: 'a new author',
            url: 'www.newstuff.com',
        }

        await api
            .post('/api/blogs')
            .send(blog)
            .expect(401)

        const response = await helper.blogsInDb()
        expect(response).toHaveLength(helper.initialBlogs.length)
    })
})

describe('deletion of a note', () => {
    test('succeed with status code 204 if id is valid', async () => {
        const user = {
            username: 'username',
            password: 'password'
        }

        const login = await api
                .post('/api/login')
                .send(user)
                .expect(200)
                .expect('Content-Type', /application\/json/)

        const blog = {
            title: 'a new title',
            author: 'a new author',
            url: 'www.newstuff.com',
            likes: 23
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${login.body.token}`)
            .send(blog)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
        
        const blogAtStart = await helper.blogsInDb()
        console.log(blogAtStart)
        const blogToDelete = blogAtStart[2]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${login.body.token}`)
            .expect(204)

        const blogAtEnd = await helper.blogsInDb()
        expect(blogAtEnd).toHaveLength(helper.initialBlogs.length)

        const deletedBlog = blogAtEnd.map(blog => blog.title)
        expect(deletedBlog).not.toContain(blogToDelete.title)
    })
})


afterAll(() => {
    mongoose.connection.close()
})

