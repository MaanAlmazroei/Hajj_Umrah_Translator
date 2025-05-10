import React from "react";

const Tabs = ({ activeTab, setActiveTab }) => (
  <div className="tabs">
    {["translate", "phrases", "history", "favorites", "about"].map((tab) => (
      <button
        key={tab}
        className={`tab ${activeTab === tab ? "active" : ""}`}
        onClick={() => setActiveTab(tab)}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    ))}
  </div>
);

export default Tabs;