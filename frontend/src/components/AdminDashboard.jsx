import React, { useState } from "react";
import AddStudent from "./AddStudent";
import StudentList from "./StudentList";
import Reports from "./Reports";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("add");

  const buttonStyle = {
    backgroundColor: "#ffffff",
    color: "#000000",
    border: "1px solid #ccc",
    padding: "10px 15px",
    cursor: "pointer",
    margin: "5px",
    fontWeight: "bold",
    borderRadius: "6px",
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "1px solid #007bff",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <div style={{ marginBottom: "20px" }}>
        <button
          style={selectedTab === "add" ? activeButtonStyle : buttonStyle}
          onClick={() => setSelectedTab("add")}
        >
          Add Student
        </button>
        <button
          style={selectedTab === "list" ? activeButtonStyle : buttonStyle}
          onClick={() => setSelectedTab("list")}
        >
          Student List
        </button>
        <button
          style={selectedTab === "reports" ? activeButtonStyle : buttonStyle}
          onClick={() => setSelectedTab("reports")}
        >
          View Reports
        </button>
      </div>

      <div>
        {selectedTab === "add" && <AddStudent />}
        {selectedTab === "list" && <StudentList />}
        {selectedTab === "reports" && <Reports />}
      </div>
    </div>
  );
}

export default AdminDashboard;
