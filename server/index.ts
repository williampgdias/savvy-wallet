import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let transactions = [
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

// Route to list the transactions
app.get('/transactions', (req, res) => {
    res.json(transactions);
});

// Route to Add a new transaction
app.post('/transactions', (req, res) => {
    const newTransaction = { id: Date.now().toString(), ...req.body };
    transactions.push(newTransaction);
    res.status(201).json(newTransaction);
});

// Route to delete the transaction
app.delete('/transactions/:id', (req, res) => {
    const { id } = req.params;
    transactions = transactions.filter((t) => t.id !== id);
    res.status(204).send();
});

const PORT = 3001;
app.listen(PORT, () =>
    console.log(`🚀 API running at http://localhost:${PORT}`),
);
