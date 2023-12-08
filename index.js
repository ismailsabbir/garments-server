const express = require("express");
const natural = require("natural");
const TfIdf = natural.TfIdf;
var jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.SECRET_KEY);
const SSLCommerzPayment = require("sslcommerz-lts");
const { MongoClient, ObjectId, Admin } = require("mongodb");
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false;
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const tfidf = new TfIdf();
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
  const imageUrl =
    "https://i.ibb.co/KqGcS3M/385565151-1096613294836586-7043829326437074719-n.png";
  const mailOptions = {
    from: process.env.EMAIL,
    to: emeil,
    subject: emaildata?.subject,
    html: `
    <html>
    <head>
      <title> ${emaildata?.subject}</title>
      <link rel="stylesheet" type="text/css" href="/design.css">
    </head>
    <body>
      <div style="background-color: #F4F7F8; padding: 10px; text-align: center; font-size: 15px;">
      <img src="${imageUrl}" alt="Your Image" style="max-width: 100%;width: 200px; height: 100px;margin-bottom: 20px;" />
        <p style="color: blue; font-size: 1.1rem; font-weight: 500;">Order id# ${emaildata?.message.orderid}</p>
        <h5>Your ${emaildata?.subject}</h5>
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
    const colorcollection = client
      .db("garmentsinformation")
      .collection("color");

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

    const products = await shopprod1uctcollection.find({}).toArray();
    products.forEach((product) => {
      tfidf.addDocument(product.category_name);
    });
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

    function calculateContentBasedProductRecommendations(userPreferences) {
      const featureWeights = {
        wishlist: 0.1,
        category: 0.5,
        brand: 0.3,
        userBehavior: 0.4,
        cart: 0.2,
      };
      const recommendedProducts = [];
      products.forEach((product) => {
        const categorySimilarity =
          userPreferences.interasted === product.category_name ? 1 : 0;
        const brandSimilarity =
          userPreferences.viewedProducts === product.category_name ? 1 : 0;
        const userBehaviorSimilarity =
          userPreferences.productcategory === product.category_name ? 1 : 0;
        const cartSimilarity =
          userPreferences.cartproduct === product.category_name ? 1 : 0;
        const waislistproductSimilarity =
          userPreferences.waislistproduct === product.category_name ? 1 : 0;

        const totalSimilarity =
          categorySimilarity * featureWeights.category +
          brandSimilarity * featureWeights.brand +
          waislistproductSimilarity * featureWeights.wishlist +
          cartSimilarity * featureWeights.cart +
          userBehaviorSimilarity * featureWeights.userBehavior;
        // console.log(totalSimilarity);
        if (totalSimilarity >= 0.1) {
          recommendedProducts.push({
            product: product,
            similarityScore: totalSimilarity,
          });
        }
      });
      recommendedProducts.sort((a, b) => b.similarityScore - a.similarityScore);
      const recommendedProductObjects = recommendedProducts.map(
        (entry) => entry.product
      );
      return recommendedProductObjects;
    }

    app.post("/shop/recommend", (req, res) => {
      const user = req.body;
      const email = req.query.email;
      console.log(email);
      console.log(user);
      const userInterests = user?.interasted;
      const recommendedProducts =
        calculateContentBasedProductRecommendations(user);
      res.send(recommendedProducts);
    });

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
    app.get("/color", async (req, res) => {
      const query = {};
      const color = await colorcollection.find(query).toArray();
      res.send(color);
    });
    app.get(`/customized-details/:id`, async (req, res) => {
      const id = req.params.id;
      console.log("id=====", id);
      const query = { category_id: id };
      const category = await categorydetailscollections.findOne(query);
      console.log("category", category);
      res.send(category);
    });
    app.get("/customized-single-details", async (req, res) => {
      const categoryid = req.query.categoryid;
      console.log(categoryid);
      const query = { category_id: categoryid };
      const category = await categorydetailscollections.findOne(query);
      console.log("category", category);
      res.send(category);
    });
    app.get("/colorproducts", async (req, res) => {
      const categoryid = req.query.category_id;
      const colorid = req.query.colorid;
      console.log(categoryid, colorid);
      const query = {
        category_id: categoryid,
      };
      const products = await colorproductcollections.find(query).toArray();
      console.log(products);
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
      const categoryproduct = request_info?.productinfo?.[0];
      const categoryname = categoryproduct?.category_name;
      console.log(request_info, categoryname);
      const result = await shopordercollection.insertOne(request_info);
      const userid = req.query.userid;
      console.log(userid);
      sendemail(
        {
          subject: `Order Confirm`,
          message: request_info,
        },
        request_info?.email
      );

      try {
        const result = await usercollection.updateOne(
          { _id: new ObjectId(userid) },
          {
            $set: {
              interasted: categoryname,
            },
          }
        );

        if (result.modifiedCount === 1) {
          console.log("update");
          // sendemail({
          //   subject: `Order Confirm`,
          //   message: request_info,
          // }, request_info?.email);

          // res.send(request_info);
        } else {
          res.status(404).send("User not found or not updated.");
        }
      } catch (error) {
        // Handle any database or server errors
        console.error("Error updating user:", error);
        res.status(500).send("Internal server error.");
      }

      res.send(request_info);
    });
    setInterval(async () => {
      try {
        const oneHourAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const ordersToCancel = await shopordercollection
          .find({
            order: "not paid",
            status: "Pending",
            createdAt: { $lte: oneHourAgo },
          })
          .toArray();

        // Update status for each order
        for (const order of ordersToCancel) {
          console.log(order._id);
          const result = await shopordercollection.updateOne(
            { _id: order._id },
            { $set: { status: "canceled" } }
          );

          console.log(result);

          // Send email for each order
          await sendemail(
            {
              subject: `Order cancel`,
              message: order,
            },
            order?.email
          );
        }
      } catch (error) {
        console.error("Automatic cancellation error:", error);
      }
    }, 30 * 60 * 1000);
    // setInterval(async () => {
    //   try {
    //     const oneHourAgo = new Date(Date.now() - 60 * 1000).toISOString();
    //     const result = await shopordercollection.updateMany(
    //       { order: "not paid", createdAt: { $lte: oneHourAgo } },
    //       { $set: { status: "canceled" } }
    //     );
    //     console.log(result);
    //   } catch (error) {
    //     console.error("Automatic cancellation error:", error);
    //   }
    // }, 60 * 1000);

    app.get("/oneorder", async (req, res) => {
      const oneHourAgo = new Date(Date.now() - 60 * 1000).toISOString();
      console.log(typeof oneHourAgo);
      console.log(oneHourAgo);
      const result = await shopordercollection
        .find({
          order: "not paid",
          createdAt: { $lte: oneHourAgo },
        })
        .toArray();
      res.send(result);
    });

    // 2023-12-02T12:04:59.565Z

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
      console.log("cart");
      const request_info = req.body;
      console.log(request_info);
      const result = await cartproductcollection.insertOne(request_info);
      const update = await usercollection.updateOne(
        { email: req.query.email },
        { $set: { cartproduct: request_info?.category_name } }
      );
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
      let count = await cartproductcollection.countDocuments(Query);
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
      // const decoded = req.decoded;
      // if (decoded.email !== req.query.email) {
      //   return res.status(403).send({ message: "forbidden access" });
      // }
      const request_info = req.body;
      console.log(request_info);
      const result = await wishlistproductcollection.insertOne(request_info);
      const update = await usercollection.updateOne(
        { email: req.query.email },
        { $set: { waislistproduct: request_info?.category_name } }
      );
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
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await cartproductcollection.deleteOne(query);
      console.log(result);
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
    app.get("/singleuser", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const user = await usercollection.findOne(query);
      res.send(user);
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
    app.get("/shopdascategory", async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const search = req.query.search;
      const reset = req.query.reset;
      console.log(reset);
      let query = {};
      if (reset === "true") {
        console.log(reset);
        query = {};
      } else if (search.length > 1 && search) {
        console.log(search);
        query.$text = {
          $search: search,
        };
      }
      const shopcategory = await shopcategorycollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = await shopcategorycollection.countDocuments(query);
      console.log(count);
      res.send({ count, shopcategory });
    });

    app.post("/shopproduct", async (req, res) => {
      const request_info = req.body;
      console.log(request_info);
      const result = await shopprod1uctcollection.insertOne(request_info);
      console.log(result);
      res.send(result);
    });
    app.post("/customized-pproduct", async (req, res) => {
      const request_info = req.body;
      const colorObject = await categorydetailscollections
        .aggregate([
          {
            $match: {
              category_id: request_info.category_id,
            },
          },
          {
            $match: {
              "colors.color_id": request_info.color_id,
            },
          },
        ])
        .toArray();
      console.log(colorObject);
      if (colorObject.length >= 1) {
        console.log("already addede");
        res
          .status(200)
          .json({ message: "This product is already present in your DB" });
      } else {
        const result = await colorproductcollections.insertOne(request_info);
        console.log(result);
        const updateresult = await categorydetailscollections.updateOne(
          { category_id: request_info.category_id },
          {
            $push: {
              colors: {
                color_id: request_info.color_id,
                color_name: request_info.color_name,
                color: request_info.color,
              },
            },
          }
        );
        console.log(updateresult);
        res.send(result);
      }
    });
    app.post("/shopcategory", async (req, res) => {
      const request_info = req.body;
      console.log(request_info);
      const result = await shopcategorycollection.insertOne(request_info);
      console.log(result);
      res.send(result);
    });
    app.post("/customizedcategory", async (req, res) => {
      const request_info = req.body;
      console.log(request_info);
      const result = await categorycollections.insertOne(request_info);
      console.log(result);
      res.send(result);
    });
    app.get("/shopproduct", async (req, res) => {
      const query = {};
      const shopproduct = await shopproductcollection.find(query).toArray();
      res.send(shopproduct);
    });
    app.get(`/detailsproduct/:categoryid/:id`, async (req, res) => {
      const categoryid = req.params.categoryid;
      const productid = req.params.id;
      console.log(categoryid, productid);
      try {
        const product = await shopprod1uctcollection.findOne({
          category_id: categoryid,
          product_id: productid,
        });

        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/shopmainproduct", async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const query = {};
      let product = await shopprod1uctcollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();

      const count = await shopprod1uctcollection.estimatedDocumentCount();
      res.send({ count, product });
    });

    app.get("/shopmainproduct/priceproduct", async (req, res) => {
      const search = req.query.serach;
      const minprice = parseFloat(req.query.minprice);
      const maxprice = parseFloat(req.query.maxprice);
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const color = req.query.color;

      let query = {
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
        query.$and = [{ color: color }];
      }
      if (search) {
        query.$text = {
          $search: search,
        };
      }
      const pipeline = [
        {
          $match: query,
        },
        {
          $facet: {
            product: [{ $skip: page * size }, { $limit: size }],
            count: [
              {
                $count: "total",
              },
            ],
          },
        },
      ];
      const result = await shopprod1uctcollection.aggregate(pipeline).toArray();
      if (result.length > 0) {
        const { product, count } = result[0];
        res.send({ product, count: count[0] ? count[0].total : 0 });
      } else {
        res.send({ product: [], count: 0 });
      }
    });
    app.get("/customized-details-all", async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const search = req.query.search;
      const reset = req.query.reset;
      console.log(reset);
      let query = {};
      if (reset === "true") {
        console.log(reset);
        query = {};
      } else if (search.length > 1 && search) {
        console.log(search);
        query.$text = {
          $search: search,
        };
      }
      const category = await categorycollections
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = await categorycollections.countDocuments(query);
      console.log(count);
      res.send({ count, category });

      // const page = req.query.page;
      // const size = parseInt(req.query.size);
      // const query = {};
      // const category = await categorycollections
      //   .find(query)
      //   .skip(page * size)
      //   .limit(size)
      //   .toArray();
      // const count = await categorycollections.countDocuments(query);

      // res.send({ count, category });
    });

    app.get("/customized-color-product-all", async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const search = req.query.search;
      const categor = req.query.category;
      const reset = req.query.reset;
      const status = req.query.status;
      console.log(search, categor, reset, status);
      let query = {};
      if (reset === "true") {
        console.log("reset");
        query = {};
      } else if (categor.length > 1 && categor !== "undefined") {
        console.log(typeof categor);
        query = { $text: { $search: categor } };
      } else if (search && search.length > 1) {
        console.log(search);
        query = { name: search };
      } else if (status === "IN STOCK") {
        console.log(status);
        query = { availavle: { $gt: 0 } };
      } else if (status === "STOCK OUT") {
        console.log(status);
        query = { availavle: { $lt: 1 } };
      } else {
        query = {};
      }
      console.log(query);
      const category = await colorproductcollections
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = await colorproductcollections.countDocuments(query);

      res.send({ count, category });
    });
    app.get("/shopallproduct", async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const search = req.query.search;
      const category = req.query.category;
      const reset = req.query.reset;
      const status = req.query.status;

      console.log(category, typeof category);
      let query = {};
      if (reset === "true") {
        console.log("reset");
        query = {};
      } else if (category.length > 1 && category !== "undefined") {
        console.log(typeof category);
        query = { $text: { $search: category } };
      } else if (search && search.length > 1) {
        console.log(search);
        query = { product_name: search };
      } else if (status) {
        console.log(status);
        query = { stock: status };
      } else {
        query = {};
      }
      let product = await shopprod1uctcollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();

      const count = await shopprod1uctcollection.countDocuments(query);

      res.send({ count, product });
    });

    app.get("/shopmainproduct/searchproduct", async (req, res) => {
      const search = req.query.serach;
      let query = {};
      if (search.length) {
        query = {
          $text: {
            $search: search,
          },
        };
      }
      const product = await shopprod1uctcollection.find(query).toArray();
      const count = product.length;
      res.send({ count, product });
    });

    app.get("/shopproduct/:category_id", async (req, res) => {
      const category_id = req.params.category_id;
      const email = req.query.email;
      const category = req.query.category;
      console.log(email);
      const userUpdateQuery = { email: email };
      const userUpdateData = {
        viewedProducts: category,
      };
      const result = await usercollection.updateOne(userUpdateQuery, {
        $set: userUpdateData,
      });
      console.log(result);
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
      const email = req.query.email;
      console.log(email);
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
      const product = await shopprod1uctcollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = await shopprod1uctcollection.countDocuments(query);
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
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const search = req.query.search;
        const orderDate = parseInt(req.query.orderDate);
        const reset = req.query.reset;
        const today = new Date();
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(today.getDate() - orderDate);
        console.log(orderDate);
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        console.log(startDate);
        console.log("end", endDate);
        let query = {};
        if (reset === "true") {
          query = {};
        } else if (
          startDate &&
          endDate &&
          startDate.trim() !== "" &&
          endDate.trim() !== ""
        ) {
          const startDateParts = startDate.split("-");
          const startDay = parseInt(startDateParts[2]);
          const startMonth = parseInt(startDateParts[1]);
          const startYear = parseInt(startDateParts[0]);
          const endDateParts = endDate.split("-");
          const endDay = parseInt(endDateParts[2]);
          const endMonth = parseInt(endDateParts[1]);
          const endYear = parseInt(endDateParts[0]);
          query = {
            $expr: {
              $and: [
                {
                  $gte: [
                    {
                      $dateFromString: {
                        dateString: "$order_date",
                        format: "%d/%m/%Y",
                      },
                    },
                    new Date(`${startYear}-${startMonth}-${startDay}`),
                  ],
                },
                {
                  $lte: [
                    {
                      $dateFromString: {
                        dateString: "$order_date",
                        format: "%d/%m/%Y",
                      },
                    },
                    new Date(`${endYear}-${endMonth}-${endDay}`),
                  ],
                },
              ],
            },
          };
        } else if (orderDate) {
          const fiveDaysAgo = new Date(today);
          fiveDaysAgo.setDate(today.getDate() - parseInt(orderDate));
          const startDay = fiveDaysAgo.getDate();
          const startMonth = fiveDaysAgo.getMonth() + 1;
          const startYear = fiveDaysAgo.getFullYear();
          const endDay = today.getDate();
          const endMonth = today.getMonth() + 1;
          const endYear = today.getFullYear();
          query = {
            $expr: {
              $and: [
                {
                  $gte: [
                    {
                      $dateFromString: {
                        dateString: "$order_date",
                        format: "%d/%m/%Y",
                      },
                    },
                    new Date(`${startYear}-${startMonth}-${startDay}`),
                  ],
                },
                {
                  $lte: [
                    {
                      $dateFromString: {
                        dateString: "$order_date",
                        format: "%d/%m/%Y",
                      },
                    },
                    new Date(`${endYear}-${endMonth}-${endDay}`),
                  ],
                },
              ],
            },
          };
        } else if (search && search.length > 1) {
          console.log(search);
          query = { $text: { $search: search } };
        }
        // else if (status) {
        //   console.log(status);
        //   query = { stock: status };
        // }
        else {
          query = {};
        }
        let product = await shopordercollection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await shopordercollection.countDocuments(query);
        res.send({ count, product });
      } catch (error) {
        console.log(error);
      }
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
    app.put("/usercategory", async (req, res) => {
      const email = req.query.email;
      const filter = {
        email: email,
      };
      const productcategory = req.body.firstCategoryName;
      console.log(productcategory);
      const option = { upsert: true };
      const updateuser = {
        $set: {
          productcategory,
        },
      };
      const result = await usercollection.updateOne(filter, updateuser, option);
      console.log(result);
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
      // const product = await staffcollection.find(query).toArray();
      let result = await staffcollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      // const count = product?.length;
      const count = await staffcollection.countDocuments(query);
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
    app.put("/edit_product/:id", async (req, res) => {
      try {
        const staffInfo = req.body;
        const id = req.params.id;
        console.log(staffInfo, id);
        const filter = {
          _id: new ObjectId(id),
        };
        const options = {
          upsert: false,
        };
        const updateDoc = {
          $set: {
            product_name: staffInfo?.product_name,
            category_name: staffInfo?.category_name,
            product_price: staffInfo?.product_price,
            availavle: staffInfo?.availavle,
            description: staffInfo?.description,
            brand: staffInfo?.brand,
            fabric: staffInfo?.fabric,
            Product_image: staffInfo?.Product_image,
            daisplay_image: staffInfo?.daisplay_image,
          },
        };
        const result = await shopprod1uctcollection.updateOne(
          filter,
          updateDoc,
          options
        );
        console.log(result);
        if (result.matchedCount === 1) {
          res.status(200).send(result);
        } else if (result.upsertedCount === 1) {
          res.status(201).send({ message: "Product created" });
        } else {
          res.status(404).send({ message: "Product not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });
    app.put("/edit_custom_product/:id", async (req, res) => {
      try {
        const staffInfo = req.body;
        const id = req.params.id;
        console.log(staffInfo, id);
        const filter = {
          _id: new ObjectId(id),
        };
        const options = {
          upsert: false,
        };
        const updateDoc = {
          $set: {
            category_id: staffInfo?.category_id,
            name: staffInfo?.name,
            availavle: staffInfo?.availavle,
            availavle: staffInfo?.availavle,
            default_price: staffInfo?.default_price,
            custom_price: staffInfo?.custom_price,
            color_id: staffInfo?.color_id,
            color_name: staffInfo?.color_name,
            color: staffInfo?.color,
            image: staffInfo.image,
          },
        };
        const result = await colorproductcollections.updateOne(
          filter,
          updateDoc,
          options
        );
        console.log(result);
        if (result.matchedCount === 1) {
          res.status(200).send(result);
        } else if (result.upsertedCount === 1) {
          res.status(201).send({ message: "Product created" });
        } else {
          res.status(404).send({ message: "Product not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });
    app.put("/edit_category/:id", async (req, res) => {
      try {
        const categoryinfo = req.body;
        const id = req.params.id;
        // console.log(staffInfo, id);
        const filter = {
          _id: new ObjectId(id),
        };
        const options = {
          upsert: false,
        };
        const updateDoc = {
          $set: {
            category_name: categoryinfo?.category_name,
            category_id: categoryinfo?.category_id,
            category_image: categoryinfo?.category_image,
          },
        };
        const result = await shopcategorycollection.updateOne(
          filter,
          updateDoc,
          options
        );
        console.log(result);
        if (result.matchedCount === 1) {
          res.status(200).send(result);
        } else if (result.upsertedCount === 1) {
          res.status(201).send({ message: "Product created" });
        } else {
          res.status(404).send({ message: "Product not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.put("/edit-customized_category/:id", async (req, res) => {
      try {
        const categoryinfo = req.body;
        const id = req.params.id;
        const filter = {
          category_id: id,
        };
        const options = {
          upsert: false,
        };
        const updateDoc = {
          $set: {
            category_id: categoryinfo?.category_id,
            name: categoryinfo?.name,
            image: categoryinfo?.image,
            text: categoryinfo?.text,
            availavle: categoryinfo.availavle,
          },
        };
        const updateDoc1 = {
          $set: {
            category_id: categoryinfo?.category_id,
            name: categoryinfo?.name,
            availavle: categoryinfo.availavle,
            colors: categoryinfo.colors,
            default_price: categoryinfo.default_price,
            custom_price: categoryinfo.custom_price,
          },
        };
        const updatedetails = await categorydetailscollections.updateOne(
          filter,
          updateDoc1,
          options
        );
        const result = await categorycollections.updateOne(
          filter,
          updateDoc,
          options
        );
        console.log(result);
        console.log(updatedetails);
        if (result.matchedCount === 1 && updatedetails.matchedCount === 1) {
          res.status(200).send(result);
        } else if (result.upsertedCount === 1) {
          res.status(201).send({ message: "Product created" });
        } else {
          res.status(404).send({ message: "Product not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.delete("/delete-products", async (req, res) => {
      const productIds = req.body;
      console.log(productIds);
      const query = { _id: { $in: productIds.map((id) => new ObjectId(id)) } };
      try {
        const result = await shopprod1uctcollection.deleteMany(query);
        console.log(result);
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No products found for deletion" });
          console.log("no products found for deletion");
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting products", error: error.message });
        console.log("error");
      }
    });
    app.delete("/delete-customized-products", async (req, res) => {
      const productIds = req.body;
      const query = {
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      };
      try {
        const products = await colorproductcollections.find(query).toArray();
        const result = await colorproductcollections.deleteMany(query);
        await Promise.all(
          products.map(async (product) => {
            const query = { category_id: product.category_id };
            const categoryuproduct = await categorydetailscollections.findOne(
              query
            );
            const coloridentify = categoryuproduct.colors.filter(
              (colors) => colors.color_id !== product.color_id
            );
            const category_update = await categorydetailscollections.updateOne(
              { category_id: product.category_id },
              { $set: { colors: coloridentify } }
            );
          })
        );
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No products found for deletion" });
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting products", error: error.message });
      }
    });

    app.delete("/delete-category", async (req, res) => {
      const productIds = req.body;
      console.log(productIds);
      const query = {
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      };
      try {
        const result = await shopcategorycollection.deleteMany(query);
        console.log(result);
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No products found for deletion" });
          console.log("no products found for deletion");
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting products", error: error.message });
        console.log("error");
      }
    });

    app.delete("/delete-customized-category", async (req, res) => {
      const productIds = req.body;
      console.log(productIds);
      const query = {
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      };
      try {
        const result = await categorycollections.deleteMany(query);
        console.log(result);
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No products found for deletion" });
          console.log("no products found for deletion");
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting products", error: error.message });
        console.log("error");
      }
    });

    app.delete("/delete-single-product", async (req, res) => {
      const productIds = req.body;
      console.log(productIds);
      const query = {
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      };
      try {
        const result = await shopprod1uctcollection.deleteMany(query);
        console.log(result);
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No products found for deletion" });
          console.log("no products found for deletion");
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting products", error: error.message });
        console.log("error");
      }
    });
    app.delete("/delete-single-custom-product", async (req, res) => {
      const productIds = req.body;
      const product_id = req.query.product_category;
      const color_id = req.query.product_color;
      const query = {
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      };
      try {
        const result = await colorproductcollections.deleteMany(query);
        const categoryuproduct = await categorydetailscollections.findOne({
          category_id: product_id,
        });
        const coloridentify = categoryuproduct.colors.filter(
          (colors) => colors.color_id !== color_id
        );
        const category_update = await categorydetailscollections.updateOne(
          { category_id: product_id },
          { $set: { colors: coloridentify } }
        );
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No products found for deletion" });
          console.log("no products found for deletion");
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting products", error: error.message });
      }
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
