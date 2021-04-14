const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./api_helper')
const User = require('../models/user')

beforeEach(async () => {
    await User.deleteMany({})
    const users = helper.initialUsers.map(user => new User(user))
    const promiseArray = users.map(u => u.save())
    await Promise.all(promiseArray)

})

test('retrieve users', async () => {
    await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const users = await helper.usersInDb()
    expect(users).toHaveLength(helper.initialUsers.length)
})

describe('creating new users', () => {
    test('creation succeeds with fresh username and password', async () => {
        const newUser = {
            username: 'Bubbles',
            name: 'Bobba Tea',
            password: 'badpassword'
        }
    
        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /json/)
    
            
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(helper.initialUsers.length + 1)
    
        const usernames = usersAtEnd.map(user => user.username)
        expect(usernames).toContain(newUser.username)
    })
    
    test('validation fails because password too short', async () => {
        
        const newUser = {
            username: 'Mo Bamba',
            password: '12'
        }
    
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('validation fails because username too short', async () => {
        
        const newUser = {
            username: 'Mo',
            password: '12345'
        }
    
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('validation fails because username is missing', async () => {
        const newUser = {
            name: 'newGuy',
            password: '12345'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })
})



afterAll((done) => {
    mongoose.connection.close()
    done()
})