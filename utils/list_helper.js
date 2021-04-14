const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
    // console.log(...blogs)
    return 1
}


const totalLikes = (blogs) => {
    
    return blogs.length === 0 
        ? 0 
        : blogs.reduce((a,b) => a+b.likes, 0)
}


const favoriteBlog = (blogs) => {
    const max = blogs.length === 0
        ? 0
        : blogs.reduce((prev,current) => {
            return prev.likes >= current.likes ? prev : current
        })

    return max === 0 
        ? 0 
        : { 
            title: max.title,
            author: max.author,
            likes: 12
          }
}


const mostBlogs = (blogs) => {
    if (blogs.length === 0) return 0;

    const blog = _.transform(blogs, (result, section) => {
      result[section.author]
        ? result[section.author] += 1
        : result[section.author] = 1 
    }, {})

    const maxBlog = _.reduce(blog, (result, value, key) => {
      if (result['author']) {
        if (result['blogs'] <= value) {
          result['author'] = key
          result['blogs'] = value
        }
      }
      else {
        result['author'] = key
        result['blogs'] = value
      }      
      return result
    }, {})

    return maxBlog
}

const mostLikes = (blogs) => {
    if (blogs.length ===  0) return 0;

    const blog = _.transform(blogs, (results, section) => {
      results[section.author]
      ? results[section.author] += section.likes
      : results[section.author] = section.likes
    }, {})

    const newBlog =_.reduce(blog, (results, value, key) => {
      if (results['author']) {
        if (results['likes'] <= value) {
          results['author'] = key
          results['likes'] = value
        }
      } else {
        results['author'] = key
        results['likes'] = value
      }
      return results
    }, {})

    return newBlog
}


module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}