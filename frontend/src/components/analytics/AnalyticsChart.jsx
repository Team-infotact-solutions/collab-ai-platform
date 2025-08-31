import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import api from "../../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsChart({ token }) {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (token) fetchChartData();
  }, [token]);

  const fetchChartData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get("/analytics/tasks-trend", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data || {};

      if (
        !data.labels ||
        !Array.isArray(data.labels) ||
        data.labels.length === 0
      ) {
        setErrorMsg("No trend data available yet.");
        return;
      }

      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: "✅ Completed Tasks",
            data: data.completed || new Array(data.labels.length).fill(0),
            borderColor: "rgba(34,197,94,1)", // green-500
            backgroundColor: "rgba(34,197,94,0.2)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "⏰ Overdue Tasks",
            data: data.overdue || new Array(data.labels.length).fill(0),
            borderColor: "rgba(239,68,68,1)", // red-500
            backgroundColor: "rgba(239,68,68,0.2)",
            tension: 0.4,
            fill: true,
          },
        ],
      });
    } catch (err) {
      console.error("❌ Failed to fetch chart data:", err);
      setErrorMsg(err.response?.data?.message || "Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md my-6">
      <h3 className="text-xl font-semibold mb-4">📊 Task Analytics</h3>

      {loading && (
        <p className="text-gray-500 italic">Loading chart data...</p>
      )}

      {errorMsg && !loading && (
        <p className="text-red-500 font-medium">{errorMsg}</p>
      )}

      {!loading && !errorMsg && chartData.labels.length > 0 ? (
        <div className="h-[350px]">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: { font: { size: 13 } },
                },
                title: {
                  display: true,
                  text: "Task Trends Over Time",
                  font: { size: 16, weight: "bold" },
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { size: 12 } },
                },
                y: {
                  beginAtZero: true,
                  ticks: { font: { size: 12 } },
                },
              },
            }}
          />
        </div>
      ) : (
        !loading &&
        !errorMsg && (
          <div className="text-gray-400 italic text-center py-6">
            No chart data available
          </div>
        )
      )}
    </div>
  );
}
