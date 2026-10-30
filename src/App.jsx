import { Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import Home from "./pages/Home";
import About from "./pages/About";
import ServicePage from "./pages/ServicePage";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import Faq from "./pages/Faq";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services/:slug" element={<ServicePage />} />
        <Route path="our-details" element={<Contact />} />
        <Route path="contact" element={<Contact />} />
        <Route path="careers" element={<Careers />} />
        <Route path="faq" element={<Faq />} />
        <Route path="privacy-policy" element={<Privacy />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
