import SequelizeStore from "connect-session-sequelize";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import session from "express-session";
import db from "./config/Database.js";
import AgreementProducts from "./routes/AgreementProductsRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import Chats from "./routes/ChatsRoute.js";
import Comments from "./routes/CommentsRoute.js";
import FinishRentByOwner from "./routes/FinishRentByOwnerRoute.js";
import FinishRentByRenter from "./routes/FinishRentByRenterRoute.js";
import IsRentingProducts from "./routes/IsRentingProductsRoute.js";
import ProductRoute from "./routes/ProductRoute.js";
import SaveProductRoute from "./routes/SaveProductRoute.js";
import Searchs from "./routes/SearchRoute.js";
import Customers from "./routes/CustomerRoute.js";
import Address from "./routes/AddressRoute.js";
import {
  default as SuggestionRoute,
  default as Suggestions,
} from "./routes/SuggestionRoute.js";
import UserRoute from "./routes/UserRoute.js";
dotenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
  db: db,
});

const SECRET =
  process.env.SESS_SECRET || "adonawdoiwnae8o7wa98eyhwuabe87q3ye89g3";

app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: "auto",
    },
  })
);

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://frontend-rentalgoo.vercel.app",
      "http://new.rentalgoo.online",
    ],
  })
);

app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));
app.use(UserRoute);
app.use(ProductRoute);
app.use(SaveProductRoute);
app.use(SuggestionRoute);
app.use(AuthRoute);
app.use(AgreementProducts);
app.use(IsRentingProducts);
app.use(FinishRentByOwner);
app.use(FinishRentByRenter);
app.use(Chats);
app.use(Searchs);
app.use(Suggestions);
app.use(Comments);
app.use(Customers);
app.use(Address);

const PORT = process.env.APP_PORT || 5000;

app.listen(PORT, () => {
  console.log(`server up and running on port ${PORT} ...`);
});

(async () => {
  await db.sync();
})();

store.sync();
