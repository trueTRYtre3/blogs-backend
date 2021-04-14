const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: "The poop that took a pee",
        author: "Morgan Freeman",
        url: "www.dogwhistle.com",
        likes: 69
    },
    {
        title: "Upside down",
        author: "Anonymous",
        url: "www.wagthedog.com",
        likes: 5090
    }
]

const initialUsers = [
    {
        username: "username",
        name: 'name',
        passwordHash: 'password'
    },
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogs,
    initialUsers,
    blogsInDb,
    usersInDb
}