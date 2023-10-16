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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}