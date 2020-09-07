const {ApolloServer} =  require('apollo-server');
const mongosse = require('mongoose');


const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers');
const {MONGODB} = require('./config');

const PORT = process.env.PORT || 4444

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context : ({req}) => ({req})

});


mongosse.connect(MONGODB,{useNewUrlParser:true, useUnifiedTopology: true})
    .then(() => {
        console.log(' ++++ MongoDB Connected')
        return server.listen({port:PORT});
    })
    .then(res =>{
        console.log(` ++++ Serve running at ${res.url}`)
    })
    .catch(err => {
        console.log(err)
    })