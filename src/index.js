const path = require("path");
const express = require("express");
const morgan = require("morgan");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cors = require("cors");
const flash = require("connect-flash");

const handlebars = require("express-handlebars");
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");

const SortMiddleware = require("./app/middlewares/sortMiddleware");

const User = require("./app/models/User");
const route = require("./routes");
const db = require("./config/db");

const app = express();

// Enable CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Connect to MongoDB
db.connect()
  .then(() => {
    const port = 3000;
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch(err => console.error("Database connection error:", err));

const store = new MongoDBStore({
  uri: "mongodb+srv://baochungas3s:RhyPvXQXQpFoSKPJ@cluster0.aqlfw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  collection: "sessions",
});

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Session & flash
app.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: false,
  store: store,
}));
app.use(flash());

// Middleware: Lấy user từ session
app.use(async (req, res, next) => {
  if (!req.session.user) return next();
  try {
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
});

// Middleware: truyền thông tin vào view
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.isAuthenticatedAdmin = req.session.role - 2;
  res.locals.user = req.session.user;
  next();
});

// Middleware khác
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(SortMiddleware);
app.use(morgan("combined"));

// Template engine setup
app.engine("hbs", handlebars.engine({
  extname: ".hbs",
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require("./helpers/handlebars"),
}));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

// Routes init
route(app);
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
