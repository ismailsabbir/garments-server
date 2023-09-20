const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const stripe = require("stripe")(process.env.SECRET_KEY);
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
    const ordercollection = client
      .db("garmentsinformation")
      .collection("order_info");
    const sizeollection = client
      .db("garmentsinformation")
      .collection("dress_size");
    const usercollection = client.db("garmentsinformation").collection("users");
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
    app.post("/requesed_order", async (req, res) => {
      const request_info = req.body;
      const result = await ordercollection.insertOne(request_info);
      res.send(request_info);
    });
    app.get("/dress_size", async (req, res) => {
      const query = {};
      const sizes = await sizeollection.find(query).toArray();
      res.send(sizes);
    });
    app.post("/create-payment-intent", async (req, res) => {
      const productinfo = req.body;
      const price = productinfo.total_price;
      console.log(price);
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "bdt",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
    app.put(`/payment/:id`, async (req, res) => {
      const id = parseInt(req.params.id);
      const paymentinfo = req.body;
      const options = { upsert: true };
      const filter = { orderid: id };
      console.log(typeof id);
      const updateorder = {
        $set: {
          order: "paid",
          transiction_id: paymentinfo.transiction_id,
        },
      };
      const result = await ordercollection.updateOne(
        filter,
        updateorder,
        options
      );

      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usercollection.insertOne(user);
      res.send(user);
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
