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

const loadData = (): any[] => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const initialData = [
                {
                    id: '1',
                    name: 'Rent',
                    amount: -1200,
                    category: 'Utilities',
                    date: '2026-02-01',
                },
                {
                    id: '2',
                    name: 'Salary',
                    amount: 3000,
                    category: 'Income',
                    date: '2026-02-05',
                },
            ];
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading file:', error);
        return [];
    }
};

const saveData = (data: any[]) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

let transactions = loadData();

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
    saveData(transactions);
    res.status(201).json(newTransaction);
});

// Route to delete the transaction
app.delete('/transactions/:id', (req, res) => {
    const { id } = req.params;
    transactions = transactions.filter((t) => t.id !== id);
    saveData(transactions);
    res.status(204).send();
});

const PORT = 3001;
app.listen(PORT, () =>
    console.log(`🚀 API running at http://localhost:${PORT}`),
);
