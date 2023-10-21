const _ = require('lodash');

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  const mostLikedBlog = blogs.reduce((max, blog) => blog.likes > max.likes ? blog : max, blogs[0])

  const result = {
    title: mostLikedBlog.title,
    author: mostLikedBlog.author,
    likes: mostLikedBlog.likes
  }
  return result
}

const mostBlogs = (blogs) => {
  const countedBlogs = _.countBy(blogs, 'author')
  const authorWithMostBlogs = _.maxBy(_.keys(countedBlogs), (author) => countedBlogs[author])
  const result = {
    author: authorWithMostBlogs,
    blogs: countedBlogs[authorWithMostBlogs]
  }

  return result
}

const mostLikes = (blogs) => {
  const blogsByAuthor = _.groupBy(blogs, 'author')
  const authorLikes = _.map(blogsByAuthor, (userBlogs, author) => ({
    author: author,
    likes: _.reduce(userBlogs, (total, blog) => total + blog.likes, 0)
  }))
  const result = _.maxBy(authorLikes, 'likes')
  return result
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}