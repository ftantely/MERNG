const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {UserInputError} = require('apollo-server');


const {validateRegisterInput, validateLoginInput} = require('../../util/validators')
const {SECRET_KEY} = require('../../config')
const User = require('../../models/User');

module.exports = {
    Mutation : {
        async register (
            _, {
                registerInput:{username, email, password, confirmPassword}
            }
        ){
            const {errors, valid} = validateRegisterInput(username, email, password, confirmPassword);
            if(!valid) {
                throw new UserInputError('Errors', {errors})
            }
            // Validate user
            // Make sure username doesn't already exist
            const user = await User.findOne({username});
            if(user){
                throw new UserInputError("Username is already taken",
                    {errors : {username:'This username is alerady taken'}})
            }
            // Hash password
            password = await bcrypt.hash(password, 12)
            const newUser = new User({
                username,
                email,
                password,
                createdAt : new Date().toISOString()
            });
            const res = await newUser.save();


            const token = jwt.sign(
                {
                    id : res.id,
                    username : res.username,
                    email : res.email,
                },
                SECRET_KEY,
                {expiresIn : '1h'}
            );
            return {
                ...res._doc,
                id : res._id,
                token
            }
        },
        async login (_, {username, password}) {
            const {errors, valid} = validateLoginInput(username,password);
            if(!valid) {
                throw new UserInputError('Errors', {errors})
            }

            const user = await User.findOne({username});
            if(!user){
                errors.general = 'User not found'
                throw new UserInputError('User not found', {errors})
            }

            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = 'Wrong credentials'
                throw new UserInputError('Wrong credentials', {errors})
            }
            const token = jwt.sign(
                {
                    id : user.id,
                    username : user.username,
                    email : user.email,
                },
                SECRET_KEY,
                {expiresIn:'1h'}
            );
            return {
                ...user._doc,
                id : user._id,
                token
            }


        }

    }
}