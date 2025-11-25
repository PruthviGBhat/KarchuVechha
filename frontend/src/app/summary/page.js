"use client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

export default function Summary() {
  const [expenses, setExpenses] = useState([]);

  // 1. Category-wise totals
  const categoryTotals = expenses.reduce((acc, exp) => {
    const amt = parseFloat(exp.amount);
    acc[exp.category] = (acc[exp.category] || 0) + amt;
    return acc;
  }, {});

  const categoryChart = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: ["#14b8a6", "#f59e0b", "#ef4444", "#6366f1", "#10b981"],
      },
    ],
  };

  // 2. Monthly trends
  const monthlyTotals = expenses.reduce((acc, exp) => {
    const date = new Date(exp.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + parseFloat(exp.amount);
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyTotals).sort();
  const monthlyChart = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Monthly Expense",
        data: sortedMonths.map((m) => monthlyTotals[m]),
        fill: false,
        borderColor: "#14b8a6",
        tension: 0.3,
      },
    ],
  };

  // 3. Top 3 expenses
  const top3 = [...expenses]
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    .slice(0, 3);

  const top3Chart = {
    labels: top3.map((e) => e.item),
    datasets: [
      {
        label: "Top Expenses",
        data: top3.map((e) => parseFloat(e.amount)),
        backgroundColor: ["#ef4444", "#f59e0b", "#6366f1"],
      },
    ],
  };

  // 4. Average daily spending (current month)
  const now = new Date();
  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalThisMonth = currentMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const daysPassed = now.getDate();
  const avgDaily = totalThisMonth / daysPassed;

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-10 max-w-6xl mx-auto bg-gray-100 min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">📊 Summary Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {/* Category-wise Pie Chart */}
        <div className="bg-white p-4 sm:p-6 rounded shadow">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">Category-wise Expenses</h3>
          <Pie data={categoryChart} />
        </div>

        {/* Monthly Trends Line Chart */}
        <div className="bg-white p-4 sm:p-6 rounded shadow">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">Monthly Trends</h3>
          <Line data={monthlyChart} />
        </div>

        {/* Top 3 Expenses Bar Chart */}
        <div className="bg-white p-4 sm:p-6 rounded shadow">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">Top 3 Expenses</h3>
          <Bar data={top3Chart} options={{ indexAxis: "y" }} />
        </div>

        {/* Average Daily Spending */}
        <div className="bg-white p-4 sm:p-6 rounded shadow flex flex-col justify-center items-center">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">Average Daily Spending</h3>
          <p className="text-3xl sm:text-4xl font-bold text-teal-600">₹{avgDaily.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}