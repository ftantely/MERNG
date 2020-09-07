const jwt = require('jsonwebtoken');
const {AuthenticationError} = require('apollo-server')
const {SECRET_KEY} = require('../config');

module.exports = (context) => {
    const authHead = context.req.headers.authorization;
    if(authHead){
        const token = authHead.split('Bearer ')[1];
        if(token){
            try {
                const user = jwt.verify(token, SECRET_KEY);
                return user;
            } catch (e) {
                throw new AuthenticationError('Invalid/Expired token')
            }
        }
        throw new Error('Authentication token must be "Bearer [token]"')
    }
    throw new Error('Authorization header  must be provided')
}