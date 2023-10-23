const express = require("express");
// const natural = require("natural");
var jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const nodemailer = require("nodemailer");
// const image = require("./Images/Logo.png");
const stripe = require("stripe")(process.env.SECRET_KEY);
const SSLCommerzPayment = require("sslcommerz-lts");
const { MongoClient, ObjectId, Admin } = require("mongodb");
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false;
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
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

const sendemail = (emaildata, emeil) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to: emeil,
    subject: emaildata?.subject,
    html: `
    <html>
    <head>
      <title>Order Confirmation</title>
      <link rel="stylesheet" type="text/css" href="/design.css">
    </head>
    <body>
      <div style="background-color: #F4F7F8; padding: 10px; text-align: center; font-size: 15px;">
        <p style="color: blue; font-size: 1.1rem; font-weight: 500;">Order id# ${emaildata?.message.orderid}</p>
        <h5>Your Order is Confirmed</h5>
        <p>Date Ordered:${emaildata.message.order_date}</p>
        <p>Shipping Address</p>
        <p>${emaildata?.message?.name}</p>
        <p>Adress #.${emaildata?.message?.address},${emaildata?.message?.postcode}</p>
        <p>Mob: ${emaildata?.message.phone}</p>
        <p>Email: ${emaildata?.message.email}</p>
      </div>
    </body>
  </html>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      // do something useful
    }
  });
};

const sendsucessemail = (emaildata, emeil) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to: emeil,
    subject: emaildata?.subject,
    html: `
    <html>
    <head>
      <title>Order Confirmation</title>
      <link rel="stylesheet" type="text/css" href="/design.css">
    </head>
    <body>
      <div style="background-color: #F4F7F8; padding: 10px; text-align: center; font-size: 15px;">
        <p style="color: blue; font-size: 1.1rem; font-weight: 500;">Order id# ${emaildata?.message.orderid}</p>
        <h5>Your Order is Confirmed</h5>
        <p>Date Ordered:${emaildata.message.order_date}</p>
        <p>Order: ${emaildata?.message.order}</p>
        <p>Transaction id: ${emaildata.message.transiction_id}</p>
        <p>Shipping Address</p>
        <p>${emaildata?.message?.name}</p>
        <p>Adress #.${emaildata?.message?.address},${emaildata?.message?.postcode}</p>
        <p>Mob: ${emaildata?.message.phone}</p>
        <p>Email: ${emaildata?.message.email}</p>
      </div>
    </body>
  </html>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      // do something useful
    }
  });
};

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
    const shopprod1uctcollection = client
      .db("garmentsinformation")
      .collection("products");

    const shopproductcollection = client
      .db("garmentsinformation")
      .collection("shopproduct");

    const shopordercollection = client
      .db("garmentsinformation")
      .collection("shoporder");
    const cartordercollection = client
      .db("garmentsinformation")
      .collection("cartorder");

    const cartproductcollection = client
      .db("garmentsinformation")
      .collection("cartproduct");
    const wishlistproductcollection = client
      .db("garmentsinformation")
      .collection("wishlistproduct");
    const addresscollection = client
      .db("garmentsinformation")
      .collection("address");
    const usercollection = client.db("garmentsinformation").collection("users");
    const staffcollection = client
      .db("garmentsinformation")
      .collection("staff-info");
    const verifyAdmin = async (req, res, next) => {
      const decodedemail = req.decoded.email;
      const query = {
        email: decodedemail,
      };
      const user = await staffcollection.findOne(query);
      if (user?.role !== "admin") {
        return res.status(403).send({ message: "farbidden access" });
      }
      next();
    };
    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usercollection.updateOne(filter, updatedoc, option);
      res.send(result);
    });

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
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
      sendemail(
        {
          subject: `Order Confirm`,
          message: request_info,
        },
        request_info?.email
      );
      const result = await ordercollection.insertOne(request_info);
      res.send(request_info);
    });
    app.post("/shoporder", async (req, res) => {
      const request_info = req.body;
      const result = await shopordercollection.insertOne(request_info);
      sendemail(
        {
          subject: `Order Confirm`,
          message: request_info,
        },
        request_info?.email
      );
      res.send(request_info);
    });
    app.post("/cartorder", async (req, res) => {
      const request_info = req.body;
      const result = await cartordercollection.insertOne(request_info);
      sendemail(
        {
          subject: `Order Confirm`,
          message: request_info,
        },
        request_info?.email
      );
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
    app.get("/mycartproduct", verifyjwt, async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const search = parseInt(req.query.search);
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
      let product = await cartproductcollection
        .find(Query)
        .skip(page * size)
        .limit(size)
        .toArray();
      let count = await cartproductcollection.estimatedDocumentCount();
      res.send({ count, product });
    });
    app.get("/mywishproduct", verifyjwt, async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const search = parseInt(req.query.search);
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
      let product = await wishlistproductcollection
        .find(Query)
        .skip(page * size)
        .limit(size)
        .toArray();
      let count = await wishlistproductcollection.estimatedDocumentCount();

      res.send({ count, product });
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
      sendemail(
        {
          subject: `Order Confirm`,
          message: request_info,
        },
        request_info?.email
      );
      const product = await ordercollection.find(Query).toArray();
      res.send(product);
    });
    app.post("/wishlistproduct", async (req, res) => {
      const request_info = req.body;
      const result = await wishlistproductcollection.insertOne(request_info);
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
      const result = await cartproductcollection.deleteMany(query);
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
      const orderdata = await ordercollection.findOne({
        transiction_id: paymentinfo.transiction_id,
      });
      sendsucessemail(
        {
          subject: `Order & Payment Sucessfully !!!`,
          message: orderdata,
        },
        orderdata?.email
      );
      res.send(result);
    });
    app.post(`/shop_bkash_payment`, async (req, res) => {
      const confirmdata = req.body;
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
    app.post(`/cart_bkash_payment`, async (req, res) => {
      const confirmdata = req.body;

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
        success_url: `${process.env.SERVER_LINK}/cart/payment/sucess?transiction_id=${transictionid}&orderid=${confirmdata.orderid}`,
        fail_url: `${process.env.SERVER_LINK}/cart/payment/failed?transiction_id=${transictionid}&orderid=${confirmdata.orderid}`,
        cancel_url: `${process.env.SERVER_LINK}/payment/cancle`,
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "Courier",
        product_name: "confirmdata.category_name",
        product_category: "confirmdata.category_name",
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
    app.post("/cart/payment/sucess", async (req, res) => {
      const transiction_id = req.query.transiction_id;
      const orderid = parseInt(req.query.orderid);

      if (!transiction_id || !orderid) {
        return res.redirect(
          `${process.env.CLIENT_LINK}/cart/payment/failed?orderid=${orderid}`
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
        const orderdata = await shopordercollection.findOne({
          transiction_id: transiction_id,
        });
        sendsucessemail(
          {
            subject: `Order & Payment Sucessfully !!!`,
            message: orderdata,
          },
          orderdata?.email
        );

        res.redirect(
          `${process.env.CLIENT_LINK}/cart_payment_sucess/?transiction_id=${transiction_id}`
        );
      }
    });
    app.post("/cart/payment/failed", async (req, res) => {
      const transiction_id = req.query.transiction_id;
      const orderid = parseInt(req.query.orderid);

      res.redirect(
        `${process.env.CLIENT_LINK}/cart/payment/failed?orderid=${orderid}`
      );
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
        const orderdata = await ordercollection.findOne({
          transiction_id: transiction_id,
        });
        sendsucessemail(
          {
            subject: `Order & Payment Sucessfully !!!`,
            message: orderdata,
          },
          orderdata?.email
        );
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
        const orderdata = await shopordercollection.findOne({
          transiction_id: transiction_id,
        });
        console.log(orderdata);
        sendsucessemail(
          {
            subject: `Order & Payment Sucessfully !!!`,
            message: orderdata,
          },
          orderdata?.email
        );

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

      const order = await shopordercollection.findOne({ transiction_id: id });
      res.send(order);
    });
    app.get("/cartorder/by_transcation_id/:id", async (req, res) => {
      const { id } = req.params;
      const order = await cartordercollection.findOne({ transiction_id: id });
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
      const order = await shopordercollection.findOne({ orderid: orderid });
      res.send(order);
    });
    app.get("/cart/order/by_order_id/:id", async (req, res) => {
      const { id } = req.params;
      const orderid = parseInt(id);
      const order = await cartordercollection.findOne({ orderid: orderid });
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
      const orderdata = await shopordercollection.findOne({
        transiction_id: paymentinfo.transiction_id,
      });
      console.log(orderdata);
      sendsucessemail(
        {
          subject: `Order & Payment Sucessfully !!!`,
          message: orderdata,
        },
        orderdata?.email
      );

      res.send(result);
    });
    app.put(`/cartpayment/:id`, async (req, res) => {
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
      const orderdata = await shopordercollection.findOne({
        transiction_id: paymentinfo.transiction_id,
      });
      sendsucessemail(
        {
          subject: `Order & Payment Sucessfully !!!`,
          message: orderdata,
        },
        orderdata?.email
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
    app.get("/allusers", async (req, res) => {
      const query = {};
      const users = await usercollection.find(query).toArray();
      res.send(users);
    });
    app.get("/shopcategory", async (req, res) => {
      const query = {};
      const shopcategory = await shopcategorycollection.find(query).toArray();
      res.send(shopcategory);
    });
    app.post("/shopproduct", async (req, res) => {
      const request_info = req.body;
      console.log(request_info);
      const result = await shopproductcollection.insertOne(request_info);
      res.send(result);
    });
    app.get("/shopproduct", async (req, res) => {
      const query = {};
      const shopproduct = await shopproductcollection.find(query).toArray();
      res.send(shopproduct);
    });

    app.get("/shopmainproduct", async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      // const minprice = req.query.minprice;
      // const maxprice = req.query.maxprice;
      // console.log(minprice, maxprice);
      const query = {};
      // const shopproduct = await shopprod1uctcollection.find(query).toArray();
      let product = await shopprod1uctcollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();

      const count = await shopprod1uctcollection.estimatedDocumentCount();
      res.send({ count, product });
    });

    app.get("/shopmainproduct/priceproduct", async (req, res) => {
      const minprice = parseFloat(req.query.minprice);
      const maxprice = parseFloat(req.query.maxprice);
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const color = req.query.color;
      console.log(minprice, maxprice, color);
      const query = {
        $or: [
          {
            product_price: { $gt: minprice, $lt: maxprice },
          },
          {
            product_price: { $eq: minprice, $eq: maxprice },
          },
        ],
      };
      if (color !== "not") {
        console.log(color);
        // Add the color condition to the query using the $and operator
        query.$and = [{ color: color }];
      }
      const allproduct = await shopprod1uctcollection.find(query).toArray();
      const product = await shopprod1uctcollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = allproduct.length;
      console.log(product, count);
      res.send({ product, count });
    });

    app.get("/shopproduct/:category_id", async (req, res) => {
      const category_id = req.params.category_id;
      console.log(category_id);
      const query = { category_id: category_id };
      const shopproduct = await shopproductcollection.find(query).toArray();
      res.send(shopproduct);
    });

    app.get("/shopmainproduct/:category_id", async (req, res) => {
      const minprice = parseFloat(req.query.minprice);
      const maxprice = parseFloat(req.query.maxprice);
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const color = req.query.color;
      const category_id = req.params.category_id;
      console.log(category_id, minprice, maxprice, color);
      const query = {
        $and: [
          { category_id: category_id },
          {
            $or: [
              {
                product_price: { $gt: minprice, $lt: maxprice },
              },
              {
                product_price: { $eq: minprice, $eq: maxprice },
              },
            ],
          },
        ],
      };
      if (color !== "not") {
        console.log(color);
        query.$and.push({ color: color });
      }
      // const query = { category_id: category_id };
      const shopproduct = await shopprod1uctcollection.find(query).toArray();

      const product = await shopprod1uctcollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = shopproduct?.length;
      res.send({ product, count });
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
    app.get("/shoporder", verifyjwt, async (req, res) => {
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
      const product = await shopordercollection.find(Query).limit(1).toArray();
      res.send(product);
    });
    app.get("/cart-s-order", verifyjwt, async (req, res) => {
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
      const product = await cartordercollection.find(Query).limit(1).toArray();
      res.send(product);
    });
    app.get("/customize-s-order", verifyjwt, async (req, res) => {
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
      const product = await ordercollection.find(Query).limit(1).toArray();
      res.send(product);
    });
    app.get("/shoporders", verifyjwt, async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const search = parseInt(req.query.search);
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
      let product = await shopordercollection
        .find(Query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const emailproduct = await shopordercollection.find(Query).toArray();
      console.log(emailproduct?.length);
      // let count = await shopordercollection.estimatedDocumentCount();
      let count = emailproduct?.length;

      if (search) {
        const idproduct = product.find((order) => order?.orderid === search);
        product = [idproduct];
        count = product.length;
      }

      res.send({ count, product });
    });
    app.get("/allshoporders", verifyjwt, async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      let Query = {};
      let product = await shopordercollection
        .find(Query)
        .skip(page * size)
        .limit(size)
        .toArray();
      let count = await shopordercollection.estimatedDocumentCount();

      res.send({ count, product });
    });
    app.get("/customizedorders", verifyjwt, async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const search = parseInt(req.query.search);
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
      let product = await ordercollection
        .find(Query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const emailproduct = await ordercollection.find(Query).toArray();
      // let count = await ordercollection.estimatedDocumentCount();
      let count = emailproduct?.length;
      if (search) {
        const idproduct = product.find((order) => order?.orderid === search);
        product = [idproduct];
        count = product.length;
      }

      res.send({ count, product });
    });
    app.get("/allcustomizedorders", verifyjwt, async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const search = parseInt(req.query.search);
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      let Query = {};
      let product = await ordercollection
        .find(Query)
        .skip(page * size)
        .limit(size)
        .toArray();
      // const emailproduct = await ordercollection.find(Query).toArray();
      let count = await ordercollection.estimatedDocumentCount();
      // let count = emailproduct?.length;
      if (search) {
        const idproduct = product.find((order) => order?.orderid === search);
        product = [idproduct];
        count = product.length;
      }

      res.send({ count, product });
    });
    app.get("/idodrders", verifyjwt, async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const search = parseInt(req.query.search);
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
      let product = await shopordercollection.find(Query).toArray();
      let count = await shopordercollection.estimatedDocumentCount();
      if (search) {
        const idproduct = product.find((order) => order?.orderid === search);
        product = [idproduct];
        count = product.length;
      }

      res.send({ count, product });
    });
    app.get("/idcustomizedodrders", verifyjwt, async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const search = parseInt(req.query.search);
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
      let product = await ordercollection.find(Query).toArray();
      let count = await ordercollection.estimatedDocumentCount();
      if (search) {
        const idproduct = product.find((order) => order?.orderid === search);
        product = [idproduct];
        count = product.length;
      }

      res.send({ count, product });
    });
    app.get("/user", verifyjwt, async (req, res) => {
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
      const product = await usercollection.findOne(Query);
      res.send(product);
    });
    app.put("/userupdate", async (req, res) => {
      const email = req.query.email;
      const filter = {
        email: email,
      };
      const user = req.body;
      const option = { upsert: true };
      const updateuser = {
        $set: {
          name: user.name,
          mobile: user.mobile,
          birth: user.birth,
          gender: user.gender,
        },
      };
      const result = await usercollection.updateOne(filter, updateuser, option);
      res.send(result);
    });
    app.post("/address", verifyjwt, async (req, res) => {
      const decoded = req.decoded;
      const email = req.query.email;
      const request_info = req.body;
      const oneaddress = await addresscollection.findOne({ email: email });
      if (email === decoded.email && oneaddress?.email === email) {
        const result = await addresscollection.updateOne(
          { email },
          {
            $set: {
              email: request_info.email,
              name: request_info.name,
              address: request_info.address,
              phone: request_info.phone,
              landmark: request_info.landmark,
              province: request_info.province,
              city: request_info.city,
              location: request_info.location,
              area: request_info.area,
            },
          }
        );
      } else {
        const result = await addresscollection.insertOne(request_info);
      }

      res.send(request_info);
    });
    app.get("/address", verifyjwt, async (req, res) => {
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
      const product = await addresscollection.find(Query).limit(1).toArray();
      res.send(product);
    });
    app.get("/staff", async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const searchvalue = req.query.search;

      let query = {};
      if (searchvalue.length) {
        query = {
          $text: {
            $search: searchvalue,
          },
        };
      }
      const product = await staffcollection.find(query).toArray();
      let result = await staffcollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = product?.length;
      console.log(count);
      res.send({ result, count });
    });

    app.get("/staff_name", verifyjwt, verifyAdmin, async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const searchvalue = req.query.search;
      console.log(searchvalue);
      let query = {};
      if (searchvalue.length) {
        query = {
          $text: {
            $search: searchvalue,
          },
        };
      }
      const product = await staffcollection.find(query).toArray();
      let result = await staffcollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = product?.length;
      console.log(count);
      res.send({ result, count });
    });
    app.get("/single_staff", verifyjwt, verifyAdmin, async (req, res) => {
      const email = req.query.email;
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let query = {};
      if (email) {
        query = { email: email };
      }
      const staffs = await staffcollection.find(query).toArray();
      let result = await staffcollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = staffs?.length;

      res.send({ result, count });
    });
    app.get("/single_staff_staff", verifyjwt, verifyAdmin, async (req, res) => {
      const staff = req.query.staff;
      const page = req.query.page;
      const size = parseInt(req.query.size);
      console.log(staff);
      let query = {};
      if (staff) {
        query = { role: staff };
      }
      const staffs = await staffcollection.find(query).toArray();
      const result = await staffcollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = staffs?.length;
      res.send({ result, count });
    });

    app.post("/addstaff", async (req, res) => {
      const staffinfo = req.body;
      console.log(staffinfo);
      const result = await staffcollection.insertOne(staffinfo);
      res.send(result);
      console.log(result);
    });
    app.put("/edit_staff/:id", async (req, res) => {
      const staffinfo = req.body;

      const id = req.params.id;
      console.log(staffinfo, id);
      const filter = {
        _id: new ObjectId(id),
      };
      const option = {
        upsert: true,
      };
      const updatedoc = {
        $set: {
          name: staffinfo?.name,
          email: staffinfo?.email,
          lastname: staffinfo?.lastname,
          photo: staffinfo?.photo,
          phone: staffinfo?.phone,
          password: staffinfo?.password,
          role: staffinfo?.role,
          join_date: staffinfo?.join_date,
        },
      };
      const result = await staffcollection.updateOne(filter, updatedoc, option);
      res.send(result);
    });
    app.delete(
      `/delete-staff/:id`,
      verifyjwt,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await staffcollection.deleteOne(query);
        res.send(result);
      }
    );
    app.put("/staff/admin/:id", verifyjwt, verifyAdmin, async (req, res) => {
      const decodedemail = req.decoded.email;
      console.log(decodedemail);
      const id = req.params.id;
      const filter = {
        _id: new ObjectId(id),
      };
      const option = {
        upsert: true,
      };
      const updatedoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await staffcollection.updateOne(filter, updatedoc, option);
      res.send(result);
    });
    app.get(`/staff/admin/:email`, async (req, res) => {
      const email = req.params.email;
      const query = {
        email: email,
      };
      const user = await staffcollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
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
