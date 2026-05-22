import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Button } from "@/components/ui/button"
import { BarChart3, PieChart as PieChartIcon } from "lucide-react"
import { useState } from "react"

interface ProcessoServico {
  servico: string
  quantidade: number
  porcentagem: number
  valor_total: number
  valor_medio: number
}

interface ProcessosServicoChartProps {
  data: ProcessoServico[]
}

const COLORS = {
  'Transferência': '#3b82f6',
  'Licenciamento': '#10b981',
  'IPVA': '#f59e0b',
  'Multas': '#ef4444',
  'CNH': '#8b5cf6',
  'Outros': '#6b7280'
}

export const ProcessosServicoChart = ({ data }: ProcessosServicoChartProps) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label || data.servico}</p>
          <p className="text-blue-600">Quantidade: {data.quantidade}</p>
          <p className="text-green-600">Porcentagem: {data.porcentagem.toFixed(1)}%</p>
          <p className="text-purple-600">Valor Total: {formatCurrency(data.valor_total)}</p>
          <p className="text-orange-600">Valor Médio: {formatCurrency(data.valor_medio)}</p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices smaller than 5%
    
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
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const totalProcessos = data.reduce((sum, item) => sum + item.quantidade, 0)
  const totalValor = data.reduce((sum, item) => sum + item.valor_total, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Distribuição por Tipo de Serviço</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Análise dos serviços mais demandados
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Barras
          </Button>
          <Button
            variant={chartType === 'pie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('pie')}
          >
            <PieChartIcon className="h-4 w-4 mr-1" />
            Pizza
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum dado encontrado</p>
          </div>
        ) : (
          <>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="servico" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="quantidade" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={<CustomLabel />}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="quantidade"
                    >
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.servico as keyof typeof COLORS] || COLORS['Outros']} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
            
            {/* Resumo */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">Resumo Geral</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{totalProcessos}</p>
                  <p className="text-sm text-muted-foreground">Total de Processos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValor)}</p>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{data.length}</p>
                  <p className="text-sm text-muted-foreground">Tipos de Serviço</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(totalValor / totalProcessos || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor Médio</p>
                </div>
              </div>
            </div>

            {/* Lista de serviços */}
            <div className="mt-6 space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ 
                        backgroundColor: COLORS[item.servico as keyof typeof COLORS] || COLORS['Outros'] 
                      }}
                    />
                    <span className="font-medium">{item.servico}</span>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <span className="text-blue-600">{item.quantidade} processos</span>
                    <span className="text-green-600">{item.porcentagem.toFixed(1)}%</span>
                    <span className="text-purple-600">{formatCurrency(item.valor_total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}