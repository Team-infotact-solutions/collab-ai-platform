import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function TaskList({ onSelectTask, selectedTaskId }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.getTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error('Fetch tasks failed:', err.response?.data || err.message);
      setErrorMsg(err.response?.data?.error || 'Failed to load tasks');
    }
  };

  const addTask = async () => {
    if (!taskInput.trim()) return;
    try {
      await api.createTask({ title: taskInput });
      setTaskInput('');
      fetchTasks();
    } catch (err) {
      console.error('Add task failed:', err.response?.data || err.message);
      setErrorMsg(err.response?.data?.error || 'Failed to add task');
    }
  };

  const removeTask = async (id, taskOwner) => {
    if (taskOwner?._id !== user._id && user.role !== 'admin') {
      setErrorMsg('You can only delete your own tasks');
      return;
    }
    try {
      await api.deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Delete failed:', err.response?.data || err.message);
      setErrorMsg(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditingTitle(task.title);
  };

  const saveEdit = async (id) => {
    if (!editingTitle.trim()) return;
    try {
      await api.updateTask(id, { title: editingTitle });
      setEditingTaskId(null);
      setEditingTitle('');
      fetchTasks();
    } catch (err) {
      console.error('Edit failed:', err.response?.data || err.message);
      setErrorMsg(err.response?.data?.error || 'Failed to update task');
    }
  };

  const toggleStatus = async (task) => {
    const nextStatus =
      task.status === 'todo'
        ? 'in-progress'
        : task.status === 'in-progress'
        ? 'done'
        : 'todo';
    try {
      await api.updateTask(task._id, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      console.error('Status update failed:', err.response?.data || err.message);
      setErrorMsg(err.response?.data?.error || 'Failed to update status');
    }
  };

  const filteredTasks = tasks
    .filter((task) => task.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-xl my-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        📋 Task Manager
      </h2>

      {errorMsg && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{errorMsg}</div>
      )}

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={search}
          placeholder="🔍 Search tasks..."
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {sortAsc ? 'Sort A-Z' : 'Sort Z-A'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={taskInput}
          placeholder="✍️ Write a new task..."
          onChange={(e) => setTaskInput(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={addTask}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Add
        </button>
      </div>

      <ul className="space-y-3">
        {filteredTasks.map((task) => (
          <li
            key={task._id}
            onClick={() => onSelectTask && onSelectTask(task._id)}
            className={`flex justify-between items-center px-4 py-3 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow ${
              selectedTaskId === task._id
                ? 'bg-blue-100'
                : task.status === 'done'
                ? 'bg-green-100'
                : 'bg-gray-100'
            }`}
          >
            <div className="flex-1 flex flex-col">
              {editingTaskId === task._id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => saveEdit(task._id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTaskId(null)}
                    className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-gray-800 font-medium">{task.title}</span>
                  <div className="text-sm text-gray-500 mt-1">
                    Status: <span className="capitalize">{task.status}</span> | Priority: {task.priority || 'N/A'}{' '}
                    | Created by: {task.createdBy?.name || 'Unknown'} | Assigned to: {task.assignedTo?.name || 'Unassigned'}
                    {task.dueDate && ` | Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 ml-2">
              <button
                onClick={() => toggleStatus(task)}
                className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition-colors"
              >
                Next Status
              </button>
              {(task.createdBy?._id === user._id || user.role === 'admin') && (
                <>
                  <button
                    onClick={() => startEditing(task)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeTask(task._id, task.createdBy)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {tasks.length > 0 && (
        <button
          onClick={() => setTasks([])}
          className="mt-4 w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  );
}

export default TaskList;
