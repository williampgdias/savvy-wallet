/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { start } from 'repl';

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

const loadData = (): { transactions: any[]; pots: any[] } => {
    if (!fs.existsSync(DATA_FILE)) {
        return { transactions: [], pots: [] };
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return {
        transactions: parsed.transactions || [],
        pots: parsed.pots || [],
    };
};

const saveData = (data: { transactions: any[]; pots: any[] }) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// eslint-disable-next-line prefer-const
let { transactions, pots } = loadData();

// Route to list the transactions
app.get('/transactions', (req, res) => {
    const { month, year, page = 1, limit = 5 } = req.query;

    const filtered = transactions.filter((t) => {
        const date = new Date(t.date);
        return (
            date.getMonth() === Number(month) &&
            date.getFullYear() === Number(year)
        );
    });

    const sorted = [...filtered].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return b.id.localeCompare(a.id);
    });

    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedItems = sorted.slice(startIndex, endIndex);

    res.json({
        data: paginatedItems,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / Number(limit)),
    });
});

// Route to Dashboard Summary
app.get('/transactions/summary', (req, res) => {
    const { month, year } = req.query;

    const filtered = transactions.filter((t) => {
        const date = new Date(t.date);
        return (
            date.getMonth() === Number(month) &&
            date.getFullYear() === Number(year)
        );
    });

    const income = filtered
        .filter((t) => Number(t.amount) > 0)
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const expenses = filtered
        .filter((t) => Number(t.amount) < 0)
        .reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0);

    res.json({
        income,
        expenses,
        balance: income - expenses,
        transactionCount: filtered.length,
    });
});

app.get('/transactions/categories', (req, res) => {
    const { month, year } = req.query;

    const filtered = transactions.filter((t) => {
        const date = new Date(t.date);
        return (
            date.getMonth() === Number(month) &&
            date.getFullYear() === Number(year)
        );
    });

    const expenses = filtered.filter((t) => Number(t.amount) < 0);

    const categoryMap = expenses.reduce((acc: any, t) => {
        const cat = t.category || 'General';
        acc[cat] = (acc[cat] || 0) + Math.abs(Number(t.amount));
        return acc;
    }, {});

    const formattedData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
    }));

    res.json(formattedData);
});

// Fetch the pots
app.get('/pots', (req, res) => {
    res.json(pots);
});

// Create a new pot
app.post('/pots', (req, res) => {
    const { name, targetAmount } = req.body;

    if (!name || !targetAmount) {
        return res
            .status(400)
            .json({ error: 'Name and target amount are required.' });
    }

    const newPot = {
        id: Date.now().toString(),
        name,
        targetAmount: Number(targetAmount),
        currentAmount: 0,
    };

    pots.push(newPot);
    saveData({ transactions, pots });
    res.status(201).json(newPot);
});

// Route to Add a new transaction
app.post('/transactions', (req, res) => {
    const { name, amount, category, date } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Description is required' });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount === 0) {
        return res
            .status(400)
            .json({ error: 'A valid non-zero amount is required' });
    }

    const newTransaction = {
        id: Date.now().toString(),
        name: name.trim(),
        amount: numericAmount,
        category: category || 'General',
        date: date || new Date().toISOString().split('T')[0],
    };

    transactions.push(newTransaction);
    saveData({ transactions, pots });
    res.status(201).json(newTransaction);
});

// Route to delete the transaction
app.delete('/transactions/:id', (req, res) => {
    const { id } = req.params;
    transactions = transactions.filter((t) => t.id !== id);
    saveData({ transactions, pots });
    res.status(204).send();
});

// Route to delete a Pot
app.delete('/pots/:id', (req, res) => {
    const { id } = req.params;
    pots = pots.filter((p) => p.id !== id);
    saveData({ transactions, pots });
    res.status(204).send();
});

// Route to add money to the Pot and create the transaction
app.post('/pots/:id/deposit', (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    const potIndex = pots.findIndex((p) => p.id === id);
    if (potIndex === -1)
        return res.status(404).json({ error: 'Pot not found' });

    const depositAmount = Number(amount);

    pots[potIndex].currentAmount += depositAmount;

    // Create automatically the expense transaction
    const newTransaction = {
        id: Date.now().toString(),
        name: `Saving: ${pots[potIndex].name}`,
        amount: -depositAmount,
        category: 'Savings',
        date: new Date().toISOString().split('T')[0],
    };

    transactions.push(newTransaction);

    saveData({ transactions, pots });
    res.json({ pot: pots[potIndex], transaction: newTransaction });
});

const PORT = 3001;
app.listen(PORT, () =>
    console.log(`🚀 API running at http://localhost:${PORT}`),
);
