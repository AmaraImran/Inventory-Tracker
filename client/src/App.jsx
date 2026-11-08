import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoutes";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import NewSale from "./pages/NewSale";
import Sales from "./pages/Sales";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          
<Route path="/" element={<Dashboard />} />
<Route path="/products" element={<Products />} />
<Route path="/sales/new" element={<NewSale />} />
<Route path="/sales" element={<Sales />} />
     
        
        </Route>
      </Route>
    </Routes>
  );
}