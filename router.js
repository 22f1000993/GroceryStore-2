import Home from "./components/Home.js";
import Login from "./components/Login.js";
import Users from "./components/Users.js";
import registeration from "./components/registeration.js";
import ManagerHome from "./components/ManagerHome.js";
import cart from "./components/cart.js";

const routes = [
  { path: "/", component: Home, name: "Home" },
  { path: "/login", component: Login, name: "Login" },
  { path: "/users", component: Users },
  { path: "/registeration", component: registeration },
  { path: "/manager", component: ManagerHome, name: "ManagerHome" },
  { path: "/cart", component: cart, name: "cart" },
  { path: "*", redirect: "/" },
];

export default new VueRouter({
  routes,
});
