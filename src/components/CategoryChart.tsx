import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = [
    'hsl(221, 83%, 53%)',
    'hsl(142, 71%, 45%)',
    'hsl(38, 92%, 50%)',
    'hsl(0, 72%, 51%)',
    'hsl(262, 83%, 58%)',
    'hsl(187, 85%, 43%)',
    'hsl(330, 81%, 60%)',
];

interface Props {
    data: Array<{ name: string; value: number }>;
}

export function CategoryChart({ data }: Props) {
    if (data.length === 0) {
        return (
            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-medium">
                        Spending by Category
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                    No expense data for this period.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-medium">
                    Spending by Category
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <ResponsiveContainer width={200} height={200}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {data.map((_, i) => (
                                    <Cell
                                        key={i}
                                        fill={COLORS[i % COLORS.length]}
                                        strokeWidth={0}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) =>
                                    `€${value.toFixed(2)}`
                                }
                                contentStyle={{
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3">
                        {data.map((entry, i) => (
                            <div
                                key={entry.name}
                                className="flex items-center gap-2 text-sm"
                            >
                                <span
                                    className="h-3 w-3 rounded-full"
                                    style={{
                                        backgroundColor:
                                            COLORS[i % COLORS.length],
                                    }}
                                />
                                <span className="text-muted-foreground">
                                    {entry.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
