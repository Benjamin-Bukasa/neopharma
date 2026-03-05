import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

import Counter from "../pages/Counter";
import Customers from "../pages/Customers";
import Dashboard from "../pages/dashboard";
import FirstConnexionPassword from "../pages/FirstConnexionPassword";
import ForgotPassword from "../pages/ForgotPassword";
import Help from "../pages/Help";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import Orders from "../pages/Orders";
import Payments from "../pages/Payments";
import Products from "../pages/Products";
import Reports from "../pages/Reports";
import Notifications from "../pages/Notifications";
import Sales from "../pages/Sales";
import Settings from "../pages/Settings";

const publicRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/first-connexion-password", element: <FirstConnexionPassword /> },
];

const protectedRoutes = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "counter", element: <Counter /> },
          { path: "customers", element: <Customers /> },
          { path: "orders", element: <Orders /> },
          { path: "payments", element: <Payments /> },
          { path: "products", element: <Products /> },
          { path: "reports", element: <Reports /> },
          { path: "sales", element: <Sales /> },
          { path: "notifications", element: <Notifications /> },
          { path: "settings", element: <Settings /> },
          { path: "help", element: <Help /> },
          { path: "logout", element: <Logout /> },
        ],
      },
    ],
  },
];

const routes = createBrowserRouter([
  ...publicRoutes,
  ...protectedRoutes,
]);

export default routes;
