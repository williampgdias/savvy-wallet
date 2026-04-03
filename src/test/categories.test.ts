import { describe, it, expect } from 'vitest';
import { categorizeTransaction, parseRevolutCSV, detectPotsFromCSV } from '@/lib/categories';

describe('categorizeTransaction', () => {
    it('categorizes Lidl as Groceries', () => {
        expect(categorizeTransaction('Lidl Ireland')).toEqual({
            category: 'Groceries',
            isIncome: false,
        });
    });

    it('categorizes Netflix as Entertainment', () => {
        expect(categorizeTransaction('Netflix Monthly')).toEqual({
            category: 'Entertainment',
            isIncome: false,
        });
    });

    it('categorizes Leap Card as Transportation', () => {
        expect(categorizeTransaction('Leap Card Top-Up')).toEqual({
            category: 'Transportation',
            isIncome: false,
        });
    });

    it('categorizes salary as Income', () => {
        expect(categorizeTransaction('Salary Payment')).toEqual({
            category: 'Income',
            isIncome: true,
        });
    });

    it('is case insensitive', () => {
        expect(categorizeTransaction('LIDL IRELAND').category).toBe('Groceries');
    });

    it('falls back to Uncategorized for unknown merchants', () => {
        expect(categorizeTransaction('Some Random Store XYZ')).toEqual({
            category: 'Uncategorized',
            isIncome: false,
        });
    });
});

describe('parseRevolutCSV', () => {
    it('returns empty array for empty string', () => {
        expect(parseRevolutCSV('')).toEqual([]);
    });

    it('returns empty array when required columns are missing', () => {
        expect(parseRevolutCSV('col1,col2,col3\nval1,val2,val3')).toEqual([]);
    });

    it('parses a valid Revolut CSV row', () => {
        const csv = [
            '"Type","Product","Started Date","Completed Date","Description","Amount","Fee","Currency","State","Balance"',
            '"CARD_PAYMENT","Current","2024-01-15 10:00:00","2024-01-15 10:00:00","Lidl Ireland","-25.50","0.00","EUR","COMPLETED","1000.00"',
        ].join('\n');

        const result = parseRevolutCSV(csv);
        expect(result).toHaveLength(1);
        expect(result[0].amount).toBe(25.5);
        expect(result[0].category).toBe('Groceries');
        expect(result[0].is_income).toBe(false);
    });

    it('marks positive amounts as income', () => {
        const csv = [
            '"Type","Product","Started Date","Completed Date","Description","Amount","Fee","Currency","State","Balance"',
            '"TOPUP","Current","2024-01-15 10:00:00","2024-01-15 10:00:00","Salary Payment","2500.00","0.00","EUR","COMPLETED","2500.00"',
        ].join('\n');

        const result = parseRevolutCSV(csv);
        expect(result[0].is_income).toBe(true);
    });

    it('filters out zero-amount transactions', () => {
        const csv = [
            '"Type","Product","Started Date","Completed Date","Description","Amount","Fee","Currency","State","Balance"',
            '"CARD_PAYMENT","Current","2024-01-15 10:00:00","2024-01-15 10:00:00","Something","0.00","0.00","EUR","COMPLETED","1000.00"',
        ].join('\n');

        expect(parseRevolutCSV(csv)).toHaveLength(0);
    });
});

const makeRow = (name: string, amount: number, is_income: boolean, is_transfer = false) => ({
    name, amount, date: '', category: 'General' as const, is_income, is_transfer,
});

describe('detectPotsFromCSV', () => {
    it('detects named pots from To EUR [name] pattern', () => {
        const rows = [
            makeRow("To EUR Laura's savings", 2.5, true, true),
            makeRow("To EUR Laura's savings", 2.5, true, true),
            makeRow("To EUR Olívia's Savings", 2.5, true, true),
            makeRow("To EUR Zeiry", 6.5, true, true),
        ];
        const result = detectPotsFromCSV(rows);
        expect(result).toHaveLength(3);
        expect(result.find(p => p.name === "Laura's savings")?.totalDeposited).toBe(5.0);
        expect(result.find(p => p.name === "Zeiry")?.totalDeposited).toBe(6.5);
    });

    it("detects pots from 'Deposit to' pattern", () => {
        const rows = [makeRow("Deposit to 'Olívia's Savings'", 2.5, true, true)];
        const result = detectPotsFromCSV(rows);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Olívia's Savings");
    });

    it('ignores generic Savings transfers', () => {
        const rows = [
            makeRow('To EUR Savings', 100, true, true),
            makeRow('To EUR MyPot', 50, true, true),
        ];
        const result = detectPotsFromCSV(rows);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('MyPot');
    });

    it('ignores From EUR and other patterns', () => {
        const rows = [
            makeRow('From EUR Savings', 30, false, true),
            makeRow('Net Interest Paid', 0.01, true, false),
        ];
        expect(detectPotsFromCSV(rows)).toHaveLength(0);
    });
});

