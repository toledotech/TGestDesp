import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PieChart as PieIcon, BarChart3 } from "lucide-react"

interface ProcessoStatus {
  status: string
  quantidade: number
  porcentagem: number
  valor_total: number
  cor: string
}

interface ProcessosStatusChartProps {
  data: ProcessoStatus[]
}

const COLORS = {
  'Recebido': '#3b82f6',
  'Em Andamento': '#f59e0b', 
  'Aguardando Documentos': '#ef4444',
  'Concluído': '#10b981',
  'Cancelado': '#6b7280'
}

export const ProcessosStatusChart = ({ data }: ProcessosStatusChartProps) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.status}</p>
          <p className="text-sm text-muted-foreground">
            Quantidade: {data.quantidade} ({data.porcentagem.toFixed(1)}%)
          </p>
          <p className="text-sm text-muted-foreground">
            Valor: {formatCurrency(data.valor_total)}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Não mostrar labels para fatias muito pequenas
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Distribuição por Status</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={chartType === 'pie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('pie')}
          >
            <PieIcon className="h-4 w-4 mr-1" />
            Pizza
          </Button>
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Barras
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Nenhum dado encontrado para o período selecionado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={400}>
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={CustomLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="quantidade"
                    >
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.status as keyof typeof COLORS] || '#6b7280'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                ) : (
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="status" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="quantidade" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    >
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.status as keyof typeof COLORS] || '#6b7280'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Legenda/Resumo */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Resumo por Status
              </h4>
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ 
                        backgroundColor: COLORS[item.status as keyof typeof COLORS] || '#6b7280' 
                      }}
                    />
                    <div>
                      <p className="font-medium text-sm">{item.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.porcentagem.toFixed(1)}% do total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{item.quantidade}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.valor_total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}