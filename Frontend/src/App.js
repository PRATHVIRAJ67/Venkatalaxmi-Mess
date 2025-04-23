import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Componenets/Landing/Header/Header';
import Home from './Componenets/Landing/Home';
import Footer from './Componenets/Landing/Footer/Footer';
import Order from './Componenets/OrderPage/OrderPage';
import CartPage from './Componenets/Cart/Cart';
import ChatBotIcon from './Componenets/Landing/Chatbot/ChatBotIcon'; 
import UserForm from './Componenets/form/ResponsiveForm';
import OrderSuccess from './Componenets/order-sucess/ordersucess';
function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <ChatBotIcon /> 
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {}
       
        
        {}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/order"
          element={
          
              <Order />
          
          }
        />
         <Route
          path="/form"
          element={
          
              <UserForm />
          
          }
        />
         <Route
          path="/cart"
          element={
          
              <CartPage />
          
          }
        />
         <Route
          path="/ordersucess"
          element={
          
              <OrderSuccess/>
          
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
