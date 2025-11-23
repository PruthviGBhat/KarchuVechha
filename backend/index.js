const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/test', (req, res) => {
  try {
    res.status(200).json({ message: 'API is working' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/expenses', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/expenses', async (req, res) => {
  try {
    const expense = await prisma.expense.create({
      data: {
        itemname: req.body.itemname,
        itemprice: req.body.itemprice,
        dateofpurchase: new Date(req.body.dateofpurchase),
        category: req.body.category
      },
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/expenses/:id', async (req, res) => {
  try {
    const expense = await prisma.expense.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        itemname: req.body.itemname,
        itemprice: req.body.itemprice,
        dateofpurchase: new Date(req.body.dateofpurchase),
        category: req.body.category
      },
    });
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/expenses/:id', async (req, res) => {
  try {
    const expense = await prisma.expense.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));