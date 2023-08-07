const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const errorHandler = require("./util/errorHandler");
const { roleModel } = require("./models/role");
const { userModel } = require("./models/user");
const fileUpload = require('express-fileupload')
require("dotenv/config");

const api = process.env.API_URL;
const PORT = process.env.PORT;
const mongoUrl = process.env.MONGO_LOCAL_CONN_URL;
const mongoDbName = process.env.MONGO_DB_NAME;

const secrets = process.env.SECRET;

app.use(cors());
app.options("*", cors());

//middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(errorHandler);
app.use(fileUpload({
  limits: {fileSize: 50 * 1024 * 1024},
}));


app.get("/", (req, res) => res.json({ message: "Home Page  test Route" }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.disable('etag');
//controller
const role = require("./routes/role");
const public = require("./routes/public");
const authorize = require("./routes/authorize");
const admin = require("./routes/admin");
const { passwordEncryptAES } = require("./util/helper");

app.use(`${api}/public`, public);
app.use(`${api}/role`, role);
app.use(`${api}/authorize`, authorize);
app.use(`${api}/admin`, admin);
// Database
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    dbName: mongoDbName,
  })
  .then(() => {
   
    const getAdmin = async () => {
      try {
        let topAdminRoleId = "";
        const topAdminRole = await roleModel.findOne({ roleName: "SUPER_ADMIN" });
        if (topAdminRole) {
          topAdminRoleId = topAdminRole._id;
        } else {
          let newTopAdminRole = new roleModel({
            roleName: "SUPER_ADMIN",
          });
          const newTopAdminRoleCreated = await newTopAdminRole.save();
          topAdminRoleId = newTopAdminRoleCreated._id;
        }
        if (topAdminRoleId) {
          const topAdminUser = await userModel.findOne({
            "userInfo.email": "superadmin02@yopmail.in",
          });
          if (!topAdminUser) {
            const newTopAdmin = new userModel({
              userInfo: {
                userId: "superadmin02",
                email: "superadmin02@yopmail.in",
                firstName: "Super02",
                lastName: "Admin",
                fullName: "Super02 Admin",
                companyId:"C000002",
                dob:new Date(),
                password: passwordEncryptAES("action980"),
                phoneNumber1: "1234567890",
                roleId: topAdminRoleId,
                roleName: "SUPER_ADMIN",
              },
              isActive: true,
              isApproved:true
            });
            newTopAdminCreated = await newTopAdmin.save();
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    //getAdmin();
  })
  .catch((err) => {
    console.log(err);
  });

//Server
app.listen(PORT || 3010, () => {
  console.log(`server is running http://localhost:${PORT}`);
});
