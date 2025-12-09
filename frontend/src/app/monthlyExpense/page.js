"use client";
import React, { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function MonthlyExpense() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for month/year selection
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch expenses from API
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Calculate summary whenever expenses or selected month/year changes
  useEffect(() => {
    calculateMonthlySummary();
  }, [expenses, selectedMonth, selectedYear]);

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

  const calculateMonthlySummary = () => {
    // Filter expenses for selected month and year
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.dateofpurchase);
      return (
        expenseDate.getMonth() === selectedMonth &&
        expenseDate.getFullYear() === selectedYear
      );
    });

    // Group by category and sum amounts
    const categorySummary = filteredExpenses.reduce((acc, expense) => {
      const category = expense.category;
      if (acc[category]) {
        acc[category] += expense.itemprice;
      } else {
        acc[category] = expense.itemprice;
      }
      return acc;
    }, {});

    setSummary(categorySummary);
  };

  // Calculate total from summary
  const total = Object.values(summary).reduce((acc, val) => acc + val, 0);

  // Get month name for display
  const getMonthName = (monthIndex) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthIndex];
  };

  // Generate year options (last 5 years)
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 5; i--) {
    yearOptions.push(i);
  }

  // Category colors for visual distinction
  const categoryColors = {
    Food: "bg-orange-100 text-orange-800",
    Transport: "bg-blue-100 text-blue-800",
    Shopping: "bg-pink-100 text-pink-800",
    Bills: "bg-red-100 text-red-800",
    Other: "bg-gray-100 text-gray-800",
  };

  // Category icons
  const categoryIcons = {
    Food: "🍔",
    Transport: "🚗",
    Shopping: "🛍️",
    Bills: "📄",
    Other: "📦",
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-10 max-w-4xl mx-auto bg-white rounded shadow">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-10 max-w-4xl mx-auto bg-white rounded shadow">
        <div className="text-center text-red-500">
          <p className="text-xl mb-4">❌ Error loading expenses</p>
          <p>{error}</p>
          <button
            onClick={fetchExpenses}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
        📅 Monthly Expense Summary
      </h2>

      {/* Month/Year Selector */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <label className="font-medium">Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {getMonthName(i)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Period Display */}
      <div className="text-center mb-6">
        <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full font-medium">
          {getMonthName(selectedMonth)} {selectedYear}
        </span>
      </div>

      {Object.keys(summary).length === 0 ? (
        <div className="text-center py-10">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-gray-500 text-lg">
            No expenses recorded for {getMonthName(selectedMonth)} {selectedYear}
          </p>
        </div>
      ) : (
        <>
          {/* Total Section */}
          <div className="mb-8 text-center bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-lg">
            <p className="text-sm uppercase tracking-wide mb-1">Total Spent</p>
            <h3 className="text-3xl sm:text-4xl font-bold">₹{total.toLocaleString()}</h3>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">
              Category Breakdown
            </h4>
            
            {Object.entries(summary)
              .sort((a, b) => b[1] - a[1]) // Sort by amount descending
              .map(([category, amount]) => {
                const percentage = ((amount / total) * 100).toFixed(1);
                
                return (
                  <div
                    key={category}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {categoryIcons[category] || "📦"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            categoryColors[category] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          ₹{amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">{percentage}%</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.keys(summary).length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Highest</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{Math.max(...Object.values(summary)).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center col-span-2 sm:col-span-1">
              <p className="text-sm text-gray-600">Average/Category</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{Math.round(total / Object.keys(summary).length).toLocaleString()}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}