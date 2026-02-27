/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(cors());
app.use(express.json());

const getMonthDateRange = (month: string, year: string) => {
    const m = Number(month);
    const y = Number(year);
    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 1);
    return { startDate, endDate };
};

// Route to list transactions
app.get('/transactions', async (req, res) => {
    try {
        const { month, year, page = 1, limit = 5 } = req.query;
        const { startDate, endDate } = getMonthDateRange(
            month as string,
            year as string,
        );

        const where = {
            date: {
                gte: startDate,
                lt: endDate,
            },
        };

        const total = await prisma.transaction.count({ where });

        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: 'desc' },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
        });

        res.json({
            data: transactions,
            total,
            totalPages: Math.ceil(total / Number(limit)),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Route to Dashboard Summary
app.get('/transactions/summary', async (req, res) => {
    try {
        const { month, year } = req.query;
        const { startDate, endDate } = getMonthDateRange(
            month as string,
            year as string,
        );

        const transactions = await prisma.transaction.findMany({
            where: { date: { gte: startDate, lt: endDate } },
        });

        const income = transactions
            .filter((t: any) => t.amount > 0)
            .reduce((acc: number, t: any) => acc + t.amount, 0);

        const expenses = transactions
            .filter((t: any) => t.amount < 0)
            .reduce((acc: number, t: any) => acc + Math.abs(t.amount), 0);

        res.json({
            income,
            expenses,
            balance: income - expenses,
            transactionCount: transactions.length,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});

// Route Categories
app.get('/transactions/categories', async (req, res) => {
    try {
        const { month, year } = req.query;
        const { startDate, endDate } = getMonthDateRange(
            month as string,
            year as string,
        );

        const expenses = await prisma.transaction.findMany({
            where: {
                date: { gte: startDate, lt: endDate },
                amount: { lt: 0 },
            },
        });

        const categoryMap = expenses.reduce((acc: any, t: any) => {
            const cat = t.category || 'General';
            acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
            return acc;
        }, {});

        const formattedData = Object.entries(categoryMap).map(
            ([name, value]) => ({
                name,
                value,
            }),
        );

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Fetch the pots
app.get('/pots', async (req, res) => {
    try {
        const pots = await prisma.pot.findMany({
            orderBy: { createdAt: 'asc' },
        });
        res.json(pots);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pots' });
    }
});

// Create a new pot
app.post('/pots', async (req, res) => {
    try {
        const { name, targetAmount } = req.body;

        if (!name || !targetAmount) {
            return res
                .status(400)
                .json({ error: 'Name and target amount are required' });
        }

        const newPot = await prisma.pot.create({
            data: {
                name,
                targetAmount: Number(targetAmount),
                currentAmount: 0,
            },
        });

        res.status(201).json(newPot);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create pot' });
    }
});

// Route to Add a new transaction
app.post('/transactions', async (req, res) => {
    try {
        const { name, amount, category, date } = req.body;
        if (!name || name.trim() === '')
            return res.status(400).json({ error: 'Description is required' });

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount === 0) {
            return res
                .status(400)
                .json({ error: 'A valid non-zero amount is required' });
        }

        const newTransaction = await prisma.transaction.create({
            data: {
                name: name.trim(),
                amount: numericAmount,
                category: category || 'General',
                date: date ? new Date(date) : new Date(),
            },
        });

        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// Route to delete the transaction
app.delete('/transactions/:id', async (req, res) => {
    try {
        await prisma.transaction.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

// Route to delete a Pot
app.delete('/pots/:id', async (req, res) => {
    try {
        await prisma.pot.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete pot' });
    }
});

// Route to add money to the Pot and create the transaction
app.post('/pots/:id/deposit', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const depositAmount = Number(amount);

        const pot = await prisma.pot.findUnique({ where: { id } });
        if (!pot) return res.status(404).json({ error: 'Pot not found' });

        const updatedPot = await prisma.pot.update({
            where: { id },
            data: {
                currentAmount: { increment: depositAmount },
            },
        });

        const newTransaction = await prisma.transaction.create({
            data: {
                name: `Saving:${pot.name}`,
                amount: -depositAmount,
                category: 'Savings',
                date: new Date(),
            },
        });

        res.json({ pot: updatedPot, transaction: newTransaction });
    } catch (error) {
        res.status(500).json({ error: 'Failed to deposit money' });
    }
});

// Route to list all recurring bills
app.get('/recurring-bills', async (req, res) => {
    try {
        const bills = await prisma.recurringBill.findMany({
            orderBy: { dueDate: 'asc' },
        });
        res.json(bills);
    } catch (error) {
        console.error('❌ ERROR SEARCHING FOR ACCOUNTS', error);
        res.status(500).json({ error: 'Failed to fetch recurring bills' });
    }
});

// Route to add a new recurring bill
app.post('/recurring-bills', async (req, res) => {
    try {
        const { name, amount, category, dueDate } = req.body;

        if (!name || !amount || !dueDate) {
            return res
                .status(400)
                .json({ error: 'Name, amount, and dueDate are required' });
        }

        const newBill = await prisma.recurringBill.create({
            data: {
                name: name.trim(),
                amount: Number(amount),
                category: category || 'Bills',
                dueDate: Number(dueDate),
            },
        });

        res.status(201).json(newBill);
    } catch (error) {
        console.error('❌ ERROR CREATING ACCOUNT:', error);
        res.status(500).json({ error: 'Failed to create recurring bills' });
    }
});

// Route to delete a recurring bill
app.delete('/recurring-bills/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.recurringBill.delete({
            where: { id: id },
        });

        res.status(200).json({ message: 'Bill deleted successfully' });
    } catch (error) {
        console.error('❌ ERROR DELETING ACCOUNT:', error);
        res.status(500).json({ error: 'Failed to delete recurring bill' });
    }
});

// Route to edit a recurring bill
app.put('/recurring-bills/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, amount, category, dueDate } = req.body;

        if (!name || !amount || !dueDate) {
            return res
                .status(400)
                .json({ error: 'Name, amount, and dueDate are required' });
        }

        const updatedBill = await prisma.recurringBill.update({
            where: { id: id },
            data: {
                name: name.trim(),
                amount: Number(amount),
                category: category || 'Bills',
                dueDate: Number(dueDate),
            },
        });

        res.status(200).json(updatedBill);
    } catch (error) {
        console.error('❌ ERROR UPDATING ACCOUNT:', error);
        res.status(500).json({ error: 'Failed to update recurring bill' });
    }
});

// Route to toggle the "Paid" status and auto-create a transaction
app.put('/recurring-bills/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const isPaid = req.body?.isPaid;

        if (isPaid === undefined) {
            return res.status(400).json({ error: 'Missing isPaid in request' });
        }

        const bill = await prisma.recurringBill.findUnique({
            where: { id: id },
        });

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        const updatedBill = await prisma.recurringBill.update({
            where: { id: id },
            data: { isPaid: isPaid },
        });

        if (isPaid === true) {
            await prisma.transaction.create({
                data: {
                    name: `[Bill] ${bill.name}`,
                    amount: -bill.amount,
                    category: bill.category,
                    date: new Date(),
                },
            });
        }

        res.status(200).json(updatedBill);
    } catch (error) {
        console.error('❌ ERROR CHANGING ACCOUNT STATUS:', error);
        res.status(500).json({ error: 'Failed to update bill status' });
    }
});

// Route do AI Advisor (Gemini)
app.post('/api/advisor', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Please ask a question.' });
        }

        const transactions = await prisma.transaction.findMany();
        const currentBalance = transactions.reduce(
            (acc, curr) => acc + curr.amount,
            0,
        );

        const pendingBills = await prisma.recurringBill.findMany({
            where: { isPaid: false },
        });
        const totalPendingBills = pendingBills.reduce(
            (acc, curr) => acc + curr.amount,
            0,
        );

        const systemContext = `
        You are a rigorous, and highly intelligent personal financial advisor.
        The user is asking you for financial advice.
        
        Here is the user's current financial reality (in Euros):
        - Current Balance: €${currentBalance.toFixed(2)}
        - Total Upcoming Fixed Bills to pay this month: €${totalPendingBills.toFixed(2)}
        - Available Money (Balance - Bills): €${(currentBalance - totalPendingBills).toFixed(2)}

        Rules for your answer:
        1. Be direct, clear, and really professional.
        2. If the user wants to buy something and their "Available Money' is too low or negative, scold them gently and advice against it.
        3. If they have enough money, tell them it's okay but remind them to save.
        4. Keep the answer under 4 paragraphs. Do not use markdown headers, just plain text with some emojis.

        User's question: "${question}"
        `;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(systemContext);
        const responseText = result.response.text();

        res.status(200).json({ answer: responseText });
    } catch (error) {
        console.error('❌ GEMINI ERROR:', error);
        res.status(500).json({ error: 'Failed to consult the AI Advisor.' });
    }
});

const PORT = 3001;
app.listen(PORT, () =>
    console.log(`🚀 API running at http://localhost:${PORT}`),
);
