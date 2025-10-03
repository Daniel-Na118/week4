import {Route, BrowserRouter as Router, Routes } from "react-router-dom";
import RecipePage from "./pages/Page";
import Recipes from "./pages/Recipes";
import "./style.css";


const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RecipePage />} />
        <Route path="/recipes/:id" element={<Recipes />} />
      </Routes>
    </Router>
  );
};

export default App;