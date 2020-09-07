const { AuthenticationError, UserInputError } = require('apollo-server');

const Post = require('../../models/Posts');
const checkAuth = require('../../util/check.auth');

module.exports = {
    Query: {
        async getPosts (){
            const post = await Post.find();
           return post ;

        },

        async getPost (_, {postId}){
            try {
                const post = await Post.findById(postId);
                post.save();
                return post;
            } catch (e) {
                throw new UserInputError('Post not found')
            }

        }
    },

    Mutation : {
        async createPost (_, {body}, context){
            const user = checkAuth(context);
            if(body.trim() === ''){
                throw new UserInputError('Post body must not be empty')
            }

            const newPost = new Post({
                user : user.id,
                username : user.username,
                body,
                createdAt : new Date().toISOString()
            });

            const post = await newPost.save();
            return post;

        },
        async deletePost (_, {postId}, context){
            const {username} = checkAuth(context);

            const post = await Post.findById(postId);
            if(post){
                if(username === post.username){
                    post.delete();
                    return 'Post deleted successfully'
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } else {
                throw new UserInputError('Post not found')
            }
        },
        async likePost (_, {postId}, context){
            const {username} =  checkAuth(context);

            const post = await Post.findById(postId);

            if(post){
                if(post.likes. find( like => like.username === username)){
                    post.likes = post.likes.filter( like => like.username !== username);
                    await post.save();
                    return post
                } else {
                    post.likes.push({
                        username,
                        createdAt : new Date().toISOString()
                    });
                    await post.save();
                    return post
                }

            }
        }
    }


}