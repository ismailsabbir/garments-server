const express = require("express");
var jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const stripe = require("stripe")(process.env.SECRET_KEY);
const SSLCommerzPayment = require("sslcommerz-lts");
const { MongoClient, ObjectId } = require("mongodb");
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false;
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.3w5podw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
function verifyjwt(req, res, next) {
  const jwttokens = req.headers.authorization;
  if (!jwttokens) {
    return res.status(401).send({ message: "unautorized access" });
  }
  const token = jwttokens.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
    if (error) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

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
    const shopcategorycollection = client
      .db("garmentsinformation")
      .collection("shopcategory");
    // const shopproductcollection = client
    //   .db("garmentsinformation")
    //   .collection("shopproduct");
    const shopproductcollection = client
      .db("garmentsinformation")
      .collection("products");

    const shopordercollection = client
      .db("garmentsinformation")
      .collection("shoporder");
    const cartproductcollection = client
      .db("garmentsinformation")
      .collection("cartproduct");
    const wishlistproductcollection = client
      .db("garmentsinformation")
      .collection("wishlistproduct");
    const usercollection = client.db("garmentsinformation").collection("users");
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      // console.log(token);
      res.send({ token });
    });

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
    app.post("/shoporder", async (req, res) => {
      const request_info = req.body;
      const result = await shopordercollection.insertOne(request_info);
      res.send(request_info);
    });

    app.get("/dress_size", async (req, res) => {
      const query = {};
      const sizes = await sizeollection.find(query).toArray();
      res.send(sizes);
    });
    app.post("/cartproduct", async (req, res) => {
      const request_info = req.body;
      const result = await cartproductcollection.insertOne(request_info);
      res.send(request_info);
    });
    app.get("/cartproduct", verifyjwt, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      let Query = {};
      if (req.query.email) {
        Query = {
          email: req.query.email,
        };
      }
      const product = await cartproductcollection.find(Query).toArray();
      res.send(product);
    });
    app.get("/customized_orders", verifyjwt, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      let Query = {};
      if (req.query.email) {
        Query = {
          email: req.query.email,
        };
      }
      const product = await ordercollection.find(Query).toArray();
      res.send(product);
    });
    app.post("/wishlistproduct", async (req, res) => {
      const request_info = req.body;
      const result = await wishlistproductcollection.insertOne(request_info);
      console.log(result);
      res.send(request_info);
    });
    app.get("/wishlistproduct", async (req, res) => {
      let Query = {};
      if (req.query.email) {
        Query = {
          email: req.query.email,
        };
      }
      const product = await wishlistproductcollection.find(Query).toArray();
      res.send(product);
    });
    app.delete(`/wishlistproduct/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistproductcollection.deleteOne(query);

      res.send(result);
    });
    app.delete(`/cartproduct/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartproductcollection.deleteOne(query);

      res.send(result);
    });
    app.delete("/allcartproduct", async (req, res) => {
      const query = {};
      const result = await cartproductcollection.deleteOne(query);
      res.send(result);
    });
    app.post("/create-payment-intent", async (req, res) => {
      const productinfo = req.body;
      const price = productinfo.total_price;
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
    app.post(`/shop_bkash_payment`, async (req, res) => {
      const confirmdata = req.body;
      console.log(confirmdata);
      const transictionid = new ObjectId().toString();
      const { name, email, address } = confirmdata;
      if (!email || !name || !address) {
        return res.send({
          error: "Please Provide information",
        });
      }
      const data = {
        total_amount: confirmdata.total_price,
        currency: "BDT",
        tran_id: transictionid,
        success_url: `${process.env.SERVER_LINK}/payment/sucess?transiction_id=${transictionid}&orderid=${confirmdata.orderid}`,
        fail_url: `${process.env.SERVER_LINK}/payment/failed?transiction_id=${transictionid}&orderid=${confirmdata.orderid}`,
        cancel_url: `${process.env.SERVER_LINK}/payment/cancle`,
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "Courier",
        product_name: confirmdata.category_name,
        product_category: confirmdata.category_name,
        product_profile: "general",
        cus_name: confirmdata.name,
        cus_email: confirmdata.email,
        cus_add1: confirmdata.address,
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: confirmdata.postcode,
        cus_country: "Bangladesh",
        cus_phone: confirmdata.phone,
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };
      console.log(data);
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.send({ url: GatewayPageURL });
      });
    });

    app.post("/payment/sucess", async (req, res) => {
      const transiction_id = req.query.transiction_id;
      const orderid = parseInt(req.query.orderid);
      if (!transiction_id || !orderid) {
        return res.redirect(
          `${process.env.CLIENT_LINK}/payment/failed?orderid=${orderid}`
        );
      }
      const paydate = new Date();
      const result = await ordercollection.updateOne(
        { orderid },
        {
          $set: {
            order: "paid",
            transiction_id: transiction_id,
            paidAt: paydate,
          },
        }
      );
      if (result.modifiedCount > 0) {
        res.redirect(
          `${process.env.CLIENT_LINK}/payment/sucess/?transiction_id=${transiction_id}`
        );
      }
    });
    app.post("/payment/failed", async (req, res) => {
      const transiction_id = req.query.transiction_id;
      const orderid = parseInt(req.query.orderid);

      res.redirect(
        `${process.env.CLIENT_LINK}/payment/failed?orderid=${orderid}`
      );
    });

    app.post(`/product_bkash_payment`, async (req, res) => {
      const confirmdata = req.body;
      console.log(confirmdata);
      const transictionid = new ObjectId().toString();
      const { name, email, address } = confirmdata;
      if (!email || !name || !address) {
        return res.send({
          error: "Please Provide information",
        });
      }
      const data = {
        total_amount: confirmdata.total_price,
        currency: "BDT",
        tran_id: transictionid,
        success_url: `${process.env.SERVER_LINK}/product/payment/sucess?transiction_id=${transictionid}&orderid=${confirmdata.orderid}`,
        fail_url: `${process.env.SERVER_LINK}/product/payment/failed?transiction_id=${transictionid}&orderid=${confirmdata.orderid}`,
        cancel_url: `${process.env.SERVER_LINK}/payment/cancle`,
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "Courier",
        product_name: confirmdata.category_name,
        product_category: confirmdata.category_name,
        product_profile: "general",
        cus_name: confirmdata.name,
        cus_email: confirmdata.email,
        cus_add1: confirmdata.address,
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: confirmdata.postcode,
        cus_country: "Bangladesh",
        cus_phone: confirmdata.phone,
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };
      console.log(data);
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.send({ url: GatewayPageURL });
      });
    });

    app.post("/product/payment/sucess", async (req, res) => {
      const transiction_id = req.query.transiction_id;
      const orderid = parseInt(req.query.orderid);
      if (!transiction_id || !orderid) {
        return res.redirect(
          `${process.env.CLIENT_LINK}/product/payment/failed?orderid=${orderid}`
        );
      }
      const paydate = new Date();
      const result = await shopordercollection.updateOne(
        { orderid },
        {
          $set: {
            order: "paid",
            transiction_id: transiction_id,
            paidAt: paydate,
          },
        }
      );
      if (result.modifiedCount > 0) {
        res.redirect(
          `${process.env.CLIENT_LINK}/product/payment/sucess/?transiction_id=${transiction_id}`
        );
      }
    });
    app.post("/product/payment/failed", async (req, res) => {
      const transiction_id = req.query.transiction_id;
      const orderid = parseInt(req.query.orderid);

      res.redirect(
        `${process.env.CLIENT_LINK}/product/payment/failed?orderid=${orderid}`
      );
    });

    app.get("/order/by_transcation_id/:id", async (req, res) => {
      const { id } = req.params;
      const order = await ordercollection.findOne({ transiction_id: id });
      res.send(order);
    });
    app.get("/product/order/by_transcation_id/:id", async (req, res) => {
      const { id } = req.params;
      const order = await shopordercollection.findOne({ transiction_id: id });
      res.send(order);
    });
    app.get("/shoporder/by_transcation_id/:id", async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const order = await shopordercollection.findOne({ transiction_id: id });
      res.send(order);
    });
    app.get("/order/by_order_id/:id", async (req, res) => {
      const { id } = req.params;
      const orderid = parseInt(id);
      const order = await ordercollection.findOne({ orderid: orderid });
      res.send(order);
    });
    app.get("/product/order/by_order_id/:id", async (req, res) => {
      const { id } = req.params;
      const orderid = parseInt(id);
      console.log(orderid);
      const order = await shopordercollection.findOne({ orderid: orderid });
      res.send(order);
    });

    app.put(`/shoppayment/:id`, async (req, res) => {
      const id = parseInt(req.params.id);
      const paymentinfo = req.body;
      const options = { upsert: true };
      const filter = { orderid: id };
      const updateorder = {
        $set: {
          order: "paid",
          transiction_id: paymentinfo.transiction_id,
        },
      };
      const result = await shopordercollection.updateOne(
        filter,
        updateorder,
        options
      );

      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const userData = req.body;
      const emailToCheck = userData.email;
      const existingUser = await usercollection.findOne({
        email: emailToCheck,
      });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
      await usercollection.insertOne(userData);
      res.status(201).json({ message: "User created successfully" });
    });
    app.get("/shopcategory", async (req, res) => {
      const query = {};
      const shopcategory = await shopcategorycollection.find(query).toArray();
      res.send(shopcategory);
    });
    app.get("/shopproduct", async (req, res) => {
      const query = {};
      const shopproduct = await shopproductcollection.find(query).toArray();
      res.send(shopproduct);
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
