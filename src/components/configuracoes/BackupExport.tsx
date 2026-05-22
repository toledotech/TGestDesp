import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBackup } from '@/hooks/useBackup'
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  Database,
  Shield,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const BackupExport = () => {
  const { loading, exporting, exportToJSON, exportToCSV } = useBackup()

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Os backups contêm todos os seus dados sensíveis. Mantenha-os em local seguro e não compartilhe com terceiros.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-primary" />
              Backup Completo (JSON)
            </CardTitle>
            <CardDescription>
              Exporta todos os dados em formato JSON para backup completo ou migração
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Todos os processos e protocolos
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Clientes e veículos completos
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Histórico financeiro completo
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Configurações do sistema
              </div>
            </div>
            
            <Button 
              onClick={exportToJSON}
              disabled={loading || exporting}
              className="w-full"
              size="lg"
            >
              {loading || exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exportar JSON
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Planilhas (CSV)
            </CardTitle>
            <CardDescription>
              Exporta dados em planilhas separadas para análise e relatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Planilha de Processos
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Planilha de Clientes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Planilha de Veículos
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Planilha Financeira
              </div>
            </div>
            
            <Button 
              onClick={exportToCSV}
              disabled={loading || exporting}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {loading || exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exportar Planilhas
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Informações do Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Data/Hora</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileJson className="h-4 w-4 text-primary" />
                <span className="font-medium">Formato JSON</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Backup completo estruturado
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <span className="font-medium">Formato CSV</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Planilhas para análise
              </p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> Recomendamos fazer backups regulares dos seus dados. 
              O formato JSON é ideal para backup completo, enquanto CSV é perfeito para análises em planilhas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}