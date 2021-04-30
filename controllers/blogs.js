const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({}).populate('user', { username: 1, name: 1 })
    
    response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    blog ? response.json(blog) : response.status(404).end()
    
})

blogRouter.post('/', userExtractor, async (request, response, next) => {
    try {
        const body = request.body
        const user = request.user

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user.id
        })

        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog.id)
        await user.save()
        response.json(savedBlog)
        
    } catch (exception) {
        next(exception)
    } 
})

blogRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    } 

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
})

blogRouter.delete('/:id', userExtractor, async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id)
        const user = request.user

        if (blog.user.toString() === user._id.toString()) {
            await Blog.findByIdAndRemove(request.params.id)
            response.status(204).end()
        }

    } catch(exception) {
        next(exception)
    }
})

module.exports = blogRouter;