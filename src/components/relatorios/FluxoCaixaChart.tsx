import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface FluxoCaixaPeriodo {
  periodo: string
  entradas: number
  saidas: number
  saldo_periodo: number
  saldo_acumulado: number
}

interface FluxoCaixaChartProps {
  data: FluxoCaixaPeriodo[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const FluxoCaixaChart = ({ data }: FluxoCaixaChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover p-4 border rounded-lg shadow-md">
          <p className="font-medium mb-2">{`Período: ${label}`}</p>
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

  const totalEntradas = data.reduce((acc, item) => acc + item.entradas, 0)
  const totalSaidas = data.reduce((acc, item) => acc + item.saidas, 0)
  const saldoFinal = data.length > 0 ? data[data.length - 1].saldo_acumulado : 0

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total de Entradas</CardDescription>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(totalEntradas)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total de Saídas</CardDescription>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalSaidas)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Saldo Acumulado</CardDescription>
            <DollarSign className={`h-4 w-4 ${saldoFinal >= 0 ? 'text-success' : 'text-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoFinal >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(saldoFinal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa por Período</CardTitle>
          <CardDescription>
            Visualização das entradas, saídas e saldo acumulado ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="periodo" 
                className="text-sm fill-muted-foreground"
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={formatCurrency}
                className="text-sm fill-muted-foreground"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tickFormatter={formatCurrency}
                className="text-sm fill-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Linha de referência no zero */}
              <ReferenceLine yAxisId="right" y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
              
              {/* Barras de Entradas e Saídas */}
              <Bar 
                yAxisId="left"
                dataKey="entradas" 
                fill="hsl(var(--success))" 
                name="Entradas"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              <Bar 
                yAxisId="left"
                dataKey="saidas" 
                fill="hsl(var(--destructive))" 
                name="Saídas"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              
              {/* Linha do Saldo Acumulado */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="saldo_acumulado" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="Saldo Acumulado"
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}