import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

const getMonthDateRange = (month: string, year: string) => {
    const m = Number(month);
    const y = Number(year);
    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 1);
    return { startDate, endDate };
};

// Route to list transactions
app.get('/transactions', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;

        const { month, year, page = 1, limit = 5 } = req.query;
        const { startDate, endDate } = getMonthDateRange(
            month as string,
            year as string,
        );

        const where = {
            userId: userId,
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
app.get('/transactions/summary', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;

        const { month, year } = req.query;
        const { startDate, endDate } = getMonthDateRange(
            month as string,
            year as string,
        );

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: userId,
                date: { gte: startDate, lt: endDate },
            },
        });

        const income = transactions
            .filter((t) => t.amount > 0)
            .reduce((acc, t) => acc + t.amount, 0);

        const expenses = transactions
            .filter((t) => t.amount < 0)
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);

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
app.get('/transactions/categories', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;

        const { month, year } = req.query;
        const { startDate, endDate } = getMonthDateRange(
            month as string,
            year as string,
        );

        const expenses = await prisma.transaction.findMany({
            where: {
                userId: userId,
                date: { gte: startDate, lt: endDate },
                amount: { lt: 0 },
            },
        });

        const categoryMap = expenses.reduce((acc: Record<string, number>, t) => {
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
app.get('/pots', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        const pots = await prisma.pot.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'asc' },
        });
        res.json(pots);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pots' });
    }
});

// Create a new pot
app.post('/pots', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        const { name, targetAmount } = req.body;

        if (!name || !targetAmount) {
            return res
                .status(400)
                .json({ error: 'Name and target amount are required' });
        }

        const newPot = await prisma.pot.create({
            data: {
                userId: userId,
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
app.post('/transactions', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
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
                userId: userId,
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

// Route to edit a transaction
app.put('/transactions/:id', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        const { id } = req.params;
        const { name, amount, category, date } = req.body;

        if (!name || name.trim() === '')
            return res.status(400).json({ error: 'Description is required' });

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount === 0)
            return res.status(400).json({ error: 'A valid non-zero amount is required' });

        const result = await prisma.transaction.updateMany({
            where: { id, userId },
            data: {
                name: name.trim(),
                amount: numericAmount,
                category: category || 'General',
                date: date ? new Date(date) : new Date(),
            },
        });

        if (result.count === 0)
            return res.status(404).json({ error: 'Transaction not found' });

        const updated = await prisma.transaction.findUnique({ where: { id } });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

// Route to delete the transaction
app.delete('/transactions/:id', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        await prisma.transaction.deleteMany({
            where: { id: req.params.id as string, userId: userId },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

// Route to edit a pot
app.put('/pots/:id', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        const { id } = req.params;
        const { name, targetAmount } = req.body;

        if (!name || name.trim() === '')
            return res.status(400).json({ error: 'Name is required' });

        const numericTarget = Number(targetAmount);
        if (isNaN(numericTarget) || numericTarget <= 0)
            return res.status(400).json({ error: 'Target amount must be greater than zero' });

        const result = await prisma.pot.updateMany({
            where: { id, userId },
            data: { name: name.trim(), targetAmount: numericTarget },
        });

        if (result.count === 0)
            return res.status(404).json({ error: 'Pot not found' });

        const updated = await prisma.pot.findUnique({ where: { id } });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update pot' });
    }
});

// Route to delete a Pot
app.delete('/pots/:id', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        await prisma.pot.deleteMany({
            where: { id: req.params.id as string, userId: userId },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete pot' });
    }
});

// Route to add money to the Pot and create the transaction
app.post('/pots/:id/deposit', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        const { id } = req.params;
        const { amount } = req.body;
        const depositAmount = Number(amount);

        if (!depositAmount || depositAmount <= 0)
            return res.status(400).json({ error: 'Amount must be greater than zero' });

        const pot = await prisma.pot.findFirst({
            where: { id: id as string, userId: userId },
        });
        if (!pot)
            return res
                .status(404)
                .json({ error: 'Pot not found or unauthorized' });

        const allTransactions = await prisma.transaction.findMany({
            where: { userId },
            select: { amount: true },
        });
        const balance = allTransactions.reduce((acc, t) => acc + t.amount, 0);

        if (depositAmount > balance)
            return res.status(400).json({ error: 'Insufficient balance' });

        const updatedPot = await prisma.pot.update({
            where: { id },
            data: { currentAmount: { increment: depositAmount } },
        });

        const newTransaction = await prisma.transaction.create({
            data: {
                userId: userId,
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

// Route to batch import transactions with duplicate prevention
app.post('/transactions/import', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        const { transactions } = req.body;

        if (!Array.isArray(transactions) || transactions.length === 0)
            return res.status(400).json({ error: 'No transactions provided' });

        let imported = 0;
        let skipped = 0;

        for (const t of transactions) {
            const existing = await prisma.transaction.findFirst({
                where: {
                    userId,
                    name: t.name,
                    amount: Number(t.amount),
                    date: new Date(t.date),
                },
            });

            if (existing) {
                skipped++;
                continue;
            }

            await prisma.transaction.create({
                data: {
                    userId,
                    name: t.name.trim(),
                    amount: Number(t.amount),
                    category: t.category || 'General',
                    date: new Date(t.date),
                },
            });
            imported++;
        }

        res.status(200).json({ imported, skipped });
    } catch (error) {
        res.status(500).json({ error: 'Failed to import transactions' });
    }
});

// Route to list all recurring bills
app.get('/recurring-bills', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        const bills = await prisma.recurringBill.findMany({
            where: { userId: userId },
            orderBy: { dueDate: 'asc' },
        });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recurring bills' });
    }
});

// Route to add a new recurring bill
app.post('/recurring-bills', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        const { name, amount, category, dueDate } = req.body;

        if (!name || !amount || !dueDate) {
            return res
                .status(400)
                .json({ error: 'Name, amount, and dueDate are required' });
        }

        const newBill = await prisma.recurringBill.create({
            data: {
                userId: userId,
                name: name.trim(),
                amount: Number(amount),
                category: category || 'Bills',
                dueDate: Number(dueDate),
            },
        });

        res.status(201).json(newBill);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create recurring bills' });
    }
});

// Route to delete a recurring bill
app.delete('/recurring-bills/:id', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        await prisma.recurringBill.deleteMany({
            where: { id: req.params.id as string, userId: userId },
        });
        res.status(200).json({ message: 'Bill deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete recurring bill' });
    }
});

// Route to edit a recurring bill
app.put('/recurring-bills/:id', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        const { id } = req.params;
        const { name, amount, category, dueDate } = req.body;

        if (!name || !amount || !dueDate) {
            return res
                .status(400)
                .json({ error: 'Name, amount, and dueDate are required' });
        }

        const result = await prisma.recurringBill.updateMany({
            where: { id: id as string, userId: userId },
            data: {
                name: name.trim(),
                amount: Number(amount),
                category: category || 'Bills',
                dueDate: Number(dueDate),
            },
        });

        if (result.count === 0)
            return res.status(404).json({ error: 'Bill not found' });

        const updatedBill = await prisma.recurringBill.findUnique({
            where: { id: id as string },
        });
        res.status(200).json(updatedBill);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update recurring bill' });
    }
});

