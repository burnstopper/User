import logo from './logo.svg';
import './App.css';
import Header from "./components/Header/Header"
import "bootstrap/dist/css/bootstrap.min.css"
import SignInForm from "./components/SignInForm/SignInForm";
import Verification from "./components/Verification/Verification";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

function App() { // ADD after verification pages!!!
  return (
      <Router>
          <div className="App">
              <Header/>
            <Routes>
                <Route path="/signup" element={<SignInForm/>}>
                </Route>
                <Route path="/login" element={<SignInForm/>}>
                </Route>
                <Route path="/verification/login/:id" element={<Verification/>}>
                </Route>
                <Route path="/verification/signup/:id" element={<Verification/>}>
                </Route>
            </Routes>
          </div>
      </Router>
  );
}

export default App;
