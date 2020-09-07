const Post = require('../../models/Posts');
const {AuthenticationError, UserInputError} = require('apollo-server')
const checkAuth = require('../../util/check.auth');

module.exports = {
    Mutation : {
        async createComment (_, {postId, body}, context){
            const {username} = checkAuth(context);

            const post = await Post.findById(postId);
            if(post){
                post.comments.unshift({
                    username,
                    body,
                    createdAt : new Date().toISOString()
                });
                await post.save();
                return post;
            } else {
                throw new UserInputError('Post not found')
            }
        },
        async deleteComment (_, {postId, commentId}, context) {
            const {username} = checkAuth(context);

            const post = await Post.findById(postId);
            if(post){
                const commentIndex = post.comments.findIndex(c => c.id === commentId);
                if(post.comments[commentIndex].username === username){
                    post.comments.splice(commentIndex, 1)
                    await post.save();
                    return post
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } else {
                throw new UserInputError('Post not found')
            }
        }
    }
}