describe('parseRevolutCSV — Main Account format (multi-product)', () => {
    const mainAccountCSV = [
        'Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance',
        // Real income - salary
        'Topup,Current,2026-01-14 18:56:35,2026-01-14 18:56:36,Payment from CAIREEN EARLY YEARS LTD,411.70,0.00,EUR,COMPLETED,411.75',
        // Real expense - card payment
        'Card Payment,Current,2026-01-15 06:36:06,2026-01-15 11:34:05,Temu,-28.21,0.00,EUR,COMPLETED,1.79',
        // Internal transfer to savings - should be filtered
        'Transfer,Current,2026-01-14 19:11:38,2026-01-14 19:11:38,To EUR Savings,-411.75,0.00,EUR,COMPLETED,0.00',
        // Internal pocket transfer - should be filtered
        'Transfer,Current,2026-02-13 07:46:32,2026-02-13 07:46:32,To pocket EUR Pagamentos automáticos from EUR,-100.00,0.00,EUR,COMPLETED,634.32',
        // Deposit product row - should be skipped entirely
        'Transfer,Deposit,2026-01-14 19:11:38,2026-01-14 19:11:38,To EUR Savings,411.75,0.00,EUR,COMPLETED,447.36',
        // Pocket (Savings product) real expense - should be imported
        'Transfer,Savings,2026-03-01 19:28:25,2026-03-02 02:44:11,To Sérgio Casella,-320.00,0.00,EUR,COMPLETED,40.00',
        // Pocket deposit (positive) - should be filtered
        'Transfer,Savings,2026-02-13 07:46:32,2026-02-13 07:46:32,To pocket EUR Pagamentos automáticos from EUR,100.00,0.00,EUR,COMPLETED,100.00',
        // Reverted transaction - should be filtered
        'Card Payment,Current,2026-01-20 13:25:40,,Canva,-0.80,0.00,EUR,REVERTED,',
    ].join('\n');

    it('imports salary as income', () => {
        const result = parseRevolutCSV(mainAccountCSV);
        const salary = result.find(r => r.name.includes('CAIREEN'));
        expect(salary).toBeDefined();
        expect(salary?.is_income).toBe(true);
        expect(salary?.is_transfer).toBe(false);
        expect(salary?.amount).toBe(411.70);
    });

    it('imports card payments as expenses', () => {
        const result = parseRevolutCSV(mainAccountCSV);
        const temu = result.find(r => r.name === 'Temu');
        expect(temu).toBeDefined();
        expect(temu?.is_income).toBe(false);
        expect(temu?.category).toBe('Lifestyle');
    });

    it('marks To EUR Savings as internal transfer', () => {
        const result = parseRevolutCSV(mainAccountCSV);
        const savings = result.find(r => r.name === 'To EUR Savings');
        expect(savings?.is_transfer).toBe(true);
    });

    it('marks pocket deposits as internal transfer', () => {
        const result = parseRevolutCSV(mainAccountCSV);
        const pocket = result.find(r => r.name.includes('Pagamentos'));
        expect(pocket?.is_transfer).toBe(true);
    });

    it('skips Deposit product rows entirely', () => {
        const result = parseRevolutCSV(mainAccountCSV);
        // Deposit product rows have the same description as Current rows
        // We verify no duplicate was imported
        const savingsRows = result.filter(r => r.name === 'To EUR Savings');
        expect(savingsRows.length).toBe(1); // only the Current one (as transfer)
    });

    it('imports Pocket (Savings product) real expenses', () => {
        const result = parseRevolutCSV(mainAccountCSV);
        const sergio = result.find(r => r.name === 'To Sérgio Casella');
        expect(sergio).toBeDefined();
        expect(sergio?.is_income).toBe(false);
        expect(sergio?.amount).toBe(320.00);
    });

    it('skips REVERTED transactions', () => {
        const result = parseRevolutCSV(mainAccountCSV);
        const reverted = result.find(r => r.name === 'Canva');
        expect(reverted).toBeUndefined();
    });

    it('detects pocket names in detectPotsFromCSV', () => {
        const result = parseRevolutCSV(mainAccountCSV);
        const pots = detectPotsFromCSV(result);
        expect(pots.find(p => p.name === 'Pagamentos automáticos')).toBeDefined();
    });
});

describe('parseRevolutCSV — Savings Account format', () => {
    const savingsCSV = [
        'Summary for Savings Accounts - EUR',
        'Description,Amount',
        'Opening balance,â¬0',
        'Closing balance,â¬343.98',
        '',
        'Transactions for Savings Accounts - EUR',
        'Date,Description,Money out,Money in,Balance',
        '7 Jan 2026,To EUR Savings,,â¬38.60,â¬38.60',
        '8 Jan 2026,From EUR Savings,â¬3.00,,â¬35.60',
        '14 Jan 2026,Net Interest Paid to Savings for 14 Jan 2026,,â¬0.01,â¬35.61',
    ].join('\n');

    it('detects and parses the savings format', () => {
        const result = parseRevolutCSV(savingsCSV);
        expect(result.length).toBeGreaterThan(0);
    });

    it('marks To EUR rows as internal transfers', () => {
        const result = parseRevolutCSV(savingsCSV);
        const deposit = result.find((r) => r.name === 'To EUR Savings');
        expect(deposit).toBeDefined();
        expect(deposit?.is_transfer).toBe(true);
        expect(deposit?.category).toBe('Transfer');
        expect(deposit?.amount).toBe(38.6);
    });

    it('marks From EUR rows as internal transfers', () => {
        const result = parseRevolutCSV(savingsCSV);
        const withdrawal = result.find((r) => r.name === 'From EUR Savings');
        expect(withdrawal).toBeDefined();
        expect(withdrawal?.is_transfer).toBe(true);
        expect(withdrawal?.is_income).toBe(false);
    });

    it('marks Net Interest as income, not a transfer', () => {
        const result = parseRevolutCSV(savingsCSV);
        const interest = result.find((r) => r.name.startsWith('Net Interest Paid'));
        expect(interest).toBeDefined();
        expect(interest?.is_transfer).toBe(false);
        expect(interest?.is_income).toBe(true);
        expect(interest?.category).toBe('Income');
    });

    it('handles the broken euro symbol â¬ in amounts', () => {
        const result = parseRevolutCSV(savingsCSV);
        result.forEach((r) => {
            expect(isNaN(r.amount)).toBe(false);
            expect(r.amount).toBeGreaterThan(0);
        });
    });
});
