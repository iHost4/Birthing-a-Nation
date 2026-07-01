import './App.css';
import { Routes, Route } from 'react-router-dom';

import HeadOfKitchen from './COMPONENTS/hok.jsx';
import Main from './main';
import Footer from './COMPONENTS/footer.jsx';
import OrderSubmitted from './COMPONENTS/ordersubmitted.jsx';

function App() {
  return (
    <>
    <div id='appContainer'>
      <main>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/submitted" element={<OrderSubmitted />} />
        <Route path="/hok" element={<HeadOfKitchen />} />
      </Routes>
      </main>
        <Footer />
    </div>
    </>
  );
}

export default App;
