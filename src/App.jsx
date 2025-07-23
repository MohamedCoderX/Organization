import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import UserDashboard from "./pages/UserDashboard";
import UserList from "./Components/admin/UserList";
import Fund from "./Components/admin/Fund";

import TransactionHistory from "./Components/TransactionHistory";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/dashboard" element={<Admin/>} />
<Route path="/admin/transactions" element={<TransactionHistory/>}/>
        <Route path="/admin/funds" element={<Fund/>}/>
        <Route path="/admin/users" element={<UserList/>}/>
        <Route path="/user/dashboard" element={<UserDashboard/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
