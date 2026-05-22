import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart
} from "recharts"
import { ProcessoPeriodo } from "@/hooks/useRelatorios"

interface ProcessosPeriodoChartProps {
  data: ProcessoPeriodo[]
}

export const ProcessosPeriodoChart = ({ data }: ProcessosPeriodoChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Período: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey === 'valor_total' || entry.dataKey === 'valor_medio' 
                ? formatCurrency(entry.value) 
                : entry.value} ${
                  entry.dataKey === 'quantidade' ? 'processos' :
                  entry.dataKey === 'valor_total' ? '' :
                  entry.dataKey === 'valor_medio' ? 'por processo' :
                  entry.dataKey === 'processos_concluidos' ? 'concluídos' :
                  entry.dataKey === 'processos_pendentes' ? 'pendentes' : ''
                }`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="quantidade" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quantidade">Quantidade</TabsTrigger>
          <TabsTrigger value="valores">Valores</TabsTrigger>
          <TabsTrigger value="status">Por Status</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
        </TabsList>

        {/* Gráfico de Quantidade */}
        <TabsContent value="quantidade">
          <Card>
            <CardHeader>
              <CardTitle>Quantidade de Processos por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="periodo" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quantidade" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico de Valores */}
        <TabsContent value="valores">
          <Card>
            <CardHeader>
              <CardTitle>Valores por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="periodo" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    content={<CustomTooltip />}
                    formatter={(value: any, name: string) => [
                      name === 'valor_total' || name === 'valor_medio' ? formatCurrency(value) : value,
                      name === 'valor_total' ? 'Valor Total' : 'Valor Médio'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="valor_total" fill="#10B981" name="Valor Total" radius={[4, 4, 0, 0]} />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="valor_medio" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    name="Valor Médio"
                    dot={{ fill: '#F59E0B', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico por Status */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Processos por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="periodo" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="processos_concluidos" 
                    stackId="a" 
                    fill="#10B981" 
                    name="Concluídos"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="processos_pendentes" 
                    stackId="a" 
                    fill="#F59E0B" 
                    name="Pendentes"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico Comparativo */}
        <TabsContent value="comparativo">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Temporal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="periodo" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="quantidade"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Quantidade"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}