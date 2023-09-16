const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.3w5podw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
async function run() {
  await client.connect();
  try {
    console.log("mongodb database connected");
    const servicescollections = client
      .db("garmentsinformation")
      .collection("services");
    const projectscollections = client
      .db("garmentsinformation")
      .collection("projects");
    const blogcollections = client
      .db("garmentsinformation")
      .collection("blogs");
    const membercollections = client
      .db("garmentsinformation")
      .collection("members");
    const categorycollections = client
      .db("garmentsinformation")
      .collection("project-category");

    const categorydetailscollections = client
      .db("garmentsinformation")
      .collection("category-details");
    const qualitycollections = client
      .db("garmentsinformation")
      .collection("quality");
    const colorproductcollections = client
      .db("garmentsinformation")
      .collection("colorproducts");
    app.get("/services", async (req, res) => {
      const query = {};
      const services = await servicescollections.find(query).toArray();
      res.send(services);
    });
    app.get("/serviceDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const service = await servicescollections.findOne(query);
      res.send(service);
    });
    app.get("/projects", async (req, res) => {
      const query = {};
      const projects = await projectscollections.find(query).toArray();
      res.send(projects);
    });
    app.get("/projectDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const project = await projectscollections.findOne(query);
      res.send(project);
    });
    app.get("/project-category", async (req, res) => {
      const query = {};
      const category = await categorycollections.find(query).toArray();
      res.send(category);
    });
    app.get(`/customized-details/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { category_id: id };
      const category = await categorydetailscollections.findOne(query);
      res.send(category);
    });
    app.get("/colorproducts", async (req, res) => {
      const categoryid = req.query.category_id;
      const colorid = req.query.colorid;
      const query = {
        category_id: categoryid,
      };
      const products = await colorproductcollections.find(query).toArray();
      const colorproduct = products.filter(
        (product) => product.color_id === colorid
      );
      res.send(colorproduct);
    });
    app.get("/quality", async (req, res) => {
      const query = {};
      const quality = await qualitycollections.find(query).toArray();
      res.send(quality);
    });
    app.get("/blogs", async (req, res) => {
      const query = {};
      const blogs = await blogcollections.find(query).toArray();
      res.send(blogs);
    });
    app.get("/members", async (req, res) => {
      const query = {};
      const members = await membercollections.find(query).toArray();
      res.send(members);
    });

    app.get("/", (req, res) => {
      res.send("Hello Garment Management server!");
    });
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}
run();
