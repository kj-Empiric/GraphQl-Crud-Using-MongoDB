const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");

module.exports.initDatabase = async function initDatabase() {
  try {
    const mongoClient = await client.connect();

    const database = mongoClient.db("Graphql-MongoDB-Crud");

    const usersCollection = database.collection("Crud");

    async function findUserById(userId) {
      return await usersCollection.findOne({ id: userId });
    }

    async function fetchAllUsers() {
      return await usersCollection.find({}).toArray();
    }

    async function createUser(name, birthday, email, todos) {
      const userId = new ObjectId().toString();

      const createdUser = {
        id: userId,
        name,
        birthday,
        email,
        todos,
      };

      const createResult = await usersCollection.insertOne(createdUser);

      return { ...createResult, userId };
    }

    async function checkTodo(userId, todoId) {
      let userData = await findUserById(userId);

      if (userData == null) {
        return false;
      }

      let updateOperation = {
        $set: {
          todos: userData.todos.map((todo) =>
            todo.id === todoId ? { ...todo, checked: !todo.checked } : todo
          ),
        },
      };

      let updateResult = await usersCollection.updateOne(
        { id: userId },
        updateOperation
      );

      return updateResult.modifiedCount == 1;
    }

    async function deleteUserById(userId) {
      const deleteResult = await usersCollection.deleteOne({ id: userId });

      return deleteResult.deletedCount == 1;
    }

    async function deleteAllCheckedTodos(userId) {
      let userData = await findUserById(userId);

      if (userData == null) {
        return false;
      }

      let deleteOperation = {
        $set: {
          todos: userData.todos.filter((todo) => !todo.checked),
        },
      };

      let deleteResult = await usersCollection.updateOne(
        { id: userId },
        deleteOperation
      );

      return deleteResult.acknowledged;
    }

    return {
      fetchAllUsers,
      createUser,
      findUserById,
      checkTodo,
      deleteUserById,
      deleteAllCheckedTodos,
    };
  } catch (error) {
    client.close();

    throw error;
  }
};