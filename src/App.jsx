import StudentDashboard from "./pages/StudentDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import BookPG from "./pages/BookPG"; 

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleSelect from "./pages/RoleSelect";

// Ye import add karna zaroori hai (apne folder structure ke hisaab se path check kar lena)
import { AppProvider } from "./context/AppContext"; 

export default function App() {
  return (
    // Poore Routes ko AppProvider ke andar wrap kar diya
    <AppProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/role" element={<RoleSelect />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        
        <Route path="/book" element={<BookPG />} /> 
      </Routes>
    </AppProvider>
  );
}