// Route to toggle the "Paid" status and auto-create a transaction
app.put('/recurring-bills/:id/status', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        const { id } = req.params;
        const isPaid = req.body?.isPaid;

        if (isPaid === undefined) {
            return res.status(400).json({ error: 'Missing isPaid in request' });
        }

        const bill = await prisma.recurringBill.findFirst({
            where: { id: id as string, userId: userId },
        });

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        const updatedBill = await prisma.recurringBill.update({
            where: { id: id as string },
            data: { isPaid: isPaid },
        });

        if (isPaid === true) {
            await prisma.transaction.create({
                data: {
                    userId: userId,
                    name: `[Bill] ${bill.name}`,
                    amount: -bill.amount,
                    category: bill.category,
                    date: new Date(),
                },
            });
        }

        res.status(200).json(updatedBill);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update bill status' });
    }
});

// Route do AI Advisor (Gemini)
app.post('/api/advisor', requireAuth(), async (req, res) => {
    try {
        const userId = getAuth(req).userId as string;
        const { question, history } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Please ask a question.' });
        }

        const transactions = await prisma.transaction.findMany({
            where: { userId: userId },
        });
        const currentBalance = transactions.reduce(
            (acc, curr) => acc + curr.amount,
            0,
        );

        const pendingBills = await prisma.recurringBill.findMany({
            where: { isPaid: false, userId: userId },
        });
        const totalPendingBills = pendingBills.reduce(
            (acc, curr) => acc + curr.amount,
            0,
        );

        const conversationHistory =
            history && history.length > 0
                ? history
                      .map(
                          (msg: { role: string; text: string }) =>
                              `${msg.role === 'user' ? 'User' : 'Advisor'}: ${msg.text}`,
                      )
                      .join('\n')
                : 'No previous messages.';

        const systemContext = `
        You are a rigorous, polite, and highly intelligent personal financial advisor.
        The user is asking you for financial advice.
        
        Here is the user's current financial reality (in Euros):
        - Current Balance: €${currentBalance.toFixed(2)}
        - Upcoming Fixed Bills this month: €${totalPendingBills.toFixed(2)}
        - Available Money (Balance - Bills): €${(currentBalance - totalPendingBills).toFixed(2)}

        Rules for your answer:
        1. Be direct, clear, and really professional.
        2. Reply in the same language the user speaks.
        3. Keep the answer under 3 paragraphs. Plain text only, with emojis.

        --- PREVIOUS CONVERSATION HISTORY ---
        ${conversationHistory}
        -------------------------------------

        User's NEW question: "${question}"
        `;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(systemContext);

        res.status(200).json({ answer: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to consult the AI Advisor.' });
    }
});

const PORT = 3001;
app.listen(PORT, () =>
    console.log(`🚀 API running at http://localhost:${PORT}`),
);
