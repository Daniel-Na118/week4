import {Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Pages from './pages/Page'
import Recipes from "./pages/Recipes";
import "./style.css";


const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Pages />} />
        <Route path="/recipes/:id" element={<Recipes />} />
      </Routes>
    </Router>
  );
};

export default App;