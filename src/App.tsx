import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import { CommerceProvider } from "./commerce/CommerceContext";
import { CompareProvider } from "./components/CompareContext";
import Home from "./pages/Home";

// Route-level code splitting
const Shop = lazy(() => import("./pages/Shop"));
const Product = lazy(() => import("./pages/Product"));
const Compare = lazy(() => import("./pages/Compare"));
const FindMySystem = lazy(() => import("./pages/FindMySystem"));
const Filters = lazy(() => import("./pages/Filters"));
const Service = lazy(() => import("./pages/Service"));
const ServiceBook = lazy(() => import("./pages/ServiceBook"));
const Rent = lazy(() => import("./pages/Rent"));
const Business = lazy(() => import("./pages/Business"));
const Eco = lazy(() => import("./pages/Eco"));
const Guide = lazy(() => import("./pages/Guide"));
const GuideArticle = lazy(() => import("./pages/GuideArticle"));
const Account = lazy(() => import("./pages/account/Account"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Order = lazy(() => import("./pages/Order"));
const Help = lazy(() => import("./pages/Help"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/admin/Admin"));

export default function App() {
  return (
    <ToastProvider>
      <CommerceProvider>
        <CompareProvider>
          <Routes>
            <Route path="admin/*" element={<Suspense fallback={<p className="py-24 text-center text-slate-600" role="status">Loading…</p>}><Admin /></Suspense>} />
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="shop/need/:need" element={<Shop />} />
              <Route path="shop/:category" element={<Shop />} />
              <Route path="product/:slug" element={<Product />} />
              <Route path="compare" element={<Compare />} />
              <Route path="find-my-system" element={<FindMySystem />} />
              <Route path="filters" element={<Filters />} />
              <Route path="service" element={<Service />} />
              <Route path="service/book" element={<ServiceBook />} />
              <Route path="rent" element={<Rent />} />
              <Route path="business" element={<Business />} />
              <Route path="eco" element={<Eco />} />
              <Route path="guide" element={<Guide />} />
              <Route path="guide/:topic" element={<GuideArticle />} />
              <Route path="account/*" element={<Account />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order/:id" element={<Order />} />
              <Route path="help" element={<Help />} />
              <Route path="contact" element={<Help />} />
              <Route path="privacy" element={<Legal kind="privacy" />} />
              <Route path="terms" element={<Legal kind="terms" />} />
              <Route path="warranty-policy" element={<Legal kind="warranty" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </CompareProvider>
      </CommerceProvider>
    </ToastProvider>
  );
}
