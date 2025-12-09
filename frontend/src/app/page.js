"use client";
import React, { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [formData, setFormData] = useState({
    item: "",
    amount: "",
    date: "",
    category: "",
  });
  const [expenses, setExpenses] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({ item: "", amount: "", date: "", category: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/expenses`);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemname: formData.item,
          itemprice: parseInt(formData.amount),
          dateofpurchase: formData.date,
          category: formData.category
        }),
      });
      
      if (response.ok) {
        setFormData({ item: "", amount: "", date: "", category: "" });
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    const expense = expenses[index];
    setEditData({
      item: expense.itemname,
      amount: expense.itemprice,
      date: expense.dateofpurchase.split('T')[0],
      category: expense.category
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (index) => {
    const expense = expenses[index];
    
    try {
      const response = await fetch(`${API_URL}/expenses/${expense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemname: editData.item,
          itemprice: parseInt(editData.amount),
          dateofpurchase: editData.date,
          category: editData.category
        }),
      });
      
      if (response.ok) {
        setEditingIndex(null);
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditData({ item: "", amount: "", date: "", category: "" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center lg:flex-row gap-6 p-4 md:p-10 bg-gray-100 m-20">
      {/* Expense Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded shadow-lg w-full md:max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">Add Expense</h2>

        <div className="mb-4">
          <label className="block mb-1">Item Name</label>
          <input
            type="text"
            name="item"
            value={formData.item}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition disabled:bg-teal-400"
        >
          {submitting ? "Adding..." : "Add Expense"}
        </button>
      </form>

      {/* Expense List */}
      <div className="bg-white p-6 rounded shadow-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Expense List</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500">No expenses added yet.</p>
        ) : (
          <ul className="space-y-4">
            {expenses.map((expense, index) => (
              <li
                key={expense.id}
                className="bg-gray-100 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                {editingIndex === index ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                    <input
                      type="text"
                      name="item"
                      value={editData.item}
                      onChange={handleEditChange}
                      className="border px-2 py-1 rounded w-full sm:w-1/4"
                    />
                    <input
                      type="number"
                      name="amount"
                      value={editData.amount}
                      onChange={handleEditChange}
                      className="border px-2 py-1 rounded w-full sm:w-1/4"
                    />
                    <input
                      type="date"
                      name="date"
                      value={editData.date}
                      onChange={handleEditChange}
                      className="border px-2 py-1 rounded w-full sm:w-1/4"
                    />
                    <select
                      name="category"
                      value={editData.category}
                      onChange={handleEditChange}
                      className="border px-2 py-1 rounded w-full sm:w-1/4"
                    >
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSubmit(index)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                      <p className="font-medium">{expense.itemname}</p>
                      <p className="text-gray-600">₹{expense.itemprice}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(expense.dateofpurchase).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">{expense.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}