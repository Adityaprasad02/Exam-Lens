import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./pages/AppContext";
import React from "react";

import Landing from "./pages/Landing";
import ResultPage from "./pages/ResultPage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/results" element={<ResultPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
