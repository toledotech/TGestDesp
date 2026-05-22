import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ReceitaDespesaPeriodo {
  periodo: string
  receitas: number
  despesas: number
  saldo: number
}

interface ReceitasDespesasChartProps {
  data: ReceitaDespesaPeriodo[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const ReceitasDespesasChart = ({ data }: ReceitasDespesasChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover p-3 border rounded-lg shadow-md">
          <p className="font-medium">{`Período: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="line" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="line">Gráfico de Linha</TabsTrigger>
          <TabsTrigger value="bar">Gráfico de Barras</TabsTrigger>
        </TabsList>
        
        <TabsContent value="line">
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas - Evolução Mensal</CardTitle>
              <CardDescription>
                Comparativo da evolução de receitas e despesas ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="periodo" 
                    className="text-sm fill-muted-foreground"
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    className="text-sm fill-muted-foreground"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="receitas" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={3}
                    name="Receitas"
                    dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="despesas" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={3}
                    name="Despesas"
                    dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Saldo Líquido"
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bar">
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas - Comparativo</CardTitle>
              <CardDescription>
                Comparação direta entre receitas e despesas por período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="periodo" 
                    className="text-sm fill-muted-foreground"
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    className="text-sm fill-muted-foreground"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="receitas" 
                    fill="hsl(var(--success))" 
                    name="Receitas"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="despesas" 
                    fill="hsl(var(--destructive))" 
                    name="Despesas"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}