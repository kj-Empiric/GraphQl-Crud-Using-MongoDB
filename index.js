const { ApolloServer } = require("apollo-server");

const { initGraphql } = require("./graphql");

async function main() {
  const { resolvers, typeDefs } = await initGraphql();

  const server = new ApolloServer({
    resolvers,
    typeDefs,
  });

  const port = 3000;

  await server.listen(port);

  console.log(`Go to http://localhost:${port}/graphql`);
}

main();