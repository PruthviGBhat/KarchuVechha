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
  Title,
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
  PointElement,
  Title
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export default function Summary() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch expenses from API
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/expenses`);

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();
      setExpenses(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. Category-wise totals
  const categoryTotals = expenses.reduce((acc, exp) => {
    const amt = exp.itemprice; // Fixed: was exp.amount
    acc[exp.category] = (acc[exp.category] || 0) + amt;
    return acc;
  }, {});

  const categoryColors = {
    Food: "#f97316",
    Transport: "#3b82f6",
    Shopping: "#ec4899",
    Bills: "#ef4444",
    Other: "#8b5cf6",
  };

  const categoryChart = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(
          (cat) => categoryColors[cat] || "#6b7280"
        ),
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.raw.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  // 2. Monthly trends
  const monthlyTotals = expenses.reduce((acc, exp) => {
    const date = new Date(exp.dateofpurchase); // Fixed: was exp.date
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + exp.itemprice; // Fixed: was exp.amount
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyTotals).sort();
  
  // Format month labels for display
  const formatMonthLabel = (key) => {
    const [year, month] = key.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const monthlyChart = {
    labels: sortedMonths.map(formatMonthLabel),
    datasets: [
      {
        label: "Monthly Expense",
        data: sortedMonths.map((m) => monthlyTotals[m]),
        fill: true,
        backgroundColor: "rgba(20, 184, 166, 0.2)",
        borderColor: "#14b8a6",
        tension: 0.4,
        pointBackgroundColor: "#14b8a6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `₹${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value.toLocaleString();
          },
        },
      },
    },
  };

  // 3. Top 5 expenses
  const top5 = [...expenses]
    .sort((a, b) => b.itemprice - a.itemprice) // Fixed: was exp.amount
    .slice(0, 5);

  const top5Chart = {
    labels: top5.map((e) => 
      e.itemname.length > 15 ? e.itemname.substring(0, 15) + "..." : e.itemname
    ), // Fixed: was exp.item
    datasets: [
      {
        label: "Amount",
        data: top5.map((e) => e.itemprice), // Fixed: was exp.amount
        backgroundColor: [
          "#ef4444",
          "#f97316",
          "#eab308",
          "#22c55e",
          "#3b82f6",
        ],
        borderRadius: 5,
      },
    ],
  };

  const barOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `₹${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value.toLocaleString();
          },
        },
      },
    },
  };

  // 4. Average daily spending (current month)
  const now = new Date();
  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.dateofpurchase); // Fixed: was exp.date
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalThisMonth = currentMonthExpenses.reduce(
    (sum, e) => sum + e.itemprice, // Fixed: was exp.amount
    0
  );
  const daysPassed = now.getDate();
  const avgDaily = daysPassed > 0 ? totalThisMonth / daysPassed : 0;

  // 5. Calculate additional stats
  const totalExpenses = expenses.reduce((sum, e) => sum + e.itemprice, 0);
  const avgPerTransaction = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  
  // Get month name
  const getMonthName = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[now.getMonth()];
  };

  // 6. Category-wise bar chart for comparison
  const categoryBarChart = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Spending by Category",
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(
          (cat) => categoryColors[cat] || "#6b7280"
        ),
        borderRadius: 5,
      },
    ],
  };

  const categoryBarOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value.toLocaleString();
          },
        },
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto bg-gray-100 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <span className="ml-4 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto bg-gray-100 min-h-screen">
        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-5xl mb-4">❌</p>
          <p className="text-xl text-red-500 mb-4">Error loading dashboard</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchExpenses}
            className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (expenses.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto bg-gray-100 min-h-screen">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          📊 Summary Dashboard
        </h2>
        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-xl text-gray-500 mb-4">No expenses recorded yet</p>
          <p className="text-gray-400">
            Add some expenses to see your dashboard analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 max-w-6xl mx-auto bg-gray-100 min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">
        📊 Summary Dashboard
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded shadow text-center">
          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
          <p className="text-xl sm:text-2xl font-bold text-teal-600">
            ₹{totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded shadow text-center">
          <p className="text-sm text-gray-500 mb-1">Transactions</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">
            {expenses.length}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded shadow text-center">
          <p className="text-sm text-gray-500 mb-1">Avg per Transaction</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-600">
            ₹{avgPerTransaction.toFixed(0)}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded shadow text-center">
          <p className="text-sm text-gray-500 mb-1">Categories Used</p>
          <p className="text-xl sm:text-2xl font-bold text-orange-600">
            {Object.keys(categoryTotals).length}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category-wise Pie Chart */}
        <div className="bg-white p-4 sm:p-6 rounded shadow">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">
            🥧 Category Distribution
          </h3>
          <div className="h-64 sm:h-80 flex justify-center items-center">
            <Pie data={categoryChart} options={pieOptions} />
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-white p-4 sm:p-6 rounded shadow">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">
            📊 Category Comparison
          </h3>
          <div className="h-64 sm:h-80">
            <Bar data={categoryBarChart} options={categoryBarOptions} />
          </div>
        </div>

        {/* Monthly Trends Line Chart */}
        <div className="bg-white p-4 sm:p-6 rounded shadow">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">
            📈 Monthly Trends
          </h3>
          <div className="h-64 sm:h-80">
            <Line data={monthlyChart} options={lineOptions} />
          </div>
        </div>

        {/* Top 5 Expenses Bar Chart */}
        <div className="bg-white p-4 sm:p-6 rounded shadow">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">
            🏆 Top 5 Expenses
          </h3>
          <div className="h-64 sm:h-80">
            <Bar data={top5Chart} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Current Month Stats */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 rounded shadow text-white">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">
          📅 {getMonthName()} {now.getFullYear()} Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 p-4 rounded">
            <p className="text-sm opacity-80">Total This Month</p>
            <p className="text-2xl sm:text-3xl font-bold">
              ₹{totalThisMonth.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded">
            <p className="text-sm opacity-80">Daily Average</p>
            <p className="text-2xl sm:text-3xl font-bold">
              ₹{avgDaily.toFixed(0)}
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded">
            <p className="text-sm opacity-80">Transactions</p>
            <p className="text-2xl sm:text-3xl font-bold">
              {currentMonthExpenses.length}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">
          🕐 Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Date</th>
                <th className="text-right p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[...expenses]
                .sort((a, b) => new Date(b.dateofpurchase) - new Date(a.dateofpurchase))
                .slice(0, 5)
                .map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{expense.itemname}</td>
                    <td className="p-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: categoryColors[expense.category] + "20",
                          color: categoryColors[expense.category],
                        }}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {new Date(expense.dateofpurchase).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      ₹{expense.itemprice.toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}