import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { AlertTriangle, Clock, Calendar } from "lucide-react"

interface ControlePrazo {
  categoria: string
  quantidade: number
  processos: Array<{
    id: string
    numero_protocolo: string
    cliente_nome: string
    servico: string
    prazo: string
    dias_restantes: number
  }>
}

interface ControlePrazosChartProps {
  data: ControlePrazo[]
}

const COLORS = {
  'Vencidos': '#ef4444',
  'Hoje': '#f59e0b', 
  'Próximos 7 dias': '#3b82f6',
  'Próximos 15 dias': '#10b981',
  'Próximos 30 dias': '#8b5cf6'
}

export const ControlePrazosChart = ({ data }: ControlePrazosChartProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">Quantidade: {data.quantidade} processos</p>
          {data.processos.slice(0, 3).map((processo: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              • {processo.numero_protocolo} - {processo.cliente_nome}
            </p>
          ))}
          {data.processos.length > 3 && (
            <p className="text-xs text-muted-foreground">
              ... e mais {data.processos.length - 3} processos
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const getIcon = (categoria: string) => {
    switch (categoria) {
      case 'Vencidos':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'Hoje':
        return <Clock className="h-5 w-5 text-orange-500" />
      default:
        return <Calendar className="h-5 w-5 text-blue-500" />
    }
  }

  const totalProcessos = data.reduce((sum, item) => sum + item.quantidade, 0)
  const vencidos = data.find(item => item.categoria === 'Vencidos')?.quantidade || 0
  const hoje = data.find(item => item.categoria === 'Hoje')?.quantidade || 0
  const urgentes = vencidos + hoje

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Controle de Prazos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Monitoramento de processos por status de prazo
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum dado encontrado</p>
          </div>
        ) : (
          <>
            {/* Indicadores de Alerta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg border-2 ${urgentes > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-8 w-8 ${urgentes > 0 ? 'text-red-500' : 'text-green-500'}`} />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{urgentes}</p>
                    <p className="text-sm text-muted-foreground">Processos Urgentes</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{totalProcessos}</p>
                    <p className="text-sm text-muted-foreground">Total Monitorado</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {((urgentes / totalProcessos || 0) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Taxa de Urgência</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="h-80 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="categoria" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="quantidade" 
                    radius={[4, 4, 0, 0]}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.categoria as keyof typeof COLORS] || '#6b7280'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lista de Categorias */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Detalhamento por Categoria</h4>
              {data.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-l-4 ${
                    item.categoria === 'Vencidos' 
                      ? 'border-l-red-500 bg-red-50' 
                      : item.categoria === 'Hoje'
                      ? 'border-l-orange-500 bg-orange-50'
                      : 'border-l-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getIcon(item.categoria)}
                      <span className="font-medium">{item.categoria}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{item.quantidade}</p>
                      <p className="text-sm text-muted-foreground">
                        {((item.quantidade / totalProcessos) * 100).toFixed(1)}% do total
                      </p>
                    </div>
                  </div>
                  
                  {item.processos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Principais processos:
                      </p>
                      <div className="space-y-1">
                        {item.processos.slice(0, 3).map((processo, pIndex) => (
                          <div key={pIndex} className="text-sm flex justify-between">
                            <span>{processo.numero_protocolo} - {processo.cliente_nome}</span>
                            <span className="text-muted-foreground">
                              {processo.servico} • {formatDate(processo.prazo)}
                            </span>
                          </div>
                        ))}
                        {item.processos.length > 3 && (
                          <p className="text-xs text-muted-foreground italic">
                            ... e mais {item.processos.length - 3} processos
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}