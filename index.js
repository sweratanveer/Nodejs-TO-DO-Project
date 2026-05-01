import express from "express"
import { ObjectId } from "mongodb";
import path from "path"
import { MongoClient } from "mongodb"   // ✅ IMPORT FIX

const app = express()

const publicPath = path.resolve("public")
app.use(express.static(publicPath))
app.set("view engine", "ejs")

const dbName = "node-project"
const collectionName = "todo"
const url = "mongodb://127.0.0.1:27017"

// ✅ CORRECT CLIENT
const client = new MongoClient(url)

const connection = async () => {
    await client.connect()   // ✅ FIX
    return client.db(dbName)
}

app.use(express.urlencoded({ extended: false }));

app.get("/",  async (req, res) => {
    const db =await connection();
    const collection = db.collection(collectionName);
    const result = await collection.find().toArray();
    res.render("list",{result})
})

app.get("/add", (req, res) => {
    res.render("add")
})

app.get("/Update", (req, res) => {
    res.render("update")
})

app.post("/Update", (req, res) => {
    res.redirect("/")
})

app.post("/add", async (req, res) => {
    const db = await connection()
    const collection = db.collection(collectionName)

    const result = await collection.insertOne(req.body)  // ✅ await lagaya

    if (result) {
        res.redirect("/")
    } else {
        res.redirect("/add")
    }
})




app.get("/delete/:id", async (req, res) => {
    const db = await connection()
    const collection = db.collection(collectionName)

    const result = await collection.deleteOne({
        _id: new ObjectId(req.params.id)
    })  

    if (result) {
        res.redirect("/")
    } else {
        res.send("/some error")
    }
})

app.get("/Update/:id", async (req, res) => {
    const db = await connection()
    const collection = db.collection(collectionName);
    const result = await collection.findOne({
        _id: new ObjectId(req.params.id)
    })  
    console.log(result)

    if (result) {
        res.render("Update", {result})
    } else {
        res.send("/some error")
    }
})

app.post("/Update/:id", async (req, res) => {
    const db = await connection()
    const collection = db.collection(collectionName)

    // correct filter
    const filter = { _id: new ObjectId(req.params.id) }

    // correct update data
    const UpdateData = {
        $set: {
            taskTitle: req.body.taskTitle,
            taskDescription: req.body.taskDescription,
            dueDate: req.body.dueDate,
            priority: req.body.priority
        }
    }

    // update query
    const result = await collection.updateOne(filter, UpdateData)

    if (result.modifiedCount > 0) {
        res.redirect("/")
    } else {
        res.send("some error")
    }
})

app.post("/delete-multiple", async (req, res) => {
    const db = await connection()
    const collection = db.collection(collectionName)

    const ids = req.body.taskIds

    // agar ek hi checkbox select ho
    const idArray = Array.isArray(ids) ? ids : [ids]

    await collection.deleteMany({
        _id: { $in: idArray.map(id => new ObjectId(id)) }
    })

    res.redirect("/")
})

app.listen(3200, () => {
    console.log("Server running on port 3200")
})


