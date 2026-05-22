import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import JSZip from 'jszip'

interface BackupData {
  timestamp: string
  empresa: any
  processos: any[]
  clientes: any[]
  veiculos: any[]
  transacoes: any[]
  configuracoes: any
}

export const useBackup = () => {
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { user } = useAuth()

  const generateBackup = async (): Promise<BackupData | null> => {
    if (!user) return null

    try {
      setLoading(true)

      // Buscar todos os dados do usuário
      const [processosRes, clientesRes, veiculosRes, transacoesRes, configRes] = await Promise.all([
        supabase.from('processos').select(`
          *,
          clientes(nome, cpf_cnpj, telefone, email),
          veiculos(marca, modelo, placa, ano)
        `).eq('user_id', user.id),
        
        supabase.from('clientes').select('*').eq('user_id', user.id),
        supabase.from('veiculos').select('*').eq('user_id', user.id),
        supabase.from('transacoes_financeiras').select(`
          *,
          clientes(nome)
        `).eq('user_id', user.id),
        supabase.from('configuracoes_empresa').select('*').eq('user_id', user.id).maybeSingle()
      ])

      // Verificar erros
      if (processosRes.error) throw processosRes.error
      if (clientesRes.error) throw clientesRes.error
      if (veiculosRes.error) throw veiculosRes.error
      if (transacoesRes.error) throw transacoesRes.error
      if (configRes.error) throw configRes.error

      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        empresa: configRes.data,
        processos: processosRes.data || [],
        clientes: clientesRes.data || [],
        veiculos: veiculosRes.data || [],
        transacoes: transacoesRes.data || [],
        configuracoes: configRes.data
      }

      return backupData

    } catch (error) {
      console.error('Erro ao gerar backup:', error)
      toast({
        title: "Erro",
        description: "Erro ao gerar backup dos dados",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const exportToJSON = async () => {
    const backup = await generateBackup()
    if (!backup) return

    try {
      setExporting(true)
      const dataStr = JSON.stringify(backup, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `backup_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Backup exportado em JSON com sucesso!",
      })

    } catch (error) {
      console.error('Erro ao exportar JSON:', error)
      toast({
        title: "Erro",
        description: "Erro ao exportar backup",
        variant: "destructive"
      })
    } finally {
      setExporting(false)
    }
  }

  const convertToCSV = (data: any[], headers: string[]) => {
    const csvHeaders = headers.join(',')
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""')
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(',')
    })
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  const exportToCSV = async () => {
    const backup = await generateBackup()
    if (!backup) return

    try {
      setExporting(true)
      
      const sheets = [
        {
          name: 'processos',
          data: backup.processos,
          headers: ['numero_protocolo', 'servico', 'status', 'valor', 'prazo', 'cliente_nome', 'veiculo_info', 'created_at']
        },
        {
          name: 'clientes',
          data: backup.clientes,
          headers: ['nome', 'cpf_cnpj', 'telefone', 'email', 'endereco', 'created_at']
        },
        {
          name: 'veiculos',
          data: backup.veiculos,
          headers: ['marca', 'modelo', 'placa', 'ano', 'chassi', 'renavam', 'created_at']
        },
        {
          name: 'financeiro',
          data: backup.transacoes,
          headers: ['tipo', 'categoria', 'descricao', 'valor', 'data_transacao', 'status', 'cliente_nome', 'created_at']
        }
      ]

      // Processar dados para CSV
      const processedSheets = sheets.map(sheet => {
        const processedData = sheet.data.map(item => {
          const processed: any = {}
          sheet.headers.forEach(header => {
            switch (header) {
              case 'cliente_nome':
                processed[header] = item.clientes?.nome || ''
                break
              case 'veiculo_info':
                processed[header] = item.veiculos ? `${item.veiculos.marca} ${item.veiculos.modelo} - ${item.veiculos.placa}` : ''
                break
              case 'prazo':
              case 'data_transacao':
                processed[header] = item[header] ? format(new Date(item[header]), 'dd/MM/yyyy', { locale: ptBR }) : ''
                break
              case 'created_at':
                processed[header] = format(new Date(item[header]), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                break
              case 'valor':
                processed[header] = `R$ ${Number(item[header]).toFixed(2).replace('.', ',')}`
                break
              default:
                processed[header] = item[header] || ''
            }
          })
          return processed
        })

        return {
          name: sheet.name,
          csv: convertToCSV(processedData, sheet.headers)
        }
      })

      // Criar ZIP com múltiplas planilhas
      const zip = new JSZip()
      processedSheets.forEach(sheet => {
        zip.file(`${sheet.name}.csv`, sheet.csv)
      })

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `backup_planilhas_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Backup exportado em CSV com sucesso!",
      })

    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      toast({
        title: "Erro",
        description: "Erro ao exportar planilhas",
        variant: "destructive"
      })
    } finally {
      setExporting(false)
    }
  }

  return {
    loading,
    exporting,
    exportToJSON,
    exportToCSV,
    generateBackup
  }
}
