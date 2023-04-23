import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Home, Login } from "./components";
import { app } from "./config/firebase.config";
import { getAuth } from "firebase/auth";
import { AnimatePresence } from "framer-motion";
import { validateUser } from "./api";

export const App = () => {
  const firebaseAuth = getAuth(app);
  const navigate = useNavigate();

  const [auth, setAuth] = useState(
    false || (typeof window !== "undefined" && window.localStorage.getItem("auth") === "true")
  );

  useEffect(() => {
    firebaseAuth.onAuthStateChanged((userCred) => {
      if (userCred) {
        userCred.getIdToken().then((token) => {
          validateUser(token)
            .then((data) => {
              console.log(data);
              setAuth(true);
              window.localStorage.setItem("auth", "true");
            })
            .catch((error) => {
              console.log(error);
              setAuth(false);
              window.localStorage.setItem("auth", "false");
              navigate("/login");
            });
        });
      } else {
        setAuth(false);
        window.localStorage.setItem("auth", "false");
        navigate("/login");
      }
    });
  }, []);

  return (
    <AnimatePresence mode="wait">
      <div className="h-auto min-w-[] bg-primary flex justify-center items-center">
        <Routes>
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          {auth ? <Route path="/*" element={<Home />} /> : null}
        </Routes>
      </div>
    </AnimatePresence>
  );
};

export default App;
