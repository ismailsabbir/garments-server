const express = require("express");
const {
  format,
  startOfMonth,
  endOfMonth,
  isFriday,
  isSameDay,
  parse,
} = require("date-fns");
const natural = require("natural");
const TfIdf = natural.TfIdf;
var jwt = require("jsonwebtoken");
const cors = require("cors");
const moment = require("moment");
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
    } else {
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
    } else {
    }
  });
};
const sendEmployeemail = (emaildata, emeil) => {
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
        <p style="color: blue; font-size: 1.1rem; font-weight: 500;">Your ID: ${emaildata?.message.employee_id}</p>
        <h5>Your ${emaildata?.subject}</h5>
        <p>Salary Date:${emaildata.message.currentMonth}</p>
        <p>Salary: ${emaildata.message.salary}</p>
        <p>Transaction Id:${emaildata.message.tran_id}</p>
        <p>Name: ${emaildata?.message?.name}</p>
        <p>Mobile: ${emaildata?.message.phone}</p>
        <p>Email: ${emaildata?.message.email}</p>
      </div>
    </body>
  </html>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
    } else {
    }
  });
};
const sendEmployeeLeaveEmail = (emaildata, emeil) => {
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
      <h2 style={{ color: '#be5184' }}>Request  ${emaildata?.message.leave_status}</h2>
        <h5>Your ${emaildata?.subject}</h5>
        <p style="color: blue; font-size: 1.1rem; font-weight: 500;">Reason For Leave: ${emaildata?.message.reason}</p>
        <p style="color: blue; font-size: 1.1rem; font-weight: 500;">Notice For You: ${emaildata?.message.notice}</p>
        <p>Leave start from:${emaildata.message.from_date}</p>
        <p>Leave end To: ${emaildata.message.to_date}</p>
        <p>Leave Durations:${emaildata.message.no_day}</p>
        <p>Name: ${emaildata?.message?.name}</p>
        <p>Email: ${emaildata?.message.email}</p>
      </div>
    </body>
  </html>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
    } else {
    }
  });
};
const sendPremimCustomer = (emaildata, emeil) => {
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
        <h5>${emaildata?.subject}</h5>
        <p>Created Date:${emaildata.message.created_date}</p>
        <p>Name: ${emaildata.message.name}</p>
        <p>Email:${emaildata.message.email}</p>
        <p>password: ${emaildata?.message?.password}</p>
        <p>Mobile: ${emaildata?.message.phone}</p>
        <p>Role: ${emaildata?.message.role} Customer</p>
      </div>
    </body>
  </html>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
    } else {
    }
  });
};
const sendPremimCustomer1 = (emaildata, emeil) => {
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
        <h5>${emaildata?.subject}</h5>
        <p>Name: ${emaildata.message.name}</p>
        <p>Email:${emaildata.message.email}</p>
        <p>Role: ${emaildata?.message.role} Customer</p>
        <p>Now you get 20% discount from all orders.</p>
      </div>
    </body>
  </html>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
    } else {
    }
  });
};
const sendPremimCustomer2 = (emaildata, emeil) => {
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
        <h5>${emaildata?.subject}</h5>
        <p>Name: ${emaildata.message.name}</p>
        <p>Email:${emaildata.message.email}</p>
        <p>Role: ${emaildata?.message.role} Customer</p>
        <p>Now you cannot get a discount. Because  You normal customer.</p>
      </div>
    </body>
  </html>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
    } else {
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
    const attendancellection = client
      .db("garmentsinformation")
      .collection("Attendance");
    const salaryllection = client
      .db("garmentsinformation")
      .collection("salary");
    const reviewcollection = client
      .db("garmentsinformation")
      .collection("reviews");
    const leavescollection = client
      .db("garmentsinformation")
      .collection("leaves");
    const missionCollection = client
      .db("garmentsinformation")
      .collection("missions");
    const vissionsCollection = client
      .db("garmentsinformation")
      .collection("vissions");
    const partnershipcollection = client
      .db("garmentsinformation")
      .collection("partnership");
    const settingcollection = client
      .db("garmentsinformation")
      .collection("setting");
    const contactcollection = client
      .db("garmentsinformation")
      .collection("contact");
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
    const verifyEmployee = async (req, res, next) => {
      const decodedemail = req.decoded.email;
      const query = {
        email: decodedemail,
      };
      const user = await staffcollection.findOne(query);
      if (user?.isEmployee !== true) {
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
      try {
        const user = req.body;
        const email = req.query.email;
        const userInterests = user?.interasted;
        const recommendedProducts =
          calculateContentBasedProductRecommendations(user);
        res.send(recommendedProducts);
      } catch (error) {}
    });
    app.put("/users/admin/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const option = { upsert: true };
        const updatedoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await usercollection.updateOne(
          filter,
          updatedoc,
          option
        );
        res.send(result);
      } catch (error) {}
    });
    app.post("/jwt", (req, res) => {
      try {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
          expiresIn: "1d",
        });
        res.send({ token });
      } catch (error) {}
    });
    app.get("/services", async (req, res) => {
      try {
        const query = {};
        const services = await servicescollections.find(query).toArray();
        res.send(services);
      } catch (error) {}
    });
    app.get("/missions", async (req, res) => {
      try {
        const query = {};
        const mission = await missionCollection.find(query).toArray();
        res.send({ mission });
      } catch (error) {}
    });
    app.post("/vission/add", async (req, res) => {
      try {
        const info = req.body;
        const result = await vissionsCollection.insertOne(info);
        if (result) {
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false });
        }
      } catch (error) {
        res.send({ sucess: false });
      }
    });
    app.post("/mission/add", async (req, res) => {
      try {
        const info = req.body;
        const result = await missionCollection.insertOne(info);
        if (result) {
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false });
        }
      } catch (error) {
        res.send({ sucess: false });
      }
    });
    app.get("/vissions", async (req, res) => {
      try {
        const query = {};
        const vission = await vissionsCollection.find(query).toArray();
        res.send({ vission });
      } catch (error) {}
    });
    app.get("/serviceDetails/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const service = await servicescollections.findOne(query);
        res.send(service);
      } catch (error) {}
    });
    app.put("/edit_vission/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const vission = req.body;
        const options = { upsert: true };
        const filter = { _id: new ObjectId(id) };
        const updateorder = {
          $set: {
            vission_id: vission?.vission_id,
            vision: vission?.vision,
          },
        };
        const result = await vissionsCollection.updateOne(
          filter,
          updateorder,
          options
        );
        if (result?.modifiedCount >= 1) {
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false, result });
        }
      } catch (error) {
        res.send({ sucess: false });
      }
    });
    app.put("/edit_mission/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const vission = req.body;
        const options = { upsert: true };
        const filter = { _id: new ObjectId(id) };
        const updateorder = {
          $set: {
            mission_id: vission?.mission_id,
            mission: vission?.mission,
          },
        };
        const result = await missionCollection.updateOne(
          filter,
          updateorder,
          options
        );
        if (result?.modifiedCount >= 1) {
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false, result });
        }
      } catch (error) {
        res.send({ sucess: false });
      }
    });
    app.delete("/delete-vission/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await vissionsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result?.deletedCount >= 1) {
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false });
        }
      } catch (error) {
        res.send({ success: false });
      }
    });
    app.delete("/delete-mission/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await missionCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result?.deletedCount >= 1) {
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false });
        }
      } catch (error) {
        res.send({ success: false });
      }
    });
    app.delete("/delete-partnership/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await partnershipcollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result?.deletedCount >= 1) {
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false });
        }
      } catch (error) {
        res.send({ success: false });
      }
    });
    app.post("/add/Partnership", async (req, res) => {
      try {
        const partnership = req.body;
        const result = await partnershipcollection.insertOne(partnership);
        if (result) {
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false });
        }
      } catch (error) {
        res.send({ sucess: false });
      }
    });
    app.get("/projects", async (req, res) => {
      try {
        const query = {};
        const projects = await projectscollections.find(query).toArray();
        res.send(projects);
      } catch (erroe) {}
    });
    app.get("/projectDetails/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const project = await projectscollections.findOne(query);
        res.send(project);
      } catch (error) {}
    });
    app.get("/project-category", async (req, res) => {
      try {
        const query = {};
        const category = await categorycollections.find(query).toArray();
        res.send(category);
      } catch (error) {}
    });
    app.get("/color", async (req, res) => {
      try {
        const query = {};
        const color = await colorcollection.find(query).toArray();
        res.send(color);
      } catch (error) {}
    });
    app.get(`/customized-details/:id`, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { category_id: id };
        const category = await categorydetailscollections.findOne(query);
        res.send(category);
      } catch (error) {}
    });
    app.get("/customized-single-details", async (req, res) => {
      try {
        const categoryid = req.query.categoryid;
        const query = { category_id: categoryid };
        const category = await categorydetailscollections.findOne(query);
        res.send(category);
      } catch (error) {}
    });
    app.get("/colorproducts", async (req, res) => {
      try {
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
      } catch (error) {}
    });

    app.get("/quality", async (req, res) => {
      try {
        const query = {};
        const quality = await qualitycollections.find(query).toArray();
        res.send(quality);
      } catch (error) {}
    });
    app.post("/requesed_order", async (req, res) => {
      try {
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
      } catch (error) {}
    });

    setInterval(async () => {
      try {
        const oneHourAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const ordersToCancel = await ordercollection
          .find({
            order: "not paid",
            status: "Pending",
            createdAt: { $lte: oneHourAgo },
          })
          .toArray();
        for (const order of ordersToCancel) {
          const result = await ordercollection.updateOne(
            { _id: order._id },
            { $set: { status: "canceled" } }
          );
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
    }, 5 * 60 * 1000);

    app.post("/shoporder", async (req, res) => {
      try {
        const request_info = req.body;
        const categoryproduct = request_info?.productinfo?.[0];
        const categoryname = categoryproduct?.category_name;
        const result = await shopordercollection.insertOne(request_info);
        const userid = req.query.userid;
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
        } catch (error) {}
        res.send(request_info);
      } catch (error) {}
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
        for (const order of ordersToCancel) {
          const result = await shopordercollection.updateOne(
            { _id: order._id },
            { $set: { status: "canceled" } }
          );
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
    }, 5 * 60 * 1000);
    app.get("/oneorder", async (req, res) => {
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 1000).toISOString();
        const result = await shopordercollection
          .find({
            order: "not paid",
            createdAt: { $lte: oneHourAgo },
          })
          .toArray();
        res.send(result);
      } catch (error) {}
    });
    app.put(`/update_order_status/:id`, async (req, res) => {
      try {
        const orderid = req.params.id;
        const orderinfo = req.body;
        const status = req.query.status;
        const options = { upsert: true };
        const filter = { _id: new ObjectId(orderid) };
        const updateorder = {
          $set: {
            status: status,
          },
        };
        const result = await shopordercollection.updateOne(
          filter,
          updateorder,
          options
        );
        if (result?.modifiedCount >= 1) {
          sendemail(
            {
              subject: `Order is ${status} `,
              message: orderinfo,
            },
            orderinfo?.email
          );
        }
        res.send(result);
      } catch (error) {}
    });
    app.put(`/update_customized_order_status/:id`, async (req, res) => {
      try {
        const orderid = req.params.id;
        const orderinfo = req.body;
        const status = req.query.status;
        const options = { upsert: true };
        const filter = { _id: new ObjectId(orderid) };
        const updateorder = {
          $set: {
            status: status,
          },
        };
        const result = await ordercollection.updateOne(
          filter,
          updateorder,
          options
        );
        if (result?.modifiedCount >= 1) {
          sendemail(
            {
              subject: `Order is ${status} `,
              message: orderinfo,
            },
            orderinfo?.email
          );
        }
        res.send(result);
      } catch (error) {}
    });

    app.post("/cartorder", async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.get("/dress_size", async (req, res) => {
      try {
        const query = {};
        const sizes = await sizeollection.find(query).toArray();
        res.send(sizes);
      } catch (error) {}
    });
    app.post("/cartproduct", async (req, res) => {
      try {
        const request_info = req.body;
        const result = await cartproductcollection.insertOne(request_info);
        const update = await usercollection.updateOne(
          { email: req.query.email },
          { $set: { cartproduct: request_info?.category_name } }
        );
        res.send(request_info);
      } catch (error) {}
    });
    app.get("/cartproduct", verifyjwt, async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.get("/mycartproduct", verifyjwt, async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.get("/mywishproduct", verifyjwt, async (req, res) => {
      try {
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
        let count = await wishlistproductcollection.estimatedDocumentCount(
          Query
        );
        res.send({ count, product });
      } catch (error) {}
    });
    app.get("/customized_orders", verifyjwt, async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.post("/wishlistproduct", async (req, res) => {
      try {
        const request_info = req.body;
        const result = await wishlistproductcollection.insertOne(request_info);
        const update = await usercollection.updateOne(
          { email: req.query.email },
          { $set: { waislistproduct: request_info?.category_name } }
        );
        res.send(request_info);
      } catch (error) {}
    });
    app.get("/wishlistproduct", async (req, res) => {
      try {
        let Query = {};
        if (req.query.email) {
          Query = {
            email: req.query.email,
          };
        }
        const product = await wishlistproductcollection.find(Query).toArray();
        res.send(product);
      } catch (error) {}
    });
    app.delete(`/wishlistproduct/:id`, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await wishlistproductcollection.deleteOne(query);
        res.send(result);
      } catch (error) {}
    });
    app.delete(`/cartproduct/:id`, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await cartproductcollection.deleteOne(query);
        res.send(result);
      } catch (error) {}
    });
    app.delete("/allcartproduct", async (req, res) => {
      try {
        const query = {};
        const result = await cartproductcollection.deleteMany(query);
        res.send(result);
      } catch (error) {}
    });
    app.post("/create-payment-intent", async (req, res) => {
      try {
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
      } catch (error) {}
    });

    app.put(`/payment/:id`, async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const paymentinfo = req.body;
        const options = { upsert: true };
        const filter = { orderid: id };
        const updateorder = {
          $set: {
            order: "paid",
            transiction_id: paymentinfo.transiction_id,
            status: "Processing",
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
      } catch (error) {}
    });
    app.post(`/shop_bkash_payment`, async (req, res) => {
      try {
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
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        sslcz.init(data).then((apiResponse) => {
          let GatewayPageURL = apiResponse.GatewayPageURL;
          res.send({ url: GatewayPageURL });
        });
      } catch (error) {}
    });
    app.post(`/cart_bkash_payment`, async (req, res) => {
      try {
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
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        sslcz.init(data).then((apiResponse) => {
          let GatewayPageURL = apiResponse.GatewayPageURL;
          res.send({ url: GatewayPageURL });
        });
      } catch (error) {}
    });
    app.post("/cart/payment/sucess", async (req, res) => {
      try {
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
              status: "Processing",
            },
          }
        );
        if (result.modifiedCount > 0) {
          const orderdata = await shopordercollection.findOne({
            transiction_id: transiction_id,
          });
          for (const productInfo of orderdata?.productinfo) {
            const productId = productInfo._id;
            const quantityToDecrease = productInfo.quentuty;
            await shopprod1uctcollection.updateOne(
              {
                category_id: productInfo?.category_id,
                category_name: productInfo?.category_name,
                product_id: productInfo?.product_id,
              },
              {
                $inc: {
                  availavle: -quantityToDecrease,
                },
              }
            );
          }
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
      } catch (error) {}
    });
    app.post("/cart/payment/failed", async (req, res) => {
      try {
        const transiction_id = req.query.transiction_id;
        const orderid = parseInt(req.query.orderid);
        res.redirect(
          `${process.env.CLIENT_LINK}/cart/payment/failed?orderid=${orderid}`
        );
      } catch (error) {}
    });
    app.post("/payment/sucess", async (req, res) => {
      try {
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
              status: "Processing",
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
      } catch (error) {}
    });
    app.post("/payment/failed", async (req, res) => {
      try {
        const transiction_id = req.query.transiction_id;
        const orderid = parseInt(req.query.orderid);
        res.redirect(
          `${process.env.CLIENT_LINK}/payment/failed?orderid=${orderid}`
        );
      } catch (error) {}
    });
    app.post(`/product_bkash_payment`, async (req, res) => {
      try {
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
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        sslcz.init(data).then((apiResponse) => {
          let GatewayPageURL = apiResponse.GatewayPageURL;
          res.send({ url: GatewayPageURL });
        });
      } catch (error) {}
    });
    app.post("/product/payment/sucess", async (req, res) => {
      try {
        const transiction_id = req.query.transiction_id;
        const orderid = parseInt(req.query.orderid);
        const requestinfo = req.body;
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
              status: "Processing",
            },
          }
        );

        if (result.modifiedCount > 0) {
          const orderdata = await shopordercollection.findOne({
            transiction_id: transiction_id,
          });
          const userupdate = await usercollection.updateOne(
            { email: orderdata?.email },
            {
              $inc: {
                reward: orderdata?.productinfo?.length || 0,
              },
            }
          );
          for (const productInfo of orderdata?.productinfo) {
            const productId = productInfo._id;
            const quantityToDecrease = productInfo.quentuty;
            await shopprod1uctcollection.updateOne(
              { _id: new ObjectId(productId) },
              {
                $inc: {
                  availavle: -quantityToDecrease,
                },
              }
            );
          }
          sendsucessemail(
            {
              subject: `Order & Payment Sucessfully !!!`,
              message: orderdata,
            },
            orderdata?.email
          );
          const isRewardUse = orderdata?.isRewardUse;
          if (isRewardUse) {
            const userupdate = await usercollection.updateOne(
              { email: orderdata?.email },
              {
                $inc: {
                  reward: -orderdata?.reward,
                },
              }
            );
          }
          res.redirect(
            `${process.env.CLIENT_LINK}/product/payment/sucess/?transiction_id=${transiction_id}`
          );
        }
      } catch (error) {}
    });
    app.post("/product/payment/failed", async (req, res) => {
      try {
        const transiction_id = req.query.transiction_id;
        const orderid = parseInt(req.query.orderid);
        res.redirect(
          `${process.env.CLIENT_LINK}/product/payment/failed?orderid=${orderid}`
        );
      } catch (error) {}
    });
    app.get("/order/by_transcation_id/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const order = await ordercollection.findOne({ transiction_id: id });
        res.send(order);
      } catch (error) {}
    });
    app.get("/product/order/by_transcation_id/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const order = await shopordercollection.findOne({ transiction_id: id });
        res.send(order);
      } catch (error) {}
    });
    app.get("/shoporder/by_transcation_id/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const order = await shopordercollection.findOne({ transiction_id: id });
        res.send(order);
      } catch (error) {}
    });
    app.get("/cartorder/by_transcation_id/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const order = await cartordercollection.findOne({ transiction_id: id });
        res.send(order);
      } catch (error) {}
    });
    app.get("/order/by_order_id/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const orderid = parseInt(id);
        const order = await ordercollection.findOne({ orderid: orderid });
        res.send(order);
      } catch (error) {}
    });
    app.get("/product/order/by_order_id/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const orderid = parseInt(id);
        const order = await shopordercollection.findOne({ orderid: orderid });
        res.send(order);
      } catch (error) {}
    });
    app.get("/cart/order/by_order_id/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const orderid = parseInt(id);
        const order = await cartordercollection.findOne({ orderid: orderid });
        res.send(order);
      } catch (error) {}
    });
    app.put(`/shoppayment/:id`, async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const paymentinfo = req.body;
        const options = { upsert: true };
        const filter = { orderid: id };
        const updateorder = {
          $set: {
            order: "paid",
            transiction_id: paymentinfo.transiction_id,
            status: "Processing",
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
        const userupdate = await usercollection.updateOne(
          { email: orderdata?.email },
          {
            $inc: {
              reward: orderdata?.productinfo?.length || 0,
            },
          }
        );
        for (const productInfo of orderdata?.productinfo) {
          const productId = productInfo._id;
          const quantityToDecrease = productInfo.quentuty;
          await shopprod1uctcollection.updateOne(
            { _id: new ObjectId(productId) },
            {
              $inc: {
                availavle: -quantityToDecrease,
              },
            }
          );
        }
        sendsucessemail(
          {
            subject: `Order & Payment Sucessfully !!!`,
            message: orderdata,
          },
          orderdata?.email
        );
        const isRewardUse = orderdata?.isRewardUse;
        if (isRewardUse) {
          const userupdate = await usercollection.updateOne(
            { email: orderdata?.email },
            {
              $inc: {
                reward: -orderdata?.reward,
              },
            }
          );
        }
        res.send(result);
      } catch (error) {}
    });
    app.put(`/cartpayment/:id`, async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const paymentinfo = req.body;
        const options = { upsert: true };
        const filter = { orderid: id };
        const updateorder = {
          $set: {
            order: "paid",
            transiction_id: paymentinfo.transiction_id,
            status: "Processing",
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
        const userupdate = await usercollection.updateOne(
          { email: orderdata?.email },
          {
            $inc: {
              reward: orderdata?.productinfo?.length || 0,
            },
          }
        );
        for (const productInfo of orderdata?.productinfo) {
          const productId = productInfo._id;
          const quantityToDecrease = productInfo.quentuty;
          await shopprod1uctcollection.updateOne(
            {
              category_id: productInfo?.category_id,
              category_name: productInfo?.category_name,
              product_id: productInfo?.product_id,
            },
            {
              $inc: {
                availavle: -quantityToDecrease,
              },
            }
          );
        }
        sendsucessemail(
          {
            subject: `Order & Payment Sucessfully !!!`,
            message: orderdata,
          },
          orderdata?.email
        );
        const isRewardUse = orderdata?.isRewardUse;
        if (isRewardUse) {
          const userupdate = await usercollection.updateOne(
            { email: orderdata?.email },
            {
              $inc: {
                reward: -orderdata?.reward,
              },
            }
          );
        }
        res.send(result);
      } catch (error) {}
    });
    app.post("/users", async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.get("/singleuser", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };
        const user = await usercollection.findOne(query);
        res.send(user);
      } catch (error) {}
    });

    app.get("/shopcategory", async (req, res) => {
      try {
        const query = {};
        const shopcategory = await shopcategorycollection.find(query).toArray();
        res.send(shopcategory);
      } catch (error) {}
    });
    app.get("/shopdascategory", async (req, res) => {
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const search = req.query.search;
        const reset = req.query.reset;
        let query = {};
        if (reset === "true") {
          query = {};
        } else if (search.length > 1 && search) {
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
        res.send({ count, shopcategory });
      } catch (error) {}
    });

    app.post("/shopproduct", async (req, res) => {
      try {
        const request_info = req.body;
        const result = await shopprod1uctcollection.insertOne(request_info);
        res.send(result);
      } catch (error) {}
    });
    app.post("/addService", async (req, res) => {
      try {
        const request_info = req.body;
        const result = await servicescollections.insertOne(request_info);
        res.send(result);
      } catch (error) {}
    });
    app.post("/addProject", async (req, res) => {
      try {
        const request_info = req.body;
        const result = await projectscollections.insertOne(request_info);
        res.send(result);
      } catch (error) {}
    });
    app.post("/service_add", async (req, res) => {
      try {
        const request_info = req.body;
        const result = await servicescollections.insertOne(request_info);
        res.send(result);
      } catch (error) {}
    });
    app.post("/blog_add", async (req, res) => {
      try {
        const request_info = req.body;
        const result = await blogcollections.insertOne(request_info);
        res.send(result);
      } catch (error) {}
    });
    app.post("/project_add", async (req, res) => {
      try {
        const request_info = req.body;
        const result = await projectscollections.insertOne(request_info);
        res.send(result);
      } catch (error) {}
    });
    app.post("/customized-pproduct", async (req, res) => {
      try {
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
        if (colorObject.length >= 1) {
          res
            .status(200)
            .json({ message: "This product is already present in your DB" });
        } else {
          const result = await colorproductcollections.insertOne(request_info);
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
          res.send(result);
        }
      } catch (error) {}
    });
    app.post("/shopcategory", async (req, res) => {
      try {
        const request_info = req.body;
        const result = await shopcategorycollection.insertOne(request_info);
        res.send(result);
      } catch (error) {}
    });
    app.post("/customizedcategory", async (req, res) => {
      try {
        const request_info = req.body;
        const result = await categorycollections.insertOne(request_info);
        res.send(result);
      } catch (error) {}
    });
    app.get("/shopproduct", async (req, res) => {
      try {
        const query = {};
        const shopproduct = await shopproductcollection.find(query).toArray();
        res.send(shopproduct);
      } catch (error) {}
    });
    app.get(`/detailsproduct/:categoryid/:id`, async (req, res) => {
      const categoryid = req.params.categoryid;
      const productid = req.params.id;
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
      try {
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
      } catch (error) {}
    });

    app.get("/shopmainproduct/priceproduct", async (req, res) => {
      try {
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
        const result = await shopprod1uctcollection
          .aggregate(pipeline)
          .toArray();
        if (result.length > 0) {
          const { product, count } = result[0];
          res.send({ product, count: count[0] ? count[0].total : 0 });
        } else {
          res.send({ product: [], count: 0 });
        }
      } catch (error) {}
    });
    app.get("/customized-details-all", async (req, res) => {
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const search = req.query.search;
        const reset = req.query.reset;
        let query = {};
        if (reset === "true") {
          query = {};
        } else if (search.length > 1 && search) {
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
        res.send({ count, category });
      } catch (error) {}
    });
    app.get("/customized-color-product-all", async (req, res) => {
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const search = req.query.search;
        const categor = req.query.category;
        const reset = req.query.reset;
        const status = req.query.status;
        let query = {};
        if (reset === "true") {
          query = {};
        } else if (categor.length > 1 && categor !== "undefined") {
          query = { $text: { $search: categor } };
        } else if (search && search.length > 1) {
          query = { name: search };
        } else if (status === "IN STOCK") {
          query = { availavle: { $gt: 0 } };
        } else if (status === "STOCK OUT") {
          query = { availavle: { $lt: 1 } };
        } else {
          query = {};
        }
        const category = await colorproductcollections
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await colorproductcollections.countDocuments(query);
        res.send({ count, category });
      } catch (error) {}
    });
    app.get("/shopallproduct", async (req, res) => {
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const search = req.query.search;
        const category = req.query.category;
        const reset = req.query.reset;
        const status = req.query.status;
        let query = {};
        if (reset === "true") {
          query = {};
        } else if (category.length > 1 && category !== "undefined") {
          query = { $text: { $search: category } };
        } else if (search && search.length > 1) {
          query = { product_name: search };
        } else if (status) {
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
      } catch (error) {}
    });
    app.get("/shopmainproduct/searchproduct", async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.get("/shopproduct/:category_id", async (req, res) => {
      try {
        const category_id = req.params.category_id;
        const email = req.query.email;
        const category = req.query.category;
        const userUpdateQuery = { email: email };
        const userUpdateData = {
          viewedProducts: category,
        };
        const result = await usercollection.updateOne(userUpdateQuery, {
          $set: userUpdateData,
        });
        const query = { category_id: category_id };
        const shopproduct = await shopproductcollection.find(query).toArray();
        res.send(shopproduct);
      } catch (error) {}
    });
    app.get("/shopmainproduct/:category_id", async (req, res) => {
      try {
        const minprice = parseFloat(req.query.minprice);
        const maxprice = parseFloat(req.query.maxprice);
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const color = req.query.color;
        const category_id = req.params.category_id;
        const email = req.query.email;
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
          query.$and.push({ color: color });
        }
        const product = await shopprod1uctcollection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await shopprod1uctcollection.countDocuments(query);
        res.send({ product, count });
      } catch (error) {}
    });
    app.get("/blogs", async (req, res) => {
      try {
        const query = {};
        const blogs = await blogcollections.find(query).toArray();
        res.send(blogs);
      } catch (error) {}
    });
    app.post(`/blog/review/:id`, async (req, res) => {
      try {
        const info = req.body;
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const update = {
          $push: {
            comments: info,
          },
        };
        const result = await blogcollections.updateOne(filter, update);
        if (result.modifiedCount === 1) {
          res.status(200).json({ sucess: true });
        } else {
          res.status(404).json({ sucess: false });
        }
      } catch (error) {
        res.send({ sucess: false });
      }
    });
    app.get("/members", async (req, res) => {
      try {
        const query = {};
        const members = await membercollections.find(query).toArray();
        res.send(members);
      } catch (error) {}
    });
    app.get("/shoporder", verifyjwt, async (req, res) => {
      try {
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
        const product = await shopordercollection
          .find(Query)
          .limit(1)
          .toArray();
        res.send(product);
      } catch (error) {}
    });
    app.get("/cart-s-order", verifyjwt, async (req, res) => {
      try {
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
        const product = await cartordercollection
          .find(Query)
          .limit(1)
          .toArray();
        res.send(product);
      } catch (error) {}
    });
    app.get("/customize-s-order", verifyjwt, async (req, res) => {
      try {
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
      } catch (Error) {}
    });
    app.get("/shoporders", verifyjwt, async (req, res) => {
      try {
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
        let count = emailproduct?.length;
        if (search) {
          const idproduct = product.find((order) => order?.orderid === search);
          product = [idproduct];
          count = product.length;
        }
        res.send({ count, product });
      } catch (error) {}
    });
    app.get("/shopordercancel", verifyjwt, async (req, res) => {
      try {
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
            status: "canceled",
          };
        }
        let product = await shopordercollection
          .find(Query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const emailproduct = await shopordercollection.find(Query).toArray();
        let count = emailproduct?.length;
        if (search) {
          const idproduct = product.find((order) => order?.orderid === search);
          product = [idproduct];
          count = product.length;
        }
        res.send({ count, product });
      } catch (error) {}
    });
    app.get("/shopcustomoizedcancel", verifyjwt, async (req, res) => {
      try {
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
            status: "canceled",
          };
        }
        let product = await ordercollection
          .find(Query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const emailproduct = await ordercollection.find(Query).toArray();
        let count = emailproduct?.length;
        if (search) {
          const idproduct = product.find((order) => order?.orderid === search);
          product = [idproduct];
          count = product.length;
        }
        res.send({ count, product });
      } catch (error) {}
    });
    app.get("/myreviews", verifyjwt, async (req, res) => {
      try {
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
        let product = await reviewcollection
          .find(Query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const emailproduct = await reviewcollection.find(Query).toArray();
        let count = emailproduct?.length;
        if (search) {
          const idproduct = product.find((order) => order?.orderid === search);
          product = [idproduct];
          count = product.length;
        }
        res.send({ count, product });
      } catch (error) {}
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
        const status = req.query.status;
        fiveDaysAgo.setDate(today.getDate() - orderDate);
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
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
          query = { $text: { $search: search } };
        } else if (status && status.length > 1) {
          query = { status: status };
        } else {
          query = {};
        }
        let product = await shopordercollection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await shopordercollection.countDocuments(query);
        res.send({ count, product });
      } catch (error) {}
    });
    app.get("/customizedorders", verifyjwt, async (req, res) => {
      try {
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
        let count = emailproduct?.length;
        if (search) {
          const idproduct = product.find((order) => order?.orderid === search);
          product = [idproduct];
          count = product.length;
        }

        res.send({ count, product });
      } catch (error) {}
    });
    app.get("/allcustomizedorders", verifyjwt, async (req, res) => {
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const search = req.query.search;
        const orderDate = parseInt(req.query.orderDate);
        const reset = req.query.reset;
        const today = new Date();
        const fiveDaysAgo = new Date(today);
        const status = req.query.status;
        fiveDaysAgo.setDate(today.getDate() - orderDate);
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
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
          query = { $text: { $search: search } };
        } else if (status && status.length > 1) {
          query = { status: status };
        } else {
          query = {};
        }
        let product = await ordercollection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await ordercollection.countDocuments(query);
        res.send({ count, product });
      } catch (error) {}
    });

    app.get("/idodrders", verifyjwt, async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.get("/idcustomizedodrders", verifyjwt, async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.get("/user", verifyjwt, async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.get("/statistic/info", async (req, res) => {
      try {
        const query = {};
        const usernumber = await usercollection.countDocuments(query);
        const partnershipcount = await partnershipcollection.countDocuments(
          query
        );
        const productscount = await shopprod1uctcollection.countDocuments(
          query
        );
        const ordercount = await shopordercollection.countDocuments(query);
        res.send({
          usernumber,
          partnershipcount,
          productscount,
          ordercount,
        });
      } catch (error) {}
    });
    app.put("/userupdate", async (req, res) => {
      try {
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
        const result = await usercollection.updateOne(
          filter,
          updateuser,
          option
        );
        res.send(result);
      } catch (error) {}
    });
    app.put("/usercategory", async (req, res) => {
      try {
        const email = req.query.email;
        const filter = {
          email: email,
        };
        const productcategory = req.body.firstCategoryName;
        const option = { upsert: true };
        const updateuser = {
          $set: {
            productcategory,
          },
        };
        const result = await usercollection.updateOne(
          filter,
          updateuser,
          option
        );
        res.send(result);
      } catch (error) {}
    });
    app.post("/address", verifyjwt, async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.get("/address", verifyjwt, async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.get("/staff", async (req, res) => {
      try {
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
        res.send({ result, count });
      } catch (error) {}
    });

    app.get("/staff_name", verifyjwt, verifyAdmin, async (req, res) => {
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const searchname = req.query.search;
        const searchemail = req.query.searchemail;
        const role = req.query.role;
        const reset = req.query.reset;
        let query = {};
        if (searchname?.length >= 1 && searchname) {
          query = {
            $text: {
              $search: searchname,
            },
          };
        }
        if (searchemail && searchemail?.length) {
          query = {
            email: searchemail,
          };
        }
        if (role && role?.length >= 1) {
          query = {
            role: role,
          };
        }
        let result = await staffcollection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await staffcollection.countDocuments(query);
        res.send({ result, count });
      } catch (error) {}
    });
    app.get(
      "/staff_information",
      verifyjwt,
      verifyEmployee,
      async (req, res) => {
        try {
          const page = req.query.page;
          const size = parseInt(req.query.size);
          const searchname = req.query.search;
          const searchemail = req.query.searchemail;
          const role = req.query.role;
          const reset = req.query.reset;
          let query = {};
          if (searchname?.length >= 1 && searchname) {
            query = {
              $text: {
                $search: searchname,
              },
            };
          }
          if (searchemail && searchemail?.length) {
            query = {
              email: searchemail,
            };
          }
          if (role && role?.length >= 1) {
            query = {
              role: role,
            };
          }
          let result = await staffcollection
            .find(query)
            .skip(page * size)
            .limit(size)
            .toArray();
          const count = await staffcollection.countDocuments(query);
          res.send({ result, count });
        } catch (error) {}
      }
    );
    app.get("/allusers", async (req, res) => {
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const searchname = req.query.searchname;
        const searchemail = req.query.searchemail;
        const searchrole = req.query.searchrole;
        const reset = req.query.reset;
        let query = {};
        if (searchname.length >= 1 && searchname) {
          email = {
            $text: {
              $search: searchname,
            },
          };
        }
        if (searchemail && searchemail?.length >= 1) {
          query = {
            email: searchemail,
          };
        }
        if (searchrole && searchrole === "Premium") {
          query = {
            role: "Premium",
          };
        }
        if (searchrole && searchrole === "normal") {
          query = {
            role: {
              $ne: "Premium",
            },
          };
        }
        const result = await usercollection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await usercollection.countDocuments(query);
        res.send({ result, count });
      } catch (error) {}
    });
    app.get("/single_staff", verifyjwt, verifyAdmin, async (req, res) => {
      try {
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
      } catch (error) {}
    });
    app.get("/single_staff_staff", verifyjwt, verifyAdmin, async (req, res) => {
      try {
        const staff = req.query.staff;
        const page = req.query.page;
        const size = parseInt(req.query.size);
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
      } catch (error) {}
    });
    app.get(
      "/single_employee_staff",
      verifyjwt,
      verifyEmployee,
      async (req, res) => {
        try {
          const staff = req.query.staff;
          const page = req.query.page;
          const size = parseInt(req.query.size);
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
        } catch (error) {}
      }
    );
    app.post("/addstaff", async (req, res) => {
      try {
        const staffinfo = req.body;
        const lastEmployee = await staffcollection.findOne(
          {},
          { sort: { _id: -1 } }
        );
        let lastEmployeeNumber = 0;
        if (lastEmployee && lastEmployee.employee_id) {
          const lastEmployeeParts = lastEmployee.employee_id.split("-");
          lastEmployeeNumber = parseInt(lastEmployeeParts[1]);
        }
        const newEmployeeNumber = lastEmployeeNumber + 1;
        const employee_id = `E-${String(newEmployeeNumber).padStart(5, "0")}`;
        const info = { ...staffinfo, employee_id };
        const result = await staffcollection.insertOne(info);
        res.send(result);
      } catch (error) {
        console.error("Error adding staff:", error);
        res.status(500).send("Error adding staff");
      }
    });
    app.post("/add/customer", async (req, res) => {
      try {
        const staffinfo = req.body;
        const customer = await usercollection.findOne({
          email: staffinfo?.email,
        });
        if (customer) {
          res.send({ error: `${staffinfo?.email} was previously used` });
        } else {
          const result = await usercollection.insertOne(staffinfo);
          if (result) {
            sendPremimCustomer(
              {
                subject: `Your Premium Account has been created successfully!!! `,
                message: staffinfo,
              },
              staffinfo?.email
            );
          }
          res.send(result);
        }
      } catch (error) {}
    });
    app.post("/employee/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        const employee = await staffcollection.findOne({ email, password });
        if (employee) {
          res.status(200).json({ message: "Login successful", employee });
        } else {
          res.status(401).json({ error: "Invalid credentials" });
        }
      } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.put("/edit_staff/:id", async (req, res) => {
      try {
        const staffinfo = req.body;
        const id = req.params.id;
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
            salary: staffinfo?.salary,
            cardId: staffinfo?.cardId,
          },
        };
        const result = await staffcollection.updateOne(
          filter,
          updatedoc,
          option
        );
        res.send(result);
      } catch (error) {}
    });
    app.put("/edit_customers", async (req, res) => {
      try {
        const staffinfo = req.body;
        const filter = {
          _id: new ObjectId(staffinfo?.id),
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
            created_date: staffinfo?.created_date,
            isCustomer: staffinfo?.isCustomer,
          },
        };
        const result = await usercollection.updateOne(
          filter,
          updatedoc,
          option
        );
        if (result.modifiedCount >= 1) {
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false });
        }
      } catch (error) {
        res.send({ sucess: false });
      }
    });
    app.put("/edit_product/:id", async (req, res) => {
      try {
        const staffInfo = req.body;
        const id = req.params.id;
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
    app.put("/edit_blog", async (req, res) => {
      try {
        const categoryinfo = req.body;
        const id = categoryinfo.id;
        const filter = {
          _id: new ObjectId(id),
        };
        const options = {
          upsert: false,
        };
        const updateDoc = {
          $set: {
            image: categoryinfo?.image,
            name: categoryinfo?.name,
            date: categoryinfo?.date,
            para1: categoryinfo?.para1,
            para2: categoryinfo?.para2,
            para3: categoryinfo?.para3,
            para4: categoryinfo?.para4,
          },
        };
        const result = await blogcollections.updateOne(
          filter,
          updateDoc,
          options
        );
        if (result) {
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false });
        }
      } catch (error) {
        console.error(error);
        res.send({ sucess: false });
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
      const query = { _id: { $in: productIds.map((id) => new ObjectId(id)) } };
      try {
        const result = await shopprod1uctcollection.deleteMany(query);
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
    app.delete("/delete-service", async (req, res) => {
      const productIds = req.body;
      const query = { _id: { $in: productIds.map((id) => new ObjectId(id)) } };
      try {
        const result = await servicescollections.deleteMany(query);
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No service found for deletion" });
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting service", error: error.message });
      }
    });
    app.delete("/delete-blog", async (req, res) => {
      const productIds = req.body;
      const query = { _id: { $in: productIds.map((id) => new ObjectId(id)) } };
      try {
        const result = await blogcollections.deleteMany(query);
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No blog found for deletion" });
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting blog", error: error.message });
      }
    });
    app.delete("/delete-project", async (req, res) => {
      const productIds = req.body;
      const query = { _id: { $in: productIds.map((id) => new ObjectId(id)) } };
      try {
        const result = await projectscollections.deleteMany(query);
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No project found for deletion" });
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting project", error: error.message });
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
      const query = {
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      };
      try {
        const result = await shopcategorycollection.deleteMany(query);
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
    app.delete("/delete_review", async (req, res) => {
      const id = req.query.id;
      const query = {
        _id: new ObjectId(id),
      };
      try {
        const result = await reviewcollection.deleteOne(query);
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
    app.delete("/delete-customized-category", async (req, res) => {
      const productIds = req.body;
      const query = {
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      };
      try {
        const result = await categorycollections.deleteMany(query);
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

    app.delete("/delete-single-product", async (req, res) => {
      const productIds = req.body;
      const query = {
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      };
      try {
        const result = await shopprod1uctcollection.deleteMany(query);
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
    app.delete("/delete-single-service", async (req, res) => {
      const productIds = req.body;
      const query = {
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      };
      try {
        const result = await servicescollections.deleteMany(query);
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No service found for deletion" });
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting service", error: error.message });
      }
    });
    app.delete("/delete-single-blog", async (req, res) => {
      const productIds = req.body;
      const query = {
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      };
      try {
        const result = await blogcollections.deleteMany(query);
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No blog found for deletion" });
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting blog", error: error.message });
      }
    });
    app.delete("/delete-single-project", async (req, res) => {
      const productIds = req.body;
      const query = {
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      };
      try {
        const result = await projectscollections.deleteMany(query);
        if (result.deletedCount > 0) {
          res.json(result);
        } else {
          res.status(404).json({ message: "No project found for deletion" });
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting project", error: error.message });
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
        try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await staffcollection.deleteOne(query);
          res.send(result);
        } catch (error) {}
      }
    );
    app.delete(
      `/delete-customers/:id`,
      verifyjwt,
      verifyAdmin,
      async (req, res) => {
        try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await usercollection.deleteOne(query);
          res.send(result);
        } catch (error) {}
      }
    );
    app.put("/staff/admin/:id", verifyjwt, verifyAdmin, async (req, res) => {
      try {
        const decodedemail = req.decoded.email;
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
        const result = await staffcollection.updateOne(
          filter,
          updatedoc,
          option
        );
        res.send(result);
      } catch (error) {}
    });
    app.put(
      "/customer/premium/:id/:status",
      verifyjwt,
      verifyAdmin,
      async (req, res) => {
        const decodedemail = req.decoded.email;
        const id = req.params.id;
        const status = req.params.status;
        const email = req.params.email;
        const filter = {
          _id: new ObjectId(id),
        };
        const option = {
          upsert: true,
        };
        let updatedoc = {
          $set: {
            role: "Premium",
          },
        };
        if (status && status?.length >= 1 && status === "Normal") {
          updatedoc = {
            $set: {
              role: "Normal",
            },
          };
        }
        if (status && status?.length >= 1 && status === "Premium") {
          updatedoc = {
            $set: {
              role: "Premium",
            },
          };
        }
        const result = await usercollection.updateOne(
          filter,
          updatedoc,
          option
        );
        const staffinfo = await usercollection.findOne({
          _id: new ObjectId(id),
        });
        if (staffinfo && result && status === "Premium") {
          sendPremimCustomer1(
            {
              subject: `Now your account is ${status} !!!`,
              message: staffinfo,
            },
            staffinfo?.email
          );
        }
        if (staffinfo && result && status === "Normal") {
          sendPremimCustomer2(
            {
              subject: `Now your account is ${status} !!!`,
              message: staffinfo,
            },
            staffinfo?.email
          );
        }

        res.send(result);
      }
    );
    app.get(`/staff/admin/:email`, async (req, res) => {
      try {
        const email = req.params.email;
        const query = {
          email: email,
        };
        const user = await staffcollection.findOne(query);
        res.send({ isAdmin: user?.role === "admin" });
      } catch (error) {}
    });
    app.get(`/staff/employee/:email`, async (req, res) => {
      try {
        const email = req.params.email;
        const query = {
          email: email,
        };
        const user = await staffcollection.findOne(query);
        res.send({ isEmployee: user?.isEmployee });
      } catch (error) {}
    });
    app.get(`/staff/employee/manager/:email`, async (req, res) => {
      try {
        const email = req.params.email;
        const query = {
          email: email,
        };
        const user = await staffcollection.findOne(query);
        res.send({ isManager: user?.role === "Manager" });
      } catch (error) {}
    });
    app.get("/single/employee", verifyjwt, verifyEmployee, async (req, res) => {
      try {
        const decodedemail = req.decoded.email;
        const email = req.query.email;
        const result = await staffcollection.findOne({ email });
        res.send(result);
      } catch (error) {}
    });
    app.get("/staff/check", async (req, res) => {
      try {
        const email = req.query.email;
        const password = req.query.password;
        const query = {
          email: email,
          password: password,
        };
        const staff = await staffcollection.findOne(query);
        if (staff) {
          res.send({
            staff,
            isStaff: true,
          });
        } else {
          res.send({
            isStaff: false,
          });
        }
      } catch (error) {}
    });
    app.get("/customer/check", async (req, res) => {
      try {
        const email = req.query.email;
        const password = req.query.password;
        const query = {
          email: email,
          password: password,
        };
        const user = await usercollection.findOne(query);
        if (user) {
          res.send({
            user,
            isPremium: true,
          });
        } else {
          res.send({
            isPremium: false,
          });
        }
      } catch (error) {}
    });
    app.get("/staff_id", async (req, res) => {
      try {
        const email = req.query.email;
        const result = await staffcollection.findOne({ email });
        res.send(result);
      } catch (err) {}
    });
    // app.post("/addAttendance", async (req, res) => {
    //   try {
    //     const staffinfo1 = req.body;
    //     const isvalidatedemployee = await staffcollection.findOne({
    //       employee_id: staffinfo1.employee_id,
    //     });
    //     if (!isvalidatedemployee) {
    //       return res.status(400).json({ error: "Invalid Employee ID" });
    //     }
    //     const photo = isvalidatedemployee?.photo;
    //     const name = isvalidatedemployee?.name;
    //     const staffinfo = {
    //       ...staffinfo1,
    //       photo,
    //       name,
    //     };
    //     const currentTime = moment();
    //     console.log(currentTime.format("hh:mm A"));
    //     const before8AM = moment("8:00", "HH:mm");
    //     const after5PM = moment("17:00", "HH:mm");
    //     if (
    //       !(
    //         currentTime.isBefore(before8AM) ||
    //         currentTime.isSameOrAfter(after5PM)
    //       )
    //     ) {
    //       return res.status(400).json({
    //         error: "Attendance can only be given before 8 AM or after 5 PM",
    //       });
    //     }
    //     const existingAttendance = await attendancellection.findOne({
    //       employee_id: staffinfo.employee_id,
    //       attendance_date: currentTime.format("DD/MM/YY"),
    //     });
    //     if (
    //       (currentTime.isBefore(before8AM) &&
    //         existingAttendance?.status_in === "present") ||
    //       (currentTime.isSameOrAfter(after5PM) &&
    //         existingAttendance?.status_out === "present")
    //     ) {
    //       return res.status(400).json({
    //         error: "Attendance already given for the specified time period",
    //       });
    //     }
    //     if (currentTime.isBefore(before8AM)) {
    //       staffinfo.status_in = "present";
    //       staffinfo.status_out = "absence";
    //       staffinfo.attendance_in_time = currentTime.format("hh:mm A");
    //       staffinfo.attendance_out_time = "13:00 PM";
    //       staffinfo.totalDuration = calculateTotalTime(
    //         staffinfo.attendance_in_time,
    //         staffinfo.attendance_out_time
    //       );
    //     } else if (currentTime.isSameOrAfter(after5PM)) {
    //       if (existingAttendance?.status_in === "present") {
    //         const totalDuration = calculateTotalTime(
    //           existingAttendance?.attendance_in_time,
    //           currentTime.format("hh:mm A")
    //         );
    //         const updateOperation = {
    //           $set: {
    //             status_out: "present",
    //             attendance_out_time: currentTime.format("hh:mm A"),
    //             totalDuration,
    //           },
    //         };
    //         const result = await attendancellection.updateOne(
    //           {
    //             employee_id: staffinfo.employee_id,
    //             attendance_date: currentTime.format("DD/MM/YY"),
    //           },
    //           updateOperation
    //         );
    //         return res
    //           .status(200)
    //           .json({ success: true, message: "Attendance updated" });
    //       } else {
    //         staffinfo.status_out = "present";
    //         staffinfo.status_in = "absence";
    //         staffinfo.attendance_out_time = currentTime.format("hh:mm A");
    //         staffinfo.attendance_in_time = "13:00 AM";
    //         staffinfo.totalDuration = calculateTotalTime(
    //           staffinfo.attendance_in_time,
    //           staffinfo.attendance_out_time
    //         );
    //       }
    //       staffinfo.status_out = "present";
    //       staffinfo.attendance_out_time = currentTime.format("hh:mm A");
    //     }
    //     staffinfo.attendance_date = currentTime.format("DD/MM/YY");
    //     const result = await attendancellection.insertOne(staffinfo);
    //     res.status(200).json({ success: true, message: "Attendance added" });
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   }
    // });

    app.post("/addAttendance", async (req, res) => {
      try {
        const staffinfo1 = req.body;
        const isvalidatedemployee = await staffcollection.findOne({
          employee_id: staffinfo1.employee_id,
        });
        if (!isvalidatedemployee) {
          return res.status(400).json({ error: "Invalid Employee ID" });
        }
        const photo = isvalidatedemployee?.photo;
        const name = isvalidatedemployee?.name;
        const staffinfo = {
          ...staffinfo1,
          photo,
          name,
        };
        const currentTime = moment();
        const before8AM = moment("11:59", "HH:mm");
        const after5PM = moment("12:00", "HH:mm");

        const existingAttendance = await attendancellection.findOne({
          employee_id: staffinfo.employee_id,
          attendance_date: currentTime.format("DD/MM/YY"),
        });
        if (
          (currentTime.isBefore(before8AM) &&
            existingAttendance?.status_in === "present") ||
          (currentTime.isSameOrAfter(after5PM) &&
            existingAttendance?.status_out === "present")
        ) {
          return res.status(400).json({
            error: "Attendance already given for the specified time period",
          });
        }
        if (currentTime.isBefore(before8AM)) {
          staffinfo.status_in = "present";
          staffinfo.status_out = "absence";
          staffinfo.attendance_in_time = currentTime.format("hh:mm A");
          staffinfo.attendance_out_time = "13:00 PM";
          staffinfo.totalDuration = calculateTotalTime(
            staffinfo.attendance_in_time,
            staffinfo.attendance_out_time
          );
        } else if (currentTime.isSameOrAfter(after5PM)) {
          if (existingAttendance?.status_in === "present") {
            const totalDuration = calculateTotalTime(
              existingAttendance?.attendance_in_time,
              currentTime.format("hh:mm A")
            );
            const updateOperation = {
              $set: {
                status_out: "present",
                attendance_out_time: currentTime.format("hh:mm A"),
                totalDuration,
              },
            };
            const result = await attendancellection.updateOne(
              {
                employee_id: staffinfo.employee_id,
                attendance_date: currentTime.format("DD/MM/YY"),
              },
              updateOperation
            );
            return res
              .status(200)
              .json({ success: true, message: "Attendance updated" });
          } else {
            staffinfo.status_out = "present";
            staffinfo.status_in = "absence";
            staffinfo.attendance_out_time = currentTime.format("hh:mm A");
            staffinfo.attendance_in_time = "13:00 AM";
            staffinfo.totalDuration = calculateTotalTime(
              staffinfo.attendance_in_time,
              staffinfo.attendance_out_time
            );
          }
          staffinfo.status_out = "present";
          staffinfo.attendance_out_time = currentTime.format("hh:mm A");
        }
        staffinfo.attendance_date = currentTime.format("DD/MM/YY");
        const result = await attendancellection.insertOne(staffinfo);
        res.status(200).json({ success: true, message: "Attendance added" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    function calculateTotalTime(attendanceInTime, attendanceOutTime) {
      if (!attendanceInTime && !attendanceOutTime) {
        return "00:00";
      }
      if (!attendanceInTime) {
        attendanceInTime = "13:00 PM";
      }
      if (!attendanceOutTime) {
        attendanceOutTime = "13:00 PM";
      }
      const format = "hh:mm A";
      const inTime = moment(attendanceInTime, format);
      const outTime = moment(attendanceOutTime, format);
      const diffMilliseconds = outTime.diff(inTime);
      const duration = moment.duration(diffMilliseconds);
      const totalDuration = moment
        .utc(duration.asMilliseconds())
        .format("HH:mm");
      return totalDuration;
    }
    async function isValidEmployeeId(employeeId) {
      try {
        const employee = await staffcollection.findOne({
          employee_id: employeeId,
        });
        if (employee) {
          return employee;
        }
      } catch (err) {
        console.error("Error in isValidEmployeeId:", err);
        throw err;
      }
    }
    app.post("/triggerAttendanceCheck", async (req, res) => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const formattedToday = format(today, "dd/MM/yy");
        const employees = await staffcollection
          .find({ isEmployee: true })
          .toArray();
        for (const employee of employees) {
          const attendance = await attendancellection.findOne({
            employee_id: employee.employee_id,
            attendance_date: formattedToday,
          });
          if (!attendance) {
            const currentTime = new Date();
            const attendanceTime = format(currentTime, "hh:mm a");
            await attendancellection.insertOne({
              photo: employee?.photo,
              name: employee?.name,
              employee_id: employee.employee_id,
              attendance_date: formattedToday,
              attendance_time: attendanceTime,
              status_in: "absence",
              status_out: "absence",
              attendance_in_time: "00:00 AM",
              attendance_out_time: "00:00 PM",
              totalDuration: "00:00",
            });
          }
        }
        res.send({ sucess: "sucess" });
      } catch (error) {
        console.error("Error during manual Attendance Check:", error);
        res.status(500).send("Error during manual Attendance Check.");
      }
    });
    app.get("/todayAttendance", async (req, res) => {
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const search = req.query.search;
        const reset = req.query.reset;
        const status = req.query.status;
        const employeeId = req.query.employeeId;
        const today = new Date();
        const formattedToday = format(today, "dd/MM/yy");
        let query = { attendance_date: formattedToday };

        if (employeeId !== undefined && employeeId?.length >= 1) {
          query = { attendance_date: formattedToday, employee_id: employeeId };
        }
        if (search?.length >= 1 && search) {
          query = {
            attendance_date: formattedToday,
            $text: { $search: search },
          };
        }
        if (status && status?.length >= 1) {
          query = {
            attendance_date: formattedToday,
            status_in: status,
            status_out: status,
          };
        }
        const attendance = await attendancellection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await attendancellection.countDocuments(query);

        res.send({ count, attendance });
      } catch (error) {}
    });

    function parseCustomDate(dateString) {
      const [day, month, year] = dateString.split("/");
      const fullYear = parseInt("20" + year, 10);
      const parsedDate = new Date(Date.UTC(fullYear, month - 1, day));
      return parsedDate;
    }
    app.get("/attendanceSheet", async (req, res) => {
      try {
        const page = req.query.page;
        const pageSize = parseInt(req.query.size);
        const search = req.query.employeeId;
        const reset = req.query.reset;
        const currentMonthStart = startOfMonth(new Date());
        const currentMonthEnd = endOfMonth(new Date());
        const currentDate = new Date();
        const firstDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const lastDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
        const formattedFirstDay = formatDate(firstDayOfMonth);
        const formattedLastDay = formatDate(lastDayOfMonth);
        let query = {
          isEmployee: true,
        };
        if (search && search?.length >= 1) {
          query = {
            isEmployee: true,
            employee_id: search,
          };
        }
        const employees = await staffcollection
          .find(query)
          .skip(page * pageSize)
          .limit(pageSize)
          .toArray();
        const count = await staffcollection.countDocuments({
          isEmployee: true,
        });
        const attendanceSheet = [];
        for (const employee of employees) {
          const attendanceRecords = await attendancellection
            .find({
              employee_id: employee.employee_id,
              attendance_date: {
                $gte: formattedFirstDay,
                $lte: formattedLastDay,
              },
            })
            .toArray();
          const formattedAttendance = [];
          for (
            let day = 1;
            day <= endOfMonth(currentMonthStart).getDate();
            day++
          ) {
            const currentDate = new Date(currentMonthStart);
            currentDate.setDate(day);
            const attendanceRecord = attendanceRecords.find((record) => {
              const recordDate = parseCustomDate(record.attendance_date);
              return isSameDay(recordDate, currentDate);
            });
            let symbol = "P";
            if (!attendanceRecord) {
              symbol = "A";
            }
            if (isFriday(currentDate)) {
              symbol = "*";
            }
            if (attendanceRecord) {
              if (
                attendanceRecord?.status_in === "absence" &&
                attendanceRecord?.status_out === "absence"
              ) {
                symbol = "A";
              }
              if (
                (attendanceRecord?.status_in === "present" &&
                  attendanceRecord?.status_out === "absence") ||
                (attendanceRecord?.status_in === "absence" &&
                  attendanceRecord?.status_out === "present")
              ) {
                symbol = "HP";
              }
            }
            formattedAttendance.push({
              date: format(currentDate, "dd/MM/yy"),
              symbol,
            });
          }
          const employeeAttendanceSheet = {
            employeeId: employee.employee_id,
            name: `${employee.name} ${employee.lastname}`,
            photo: employee?.photo,
            attendance: formattedAttendance,
          };
          attendanceSheet.push(employeeAttendanceSheet);
        }
        res.json({
          attendanceSheet,
          count,
        });
      } catch (error) {
        console.error("Error generating Attendance Sheet:", error);
        res.status(500).send("Error generating Attendance Sheet.");
      }
    });
    app.get("/singleAttendance/:employee_id", async (req, res) => {
      try {
        const employee_id = req.params.employee_id;
        const currentDate = new Date();
        const startOfMonthString = formatDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        );
        const endOfMonthString = formatDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        );
        const attendancein = await attendancellection
          .find({
            employee_id: employee_id,
            $expr: {
              $and: [
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 6, 4] },
                    startOfMonthString.substring(6),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 6, 4] },
                    endOfMonthString.substring(6),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 3, 2] },
                    startOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 3, 2] },
                    endOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 0, 2] },
                    startOfMonthString.substring(0, 2),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 0, 2] },
                    endOfMonthString.substring(0, 2),
                  ],
                },
              ],
            },
            status_in: "present",
          })
          .toArray();
        const attendanceout = await attendancellection
          .find({
            employee_id: employee_id,
            $expr: {
              $and: [
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 6, 4] },
                    startOfMonthString.substring(6),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 6, 4] },
                    endOfMonthString.substring(6),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 3, 2] },
                    startOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 3, 2] },
                    endOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 0, 2] },
                    startOfMonthString.substring(0, 2),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 0, 2] },
                    endOfMonthString.substring(0, 2),
                  ],
                },
              ],
            },
            status_out: "present",
          })
          .toArray();
        const firstDayOfNextMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
        const numberOfDays = firstDayOfNextMonth.getDate();
        const status_in_present = parseInt(attendancein.length);
        const status_out_present = parseInt(attendanceout.length);
        const status_in_absence =
          parseInt(numberOfDays) - parseInt(attendancein.length);
        const status_out_absence =
          parseInt(numberOfDays) - parseInt(attendanceout.length);
        const result = {
          status_in_present,
          status_out_present,
          status_in_absence,
          status_out_absence,
        };
        res.send({ sucess: true, result });
      } catch (error) {
        res.send({ sucess: false });
      }
    });
    app.get("/weekAttendance/:employee_id", async (req, res) => {
      try {
        const employee_id = req.params.employee_id;
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate);
        const currentDayOfWeek = currentDate.getDay();
        const daysUntilFriday =
          currentDayOfWeek >= 5
            ? 5 - currentDayOfWeek + 7
            : 5 - currentDayOfWeek;
        startOfWeek.setDate(currentDate.getDate() - daysUntilFriday);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const startOfWeekString = formatDate(startOfWeek);
        const endOfWeekString = formatDate(endOfWeek);
        const attendance = await attendancellection
          .find({
            employee_id: employee_id,
            $expr: {
              $and: [
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 6, 4] },
                    startOfWeekString.substring(6),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 6, 4] },
                    endOfWeekString.substring(6),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 3, 2] },
                    startOfWeekString.substring(3, 5),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 3, 2] },
                    endOfWeekString.substring(3, 5),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 0, 2] },
                    startOfWeekString.substring(0, 2),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 0, 2] },
                    endOfWeekString.substring(0, 2),
                  ],
                },
              ],
            },
          })
          .toArray();
        const daysOfWeek = [];
        for (
          let day = new Date(startOfWeek);
          day <= endOfWeek;
          day.setDate(day.getDate() + 1)
        ) {
          daysOfWeek.push(formatDate(day));
        }
        const data = daysOfWeek.map((day) => {
          const dayData = attendance.find(
            (item) => item?.attendance_date === day
          );
          return {
            name: day,
            uv: 12,
            duration: dayData ? parseFloat(dayData.totalDuration) : 0,
            amt: 12,
          };
        });
        res.send(data);
      } catch (error) {}
    });
    app.get("/monthAttendance/:employee_id", async (req, res) => {
      const employee_id = req.params.employee_id;
      const currentDate = new Date();
      const startOfMonthString = formatDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      );
      const endOfMonthString = formatDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      );
      const attendance = await attendancellection
        .find({
          employee_id: employee_id,
          $expr: {
            $and: [
              {
                $gte: [
                  { $substrCP: ["$attendance_date", 6, 4] },
                  startOfMonthString.substring(6),
                ],
              },
              {
                $lte: [
                  { $substrCP: ["$attendance_date", 6, 4] },
                  endOfMonthString.substring(6),
                ],
              },
              {
                $gte: [
                  { $substrCP: ["$attendance_date", 3, 2] },
                  startOfMonthString.substring(3, 5),
                ],
              },
              {
                $lte: [
                  { $substrCP: ["$attendance_date", 3, 2] },
                  endOfMonthString.substring(3, 5),
                ],
              },
              {
                $gte: [
                  { $substrCP: ["$attendance_date", 0, 2] },
                  startOfMonthString.substring(0, 2),
                ],
              },
              {
                $lte: [
                  { $substrCP: ["$attendance_date", 0, 2] },
                  endOfMonthString.substring(0, 2),
                ],
              },
            ],
          },
        })
        .toArray();
      const daysOfMonth = [];
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      const startOfMonthString1 = formatDate(startOfMonth);
      const endOfMonthString1 = formatDate(endOfMonth);

      const startDate = new Date(
        startOfMonth.getFullYear(),
        startOfMonth.getMonth(),
        startOfMonth.getDate(),
        0,
        0,
        0,
        0
      );

      const endDate = new Date(
        endOfMonth.getFullYear(),
        endOfMonth.getMonth(),
        endOfMonth.getDate(),
        23,
        59,
        59,
        999
      );
      for (
        let day = startDate;
        day <= endDate;
        day.setDate(day.getDate() + 1)
      ) {
        daysOfMonth.push(formatDate(new Date(day))); // Ensure proper formatting
      }
      const data = daysOfMonth.map((day) => {
        const dayData = attendance.find(
          (item) => item?.attendance_date === day
        );
        return {
          name: day.split("/")[0],
          uv: 12,
          duration: dayData ? parseFloat(dayData.totalDuration) : 0,
          amt: 12,
        };
      });
      res.send(data);
    });
    app.get(`/specificAttendance`, async (req, res) => {
      try {
        const employee_id = req.query.employee_id;
        const currentDate = new Date();
        const firstDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const lastDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
        const startOfMonthString = formatDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        );
        const endOfMonthString = formatDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        );
        const attendanceThisMonth = await attendancellection
          .find({
            employee_id: employee_id,
            $expr: {
              $and: [
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 6, 4] },
                    startOfMonthString.substring(6),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 6, 4] },
                    endOfMonthString.substring(6),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 3, 2] },
                    startOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 3, 2] },
                    endOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$attendance_date", 0, 2] },
                    startOfMonthString.substring(0, 2),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$attendance_date", 0, 2] },
                    endOfMonthString.substring(0, 2),
                  ],
                },
              ],
            },
          })
          .toArray();
        const employeeinfo = await staffcollection.findOne({
          employee_id: employee_id,
        });

        const averageInTime = calculateAverageTime(
          attendanceThisMonth.map((record) => record.attendance_in_time)
        );
        const averageOutTime = calculateAverageTime(
          attendanceThisMonth.map((record) => record.attendance_out_time)
        );
        const averageWorkingTime =
          calculateAverageWorkingTime(attendanceThisMonth);
        res.json({
          attendanceThisMonth,
          employeeinfo,
          averageInTime,
          averageOutTime,
          averageWorkingTime,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.get(`/myAttendance`, async (req, res) => {
      try {
        const employee_id = req.query.employee_id;
        const attendance_date = req.query.attendance_date;
        const reset = req.query.reset;
        const currentDate = new Date();
        const firstDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const lastDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
        const startOfMonthString = formatDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        );
        const endOfMonthString = formatDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        );
        let query = {
          employee_id: employee_id,
          $expr: {
            $and: [
              {
                $gte: [
                  { $substrCP: ["$attendance_date", 6, 4] },
                  startOfMonthString.substring(6),
                ],
              },
              {
                $lte: [
                  { $substrCP: ["$attendance_date", 6, 4] },
                  endOfMonthString.substring(6),
                ],
              },
              {
                $gte: [
                  { $substrCP: ["$attendance_date", 3, 2] },
                  startOfMonthString.substring(3, 5),
                ],
              },
              {
                $lte: [
                  { $substrCP: ["$attendance_date", 3, 2] },
                  endOfMonthString.substring(3, 5),
                ],
              },
              {
                $gte: [
                  { $substrCP: ["$attendance_date", 0, 2] },
                  startOfMonthString.substring(0, 2),
                ],
              },
              {
                $lte: [
                  { $substrCP: ["$attendance_date", 0, 2] },
                  endOfMonthString.substring(0, 2),
                ],
              },
            ],
          },
        };
        if (attendance_date && attendance_date?.length >= 1) {
          const formattedDate = moment(attendance_date).format("DD/MM/YY");
          query = {
            employee_id: employee_id,
            attendance_date: formattedDate,
          };
        }
        const attendanceThisMonth = await attendancellection
          .find(query)
          .toArray();
        const employeeinfo = await staffcollection.findOne({
          employee_id: employee_id,
        });

        const averageInTime = calculateAverageTime(
          attendanceThisMonth.map((record) => record.attendance_in_time)
        );
        const averageOutTime = calculateAverageTime(
          attendanceThisMonth.map((record) => record.attendance_out_time)
        );
        const averageWorkingTime =
          calculateAverageWorkingTime(attendanceThisMonth);
        res.json({
          attendanceThisMonth,
          employeeinfo,
          averageInTime,
          averageOutTime,
          averageWorkingTime,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.get("/mysalary/:employee_id", async (req, res) => {
      const employee_id = req.params.employee_id;
      const currentYear = moment().year();
      const startOfYear = moment().startOf("year");
      const endOfYear = moment().endOf("year");
      const startOfYearString = startOfYear.format("DD/MM/YYYY");
      const endOfYearString = endOfYear.format("DD/MM/YYYY");
      const orders = await salaryllection
        .find({
          employee_id: employee_id,
          $expr: {
            $and: [
              {
                $eq: [
                  { $toInt: { $substrCP: ["$salary_date", 6, 4] } },
                  currentYear,
                ],
              },
              {
                $gte: [
                  { $substrCP: ["$salary_date", 3, 2] },
                  startOfYearString.substring(3, 5),
                ],
              },
              {
                $lte: [
                  { $substrCP: ["$salary_date", 3, 2] },
                  endOfYearString.substring(3, 5),
                ],
              },
              {
                $gte: [
                  { $substrCP: ["$salary_date", 0, 2] },
                  startOfYearString.substring(0, 2),
                ],
              },
              {
                $lte: [
                  { $substrCP: ["$salary_date", 0, 2] },
                  endOfYearString.substring(0, 2),
                ],
              },
            ],
          },
        })
        .toArray();
      res.send(orders);
    });

    app.put("/edit_employee-attendance/:id", async (req, res) => {
      try {
        const attendanceinfo = req.body;
        const id = req.params.id;
        const filter = {
          _id: new ObjectId(id),
        };
        const options = {
          upsert: false,
        };
        const updateDoc = {
          $set: {
            attendance_in_time: attendanceinfo?.attendance_in_time,
            attendance_out_time: attendanceinfo?.attendance_out_time,
            status_in: attendanceinfo?.status_in,
            status_out: attendanceinfo?.status_out,
          },
        };
        const result = await attendancellection.updateOne(
          filter,
          updateDoc,
          options
        );
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
    app.delete(`/delete-employee-attendance/:id`, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await attendancellection.deleteOne(query);
        res.send(result);
      } catch (error) {}
    });
    const calculateAverageTime = (timeArray) => {
      if (!timeArray || timeArray.length === 0) {
        return "N/A";
      }
      const moments = timeArray.map((timeString) =>
        moment(timeString, "hh:mm A")
      );
      const totalMinutes = moments.reduce(
        (total, momentObj) =>
          total + momentObj.hours() * 60 + momentObj.minutes(),
        0
      );
      const averageMinutes = Math.round(totalMinutes / timeArray.length);
      const hours = Math.floor(averageMinutes / 60);
      const minutes = averageMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    };
    const calculateAverageWorkingTime = (attendanceRecords) => {
      if (!attendanceRecords || attendanceRecords.length === 0) {
        return "N/A";
      }
      const totalWorkingMinutes = attendanceRecords.reduce((total, record) => {
        const [hours, minutes] = record.totalDuration.split(":").map(Number);
        return total + hours * 60 + minutes;
      }, 0);
      const averageWorkingMinutes = Math.round(
        totalWorkingMinutes / attendanceRecords.length
      );
      const hours = Math.floor(averageWorkingMinutes / 60);
      const minutes = averageWorkingMinutes % 60;

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    };
    function formatDate(date) {
      const day = ("0" + date.getDate()).slice(-2);
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const year = (date.getFullYear() + "").slice(-2);
      return `${day}/${month}/${year}`;
    }
    app.post("/employee-payment-intent", async (req, res) => {
      const { salary, employee_id, email } = req.body;
      const currentMonth = new Date().toLocaleString("en-us", {
        month: "long",
      });
      const currentTime = new Date().toLocaleTimeString();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: salary,
        currency: "bdt",
        description: `Employee Salary Payment ${employee_id} - ${currentMonth} ${currentTime}`,
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    });
    app.post("/make-payment", async (req, res) => {
      const { amount, employeeId, email, employeeinfo } = req.body;
      const randomDigit = Math.floor(Math.random() * 100000);
      const payId = `#P${String(randomDigit).padStart(5, "0")}`;
      try {
        const employee = await staffcollection.findOne({
          employee_id: employeeId,
        });
        if (!employee) {
          return res.status(404).json({ error: "Employee not found" });
        }
        const currentMonth = new Date().toLocaleString("en-us", {
          month: "long",
        });

        if (employee.isSalaryPaid) {
          const lastPaymentDateStr = employee.paymentStatus.split(" - ")[1];
          const lastPaymentMonth = lastPaymentDateStr.split(" ")[0];
          if (lastPaymentMonth === currentMonth) {
            return res
              .status(400)
              .json({ error: "Salary already paid for the current month" });
          }
        }
        const currentTime = new Date().toLocaleTimeString();
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "bdt",
          description: `Employee Salary Payment ${employeeId} - ${currentMonth} ${currentTime}`,
        });
        const options = { upsert: true };
        const filter = { employee_id: employeeId };
        const updateOrder = {
          $set: {
            isSalaryPaid: true,
            paymentStatus: `Paid - ${currentMonth} ${currentTime}`,
            tran_id: paymentIntent?.id,
            payId: payId,
          },
        };
        const result = await staffcollection.updateOne(
          filter,
          updateOrder,
          options
        );
        const specificDate = new Date();
        const day = ("0" + specificDate.getDate()).slice(-2);
        const month = ("0" + (specificDate.getMonth() + 1)).slice(-2); // Months are zero-based
        const year = specificDate.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        const salaryinfo = {
          isSalaryPaid: true,
          employee_id: employeeId,
          salary: amount,
          paymentStatus: `Paid - ${currentMonth} ${currentTime}`,
          tran_id: paymentIntent?.id,
          payId: payId,
          salary_date: formattedDate,
        };
        const salary = await salaryllection.insertOne(salaryinfo);
        if (result && salary && paymentIntent?.client_secret) {
          const orderdata = {
            ...employeeinfo,
            currentMonth,
            tran_id: paymentIntent?.id,
            payId: payId,
          };
          sendEmployeemail(
            {
              subject: `Salary add Sucessfully !!!`,
              message: orderdata,
            },
            orderdata?.email
          );
        }
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Payment failed" });
      }
    });
    app.post("/addreview", async (req, res) => {
      try {
        const reviewinfo = req.body;
        const query = {
          category_id: reviewinfo?.category_id,
          product_id: reviewinfo?.product_id,
        };
        const query1 = {
          email: reviewinfo?.email,
          productinfo: {
            $elemMatch: {
              category_id: reviewinfo?.category_id,
              product_id: reviewinfo?.product_id,
            },
          },
          status: "Delivered",
        };
        const existorder = await shopordercollection.find(query1).toArray();
        if (existorder?.length >= 1) {
          const result = await reviewcollection.insertOne(reviewinfo);
          if (result) {
            const reviews = await reviewcollection.find(query).toArray();
            const totalRating = reviews.reduce(
              (sum, review) => sum + review.userRating,
              0
            );
            const averageRating = Math.round(totalRating / reviews.length);
            const filter = {
              category_id: reviewinfo?.category_id,
              product_id: reviewinfo?.product_id,
            };
            const option = { upsert: true };
            const updatedoc = {
              $set: {
                averageRating: averageRating,
              },
            };
            const updateproduct = await shopprod1uctcollection.updateOne(
              filter,
              updatedoc,
              option
            );
            if ((result, updateproduct)) {
              res.send({ sucess: true, result });
            } else {
              res.send({ success: false });
            }
          }
        } else {
          res.send({
            success: false,
            message: "You are not able to give the review.",
          });
        }
      } catch (error) {}
    });

    app.post("/leave/Request", async (req, res) => {
      try {
        const leaveinfo1 = req.body;
        const fromDate = new Date(leaveinfo1?.from_date);
        const toDate = new Date(leaveinfo1?.to_date);
        const timeDifference = toDate - fromDate;
        const no_day = timeDifference / (1000 * 60 * 60 * 24);
        const leaveinfo = {
          ...leaveinfo1,
          no_day,
        };
        const isExist = await staffcollection.findOne({
          email: leaveinfo?.email,
        });
        if (isExist) {
          const result = await leavescollection.insertOne(leaveinfo);
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false });
        }
      } catch (error) {
        res.send({ sucess: false });
      }
    });
    app.get("/my_leave_requests", async (req, res) => {
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const email = req.query.email;
        let query = { email: email };
        const leaves = await leavescollection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await leavescollection.countDocuments(query);
        res.send({ count, leaves });
      } catch (error) {}
    });
    app.get("/all_leave_requests", async (req, res) => {
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const searchvalue = req.query.searchvalue;
        const datesearch = req.query.datesearch;
        const rolesearch = req.query.rolesearch;
        const reset = req.query.reset;
        let query = {};
        if (rolesearch && rolesearch?.length >= 1) {
          query = {
            leave_status: rolesearch,
          };
        }
        if (datesearch && datesearch?.length >= 1) {
          query = {
            apply_date: datesearch,
          };
        }
        if (searchvalue && searchvalue?.length >= 1) {
          query = {
            $text: { $search: searchvalue },
          };
        }
        const leaves = await leavescollection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await leavescollection.countDocuments();
        res.send({ count, leaves });
      } catch (error) {}
    });
    app.put("/leave/Request/edit", async (req, res) => {
      try {
        const leaveinfo = req.body;
        const request_number = leaveinfo?.request_number;
        const filter = {
          email: leaveinfo?.email,
          request_number: leaveinfo?.request_number,
        };
        const option = { upsert: true };
        const updatedoc = {
          $set: {
            name: leaveinfo?.name,
            email: leaveinfo?.email,
            apply_date: leaveinfo?.apply_date,
            from_date: leaveinfo?.from_date,
            to_date: leaveinfo?.to_date,
            half_day: leaveinfo?.half_day,
            leave_status: leaveinfo?.leave_status,
            leave_type: leaveinfo?.leave_type,
            reason: leaveinfo?.reason,
            isupdate: true,
            request_number: request_number,
          },
        };
        const result = await leavescollection.updateOne(
          filter,
          updatedoc,
          option
        );
        if (result?.modifiedCount >= 1) {
          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false, result });
        }
      } catch (error) {
        res.send({ sucess: false });
      }
    });

    app.put("/leave/Response/edit", async (req, res) => {
      try {
        const leaveinfo = req.body;
        const request_number = leaveinfo?.request_number;
        const filter = {
          request_number: leaveinfo?.request_number,
        };
        const option = { upsert: true };
        const updatedoc = {
          $set: {
            name: leaveinfo?.name,
            email: leaveinfo?.email,
            apply_date: leaveinfo?.apply_date,
            to_date: leaveinfo?.to_date,
            leave_status: leaveinfo?.leave_status,
            reason: leaveinfo?.reason,
            notice: leaveinfo?.notice,
            no_day: leaveinfo?.no_day,
            isupdate: true,
            request_number: request_number,
          },
        };
        const result = await leavescollection.updateOne(
          filter,
          updatedoc,
          option
        );
        if (result?.modifiedCount >= 1) {
          sendEmployeeLeaveEmail(
            {
              subject: `Your Leave request is ${leaveinfo?.leave_status}!!! `,
              message: leaveinfo,
            },
            leaveinfo?.email
          );

          res.send({ sucess: true, result });
        } else {
          res.send({ sucess: false, result });
        }
      } catch (error) {
        res.send({ sucess: false });
      }
    });

    app.delete(
      `/delete-request/:id`,
      verifyjwt,
      verifyAdmin,
      async (req, res) => {
        try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await leavescollection.deleteOne(query);
          res.send(result);
        } catch (error) {}
      }
    );
    app.get("/partnership", async (req, res) => {
      try {
        const query = {};
        const result = await partnershipcollection.find().toArray();
        res.send(result);
      } catch (error) {}
    });
    app.get("/currents_orders", async (req, res) => {
      try {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const today = new Date();
        const todayOrders = await shopordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
          })
          .skip(page * size)
          .limit(size)
          .toArray();
        const countorders = await shopordercollection.countDocuments({
          order_date: today.toLocaleDateString("en-GB"),
        });
        const todaycustom = await ordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
          })
          .skip(page * size)
          .limit(size)
          .toArray();
        const countcustom = await ordercollection.countDocuments({
          order_date: today.toLocaleDateString("en-GB"),
        });
        res.send({
          todayOrders,
          countorders,
          todaycustom,
          countcustom,
        });
      } catch (error) {}
    });
    app.get("/today-orders", async (req, res) => {
      try {
        const today = new Date();
        const todayOrders = await shopordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
            order: "paid",
          })
          .toArray();
        const todayordersprocessing = await shopordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
            status: "Processing",
            order: "paid",
          })
          .toArray();
        const todayorderdalivered = await shopordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
            order: "paid",
            status: "Delivered",
          })
          .toArray();
        const todayorderpending = await shopordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
            order: "paid",
            status: "Pending",
          })
          .toArray();
        const todayordercancel = await shopordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
            status: "canceled",
          })
          .toArray();
        const todycustomorders = await ordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
            order: "paid",
          })
          .toArray();
        const todaycustomprocessing = await ordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
            status: "Processing",
            order: "paid",
          })
          .toArray();
        const todaycustomdalivered = await ordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
            order: "paid",
            status: "Delivered",
          })
          .toArray();
        const todaycustomrpending = await ordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
            order: "paid",
            status: "Pending",
          })
          .toArray();
        const todaycustomcancel = await ordercollection
          .find({
            order_date: today.toLocaleDateString("en-GB"),
            status: "canceled",
          })
          .toArray();
        const totla_customized_price = todycustomorders.reduce(
          (sum, order) => sum + order.total_price,
          0
        );
        const totalPrice = todayOrders.reduce(
          (sum, order) => sum + order.total_price,
          0
        );
        res.json({
          todayOrders,
          totalPrice,
          todycustomorders,
          totla_customized_price,
          todaycustomcancel,
          todaycustomdalivered,
          todaycustomprocessing,
          todaycustomrpending,
          todayordercancel,
          todayorderdalivered,
          todayorderpending,
          todayordersprocessing,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.get("/currentMonthOrders", async (req, res) => {
      const currentDate = moment();
      const startOfMonth = moment(currentDate).startOf("month");
      const endOfMonth = moment(currentDate).endOf("month");
      const startOfMonthString = startOfMonth.format("DD/MM/YYYY");
      const endOfMonthString = endOfMonth.format("DD/MM/YYYY");
      try {
        const orders = await shopordercollection
          .find({
            $expr: {
              $and: [
                {
                  $gte: [
                    { $substrCP: ["$order_date", 6, 4] },
                    startOfMonthString.substring(6),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 6, 4] },
                    endOfMonthString.substring(6),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    startOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    endOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    startOfMonthString.substring(0, 2),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    endOfMonthString.substring(0, 2),
                  ],
                },
              ],
            },
            order: "paid",
          })
          .toArray();

        const orderscancel = await shopordercollection
          .find({
            $expr: {
              $and: [
                {
                  $gte: [
                    { $substrCP: ["$order_date", 6, 4] },
                    startOfMonthString.substring(6),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 6, 4] },
                    endOfMonthString.substring(6),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    startOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    endOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    startOfMonthString.substring(0, 2),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    endOfMonthString.substring(0, 2),
                  ],
                },
              ],
            },
          })
          .toArray();
        const monthorderprocessing = orders.filter(
          (order) => order?.status === "Processing"
        );
        const monthorderdelivered = orders.filter(
          (order) => order?.status === "Delivered"
        );
        const monthorderpending = orders.filter(
          (order) => order?.status === "Pending"
        );
        const monthcancelorders = orderscancel.filter(
          (order) => order?.status === "canceled"
        );
        const totalPrice = orders.reduce(
          (sum, order) => sum + order.total_price,
          0
        );
        const customizedorders = await ordercollection
          .find({
            $expr: {
              $and: [
                {
                  $gte: [
                    { $substrCP: ["$order_date", 6, 4] },
                    startOfMonthString.substring(6),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 6, 4] },
                    endOfMonthString.substring(6),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    startOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    endOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    startOfMonthString.substring(0, 2),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    endOfMonthString.substring(0, 2),
                  ],
                },
              ],
            },
            order: "paid",
          })
          .toArray();
        const customizedorderscancel = await ordercollection
          .find({
            $expr: {
              $and: [
                {
                  $gte: [
                    { $substrCP: ["$order_date", 6, 4] },
                    startOfMonthString.substring(6),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 6, 4] },
                    endOfMonthString.substring(6),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    startOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    endOfMonthString.substring(3, 5),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    startOfMonthString.substring(0, 2),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    endOfMonthString.substring(0, 2),
                  ],
                },
              ],
            },
          })
          .toArray();
        const monthcustomprocessing = customizedorders.filter(
          (order) => order?.status === "Processing"
        );
        const monthcustomdelivered = customizedorders.filter(
          (order) => order?.status === "Delivered"
        );
        const monthcustompending = customizedorders.filter(
          (order) => order?.status === "Pending"
        );
        const monthcustomcancel = customizedorderscancel.filter(
          (order) => order?.status === "canceled"
        );
        const customizedPrice = customizedorders.reduce(
          (sum, order) => sum + order.total_price,
          0
        );
        res.json({
          orders,
          totalPrice,
          customizedorders,
          customizedPrice,
          monthorderprocessing,
          monthorderdelivered,
          monthorderpending,
          monthcancelorders,
          monthcustomprocessing,
          monthcustomdelivered,
          monthcustompending,
          monthcustomcancel,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.get("/currentYearOrders", async (req, res) => {
      const currentYear = moment().year();
      const startOfYear = moment().startOf("year");
      const endOfYear = moment().endOf("year");
      const startOfYearString = startOfYear.format("DD/MM/YYYY");
      const endOfYearString = endOfYear.format("DD/MM/YYYY");
      try {
        const orders = await shopordercollection
          .find({
            $expr: {
              $and: [
                {
                  $eq: [
                    { $toInt: { $substrCP: ["$order_date", 6, 4] } },
                    currentYear,
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    startOfYearString.substring(3, 5),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    endOfYearString.substring(3, 5),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    startOfYearString.substring(0, 2),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    endOfYearString.substring(0, 2),
                  ],
                },
              ],
            },
            order: "paid",
          })
          .toArray();
        const customizedorders = await ordercollection
          .find({
            $expr: {
              $and: [
                {
                  $eq: [
                    { $toInt: { $substrCP: ["$order_date", 6, 4] } },
                    currentYear,
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    startOfYearString.substring(3, 5),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 3, 2] },
                    endOfYearString.substring(3, 5),
                  ],
                },
                {
                  $gte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    startOfYearString.substring(0, 2),
                  ],
                },
                {
                  $lte: [
                    { $substrCP: ["$order_date", 0, 2] },
                    endOfYearString.substring(0, 2),
                  ],
                },
              ],
            },
            order: "paid",
          })
          .toArray();

        const totalPrice = orders.reduce(
          (sum, order) => sum + order.total_price,
          0
        );
        const customizedprice = customizedorders.reduce(
          (sum, order) => sum + order.total_price,
          0
        );
        res.json({ orders, totalPrice, customizedorders, customizedprice });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.get("/yesterdayOrders", async (req, res) => {
      try {
        var today = new Date();
        var yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayshopOrders = await shopordercollection
          .find({
            order_date: yesterday.toLocaleDateString("en-GB"),
            order: "paid",
          })
          .toArray();
        const yesterdaycustomorders = await ordercollection
          .find({
            order_date: yesterday.toLocaleDateString("en-GB"),
            order: "paid",
          })
          .toArray();
        const totalyesterdayshopPrice = yesterdayshopOrders.reduce(
          (sum, order) => sum + order.total_price,
          0
        );
        const totalyesterdaycustomPrice = yesterdaycustomorders.reduce(
          (sum, order) => sum + order.total_price,
          0
        );
        res.send({
          yesterdayshopOrders,
          yesterdaycustomorders,
          totalyesterdayshopPrice,
          totalyesterdaycustomPrice,
        });
      } catch (error) {}
    });
    app.get("/weeklyordersl", async (req, res) => {
      try {
        const today = new Date();
        const dateRanges = [];
        for (let i = 0; i < 10; i++) {
          const currentDate = new Date(today);
          currentDate.setDate(today.getDate() - i);
          dateRanges.push(currentDate.toLocaleDateString("en-GB"));
        }
        const ordersPromises = dateRanges.map(async (date) => {
          const orders = await shopordercollection
            .find({
              order_date: date,
              order: "paid",
            })
            .toArray();
          return {
            name: date,
            uv: orders.length,
            pv: orders.length,
            amt: orders.length,
          };
        });
        const weeklyOrders = await Promise.all(ordersPromises);
        res.send(weeklyOrders);
      } catch (error) {}
    });
    app.get("/weeklycustomorders", async (req, res) => {
      try {
        const today = new Date();
        const dateRanges = [];
        for (let i = 0; i < 10; i++) {
          const currentDate = new Date(today);
          currentDate.setDate(today.getDate() - i);
          dateRanges.push(currentDate.toLocaleDateString("en-GB"));
        }
        const ordersPromises = dateRanges.map(async (date) => {
          const orders = await ordercollection
            .find({
              order_date: date,
              order: "paid",
            })
            .toArray();
          return {
            name: date,
            uv: orders.length,
            pv: orders.length,
            amt: orders.length,
          };
        });
        const weeklyOrders = await Promise.all(ordersPromises);
        res.send(weeklyOrders);
      } catch (error) {}
    });
    app.post("/seeting", async (req, res) => {
      try {
        const seetinginfo = req.body;
        const result = await settingcollection.insertOne(seetinginfo);
        res.send({ sucess: true, result });
      } catch (error) {
        res.send({ sucess: false });
      }
    });
    app.get("/seetinginfo", async (req, res) => {
      try {
        const result = await settingcollection.findOne({});
        res.send(result);
      } catch (error) {}
    });
    app.put("/seetinginfo/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const seetinginfo = req.body;
        const filter = { _id: new ObjectId(id) };
        const option = { upsert: true };
        const updatedoc = {
          $set: {
            company_name: seetinginfo?.company_name,
            address: seetinginfo?.address,
            postcode: seetinginfo?.postcode,
            contact: seetinginfo?.contact,
            email: seetinginfo?.email,
            discount: seetinginfo?.discount,
          },
        };
        const result = await settingcollection.updateOne(
          filter,
          updatedoc,
          option
        );
        res.send(result);
      } catch (error) {}
    });
    app.get("/bestreviews", async (req, res) => {
      try {
        const product_id = req.query.product_id;
        const category_id = req.query.category_id;
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const query = {
          product_id: product_id,
          category_id: category_id,
          userRating: { $gte: 3 },
        };
        const result = await reviewcollection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await reviewcollection.countDocuments(query);
        res.send({ result, count });
      } catch (error) {}
    });
    app.post("/contact_request", async (req, res) => {
      try {
        const contactinfo = req.body;
        const result = await contactcollection.insertOne(contactinfo);
        res.send(result);
      } catch (error) {}
    });
    app.get("/", (req, res) => {
      res.send("Hello Garment Management server!");
    });
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
      console.log(process.env.SERVER_LINK);
      console.log(process.env.CLIENT_LINK);
    });
  } catch (error) {
    console.log(error);
  }
}
run();
