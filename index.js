// const express = require("express");
// const app = express();
// const cors = require("cors");
// const port = process.env.PORT || 5000;

// require("dotenv").config();
// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("server ok ");
// });

// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.esfshrg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//     const data = client.db("task-manager").collection("all-task");
//     // make a post
//     app.post("/task", async (req, res) => {
//       const task = req.body;
//       const result = await data.insertOne(task);
//       res.send(result);
//     });
//     // make a get
//     app.get("/task", async (req, res) => {
//       const tasks = await data.find().toArray();
//       res.send(tasks);
//     });
//     // make a put
//     app.put("/task/:id", async (req, res) => {
//       const { id } = req.params;
//       const task = req.body;
//       const result = await data.updateOne(
//         { _id: new ObjectId(id) },
//         { $set: task }
//       );
//       res.send(result);
//     });
//     // make a delete
//     app.get("/task/:id", async (req, res) => {
//       const { id } = req.params;
//       const result = await data.findOne({ _id: new ObjectId(id) });
//       res.send(result);
//     });

//     // DELETE route to delete a task by ID

//     app.delete("/task/:id", async (req, res) => {
//       const id = req.params.id;
//       const result = await data.deleteOne({
//         _id: new ObjectId(id),
//       });

//       res.send(result);
//     });
//     //
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.esfshrg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect to MongoDB
    // await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("task-manager");
    const tasksCollection = db.collection("all-task");

    // Routes
    app.get("/", (req, res) => {
      res.send("Task Manager Server is Running");
    });

    // Create a new task
    app.post("/task", async (req, res) => {
      try {
        const task = req.body;
        if (!task.title || !task.status) {
          return res
            .status(400)
            .send({ error: "Title and status are required" });
        }
        const result = await tasksCollection.insertOne(task);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // Get all tasks
    app.get("/task", async (req, res) => {
      try {
        const tasks = await tasksCollection.find().toArray();
        res.send(tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // Update a task by ID
    app.put("/task/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const task = req.body;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: "Invalid task ID" });
        }
        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: task }
        );
        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Task not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // Get a single task by ID
    app.get("/task/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: "Invalid task ID" });
        }
        const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
        if (!task) {
          return res.status(404).send({ error: "Task not found" });
        }
        res.send(task);
      } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // Delete a task by ID
    app.delete("/task/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: "Invalid task ID" });
        }
        const result = await tasksCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Task not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // Ping MongoDB to confirm connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged MongoDB. Connection is healthy!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
}

run().catch(console.dir);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
