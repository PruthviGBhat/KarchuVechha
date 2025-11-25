"use client";
import React, { useEffect, useState } from "react";

export default function MonthlyExpense() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});



  const total = Object.values(summary).reduce((acc, val) => acc + val, 0);

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-4xl mx-auto bg-white rounded shadow ">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
        📅 Monthly Expense Summary
      </h2>

      {expenses.length === 0 ? (
        <p className="text-gray-500 text-center">
          No expenses recorded for this month.
        </p>
      ) : (
        <>
          <div className="mb-8 text-center">
            <h3 className="text-xl sm:text-2xl font-medium">
              Total: ₹{total.toFixed(2)}
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(summary).map(([category, amount]) => (
              <div
                key={category}
                className="flex flex-col sm:flex-row justify-between border-b pb-2 text-base sm:text-lg"
              >
                <span className="font-medium">{category}</span>
                <span className="text-gray-700">₹{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}