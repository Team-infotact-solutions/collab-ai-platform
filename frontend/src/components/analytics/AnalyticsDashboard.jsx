import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../../services/api";

export default function AnalyticsDashboard() {
  const [data, setData] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.getAnalyticsSummary();
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err.response?.data || err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ["#4caf50", "#2196f3", "#f44336"];
  const chartData = [
    { name: "Completed", value: data.completed },
    { name: "Pending", value: data.pending },
    { name: "Overdue", value: data.overdue },
  ];

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl shadow-md">{`Total Tasks: ${data.total}`}</div>
        <div className="p-4 bg-white rounded-xl shadow-md">{`Completed: ${data.completed}`}</div>
        <div className="p-4 bg-white rounded-xl shadow-md">{`Overdue: ${data.overdue}`}</div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold mb-4">Task Distribution</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              label={({ name, value, percent }) =>
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
