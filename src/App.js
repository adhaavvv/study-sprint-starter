// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages (create these files in src/pages/)
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SessionsList from "./pages/SessionsList";
import SessionDetails from "./pages/SessionDetails";
import CreateSession from "./pages/CreateSession";
import EditSession from "./pages/EditSession";
import MySessions from "./pages/MySessions";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/sessions" element={<SessionsList />} />
        <Route path="/sessions/:id" element={<SessionDetails />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/sessions/new"
          element={
            <ProtectedRoute>
              <CreateSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions/:id/edit"
          element={
            <ProtectedRoute>
              <EditSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-sessions"
          element={
            <ProtectedRoute>
              <MySessions />
            </ProtectedRoute>
          }
        />

        {/* Convenience */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}


// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Home from "./pages/Home";
// import CardList from "./pages/CardList";
// import AddCard from "./pages/AddCard";
// import EditCard from "./pages/EditCard";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import "./App.css";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/login" element = {<Login />} />
//         <Route path="/cards" element={<CardList />}/>
//         <Route path="/cards/new" element={<ProtectedRoute><AddCard /></ProtectedRoute>}/>
//         <Route path="/cards/:id/edit" element={<ProtectedRoute><EditCard/></ProtectedRoute>}/>
//       </Routes>
//     </BrowserRouter>
//   );
// }



