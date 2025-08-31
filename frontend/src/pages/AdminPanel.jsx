import React from "react";
import UsersTable from "../components/admin/UsersTable";
import TasksTable from "../components/admin/TasksTable";
import CommentsTable from "../components/admin/CommentsTable";

const AdminPanel = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🛠 Admin Panel</h1>
      <UsersTable />
      <TasksTable />
      <CommentsTable />
    </div>
  );
};

export default AdminPanel;
