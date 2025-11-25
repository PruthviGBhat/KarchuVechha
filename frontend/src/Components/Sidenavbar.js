"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { FaMoneyBillWave, FaCalendarAlt, FaChartBar, FaBars, FaTimes } from 'react-icons/fa';

const Sidenavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-gray-800 text-white px-4 py-3">
        
        <button onClick={() => setIsOpen(!isOpen)} className="text-white text-2xl">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white w-64 md:w-80 h-screen p-6 gap-6 flex-col fixed top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 md:static md:flex`}
      >
        <h1 className="text-2xl font-bold mb-4 hidden md:block">💸 Expense Tracker</h1>

        <nav className="flex flex-col gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:text-teal-300 transition"
            onClick={() => setIsOpen(false)}
          >
            <FaMoneyBillWave />
            <span>Expenses</span>
          </Link>

          <Link
            href="/monthlyExpense"
            className="flex items-center gap-2 hover:text-teal-300 transition"
            onClick={() => setIsOpen(false)}
          >
            <FaCalendarAlt />
            <span>Monthly Expense</span>
          </Link>

          <Link
            href="/summary"
            className="flex items-center gap-2 hover:text-teal-300 transition"
            onClick={() => setIsOpen(false)}
          >
            <FaChartBar />
            <span>Summary</span>
          </Link>
        </nav>
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidenavbar;