import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"

export interface ProcessoCliente {
  cliente: string
  quantidade: number
  valor_total: number
  valor_medio: number
  processos_concluidos: number
  processos_pendentes: number
  taxa_conclusao: number
}

interface ProcessosClienteChartProps {
  data: ProcessoCliente[]
}

export const ProcessosClienteChart = ({ data }: ProcessosClienteChartProps) => {
  const topClientes = data.slice(0, 10) // Top 10 clientes

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Volume por Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Volume de Processos por Cliente</CardTitle>
          <CardDescription>Quantidade de processos por cliente (Top 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topClientes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="cliente" 
                className="fill-muted-foreground text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="fill-muted-foreground text-xs" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="quantidade" 
                fill="hsl(var(--primary))" 
                name="Quantidade"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Valor por Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Valor Total por Cliente</CardTitle>
          <CardDescription>Receita gerada por cliente (Top 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topClientes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="cliente" 
                className="fill-muted-foreground text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="fill-muted-foreground text-xs" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  'Valor Total'
                ]}
              />
              <Bar 
                dataKey="valor_total" 
                fill="hsl(var(--chart-2))" 
                name="Valor Total"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Status dos Processos por Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Processos (Top 5 Clientes)</CardTitle>
          <CardDescription>Processos concluídos vs pendentes por cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topClientes.slice(0, 5)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="cliente" 
                className="fill-muted-foreground text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="fill-muted-foreground text-xs" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="processos_concluidos" 
                fill="hsl(var(--chart-3))" 
                name="Concluídos"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="processos_pendentes" 
                fill="hsl(var(--chart-4))" 
                name="Pendentes"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Taxa de Conclusão */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conclusão por Cliente</CardTitle>
          <CardDescription>Percentual de processos concluídos (Top 5)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topClientes.slice(0, 5)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ cliente, taxa_conclusao }) => `${cliente}: ${taxa_conclusao.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="taxa_conclusao"
              >
                {topClientes.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taxa de Conclusão']}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}