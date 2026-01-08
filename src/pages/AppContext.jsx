
import React, { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [topics, setTopics] = useState(() => {
    try {
      const stored = localStorage.getItem("topics");
      return stored ? JSON.parse(stored) : [{ mainTopic: "", subTopics: [""] }];
    } catch {
      return [{ mainTopic: "", subTopics: [""] }];
    }
  });

  const [analysisResults, setAnalysisResults] = useState([]);

  useEffect(() => {
    localStorage.setItem("topics", JSON.stringify(topics));
  }, [topics]);

  const saveTopics = (newTopics) => {
    setTopics(newTopics);
  };

  const saveAnalysisResults = (results) => {
    setAnalysisResults(results);
  };


  const saveAnalysis = (files, results) => {
    const merged = results.map((res, idx) => ({
      ...res,
      originalFile: files[idx], 
      error: false,
    }));

    setAnalysisResults(merged);
  };

  return (
    <AppContext.Provider
      value={{
        topics,
        saveTopics,
        analysisResults,
        saveAnalysisResults, 
        saveAnalysis,        
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
