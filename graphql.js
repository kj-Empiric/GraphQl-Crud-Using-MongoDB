const { gql } = require("apollo-server");
const { initDatabase } = require("./database");

module.exports.initGraphql = async function initGraphql() {
  const databaseActions = await initDatabase();

  const typeDefs = gql`
    type Query {
      users: [User]!
    }

    type User {
      id: String!
      name: String!
      birthday: String!
      email: String!
      todos: [Todo]!
    }

    type Todo {
      id: String!
      content: String!
      checked: Boolean!
    }

    type Mutation {
      createUser(userInfo: UserInfo!): String
      checkTodo(userId: String!, todoId: String!): String
      deleteUser(userId: String!): String
      deleteAllCheckedTodos(userId: String!): String
    }

    input UserInfo {
      name: String!
      birthday: String!
      email: String!
      todos: [TodoInput]!
    }

    input TodoInput {
      id: String!
      content: String!
      checked: Boolean!
    }
  `;

  const resolvers = {
    Query: {
      users: async () => {
        return await databaseActions.fetchAllUsers();
      },
    },
    Mutation: {
      createUser: async (_, { userInfo }) => {
        const { name, birthday, email, todos } = userInfo;

        const createResult = await databaseActions.createUser(
          name,
          birthday,
          email,
          todos
        );

        if (!createResult.acknowledged) {
          return "An error occured";
        }

        return `Created USer with ID ${createResult.userId}`;
      },
      checkTodo: async (_, { userId, todoId }) => {
        let updateResult = await databaseActions.checkTodo(userId, todoId);

        if (!updateResult) {
          return "An error occurred";
        }

        return `Checked todo of ID ${todoId} of user with ID ${userId}`;
      },
      deleteUser: async (_, { userId }) => {
        let deleteResult = await databaseActions.deleteUserById(userId);

        if (!deleteResult) {
          return "An error occurred";
        }

        return `Deleted user with ID ${userId}`;
      },
      deleteAllCheckedTodos: async (_, { userId }) => {
        let deleteResult = await databaseActions.deleteAllCheckedTodos(userId);

        if (!deleteResult) {
          return "An error occurred";
        }

        return `Deleted all checked todos in user with ID ${userId}`;
      },
    },
  };

  return {
    typeDefs,
    resolvers,
  };
};