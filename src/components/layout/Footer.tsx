import { useConfiguracoes } from "@/hooks/useConfiguracoes"

export const Footer = () => {
  const { configuracoes } = useConfiguracoes()
  const currentYear = new Date().getFullYear()
  
  const empresaNome = configuracoes?.nome_empresa || "GestDesp"
  
  return (
    <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
      <p>© {currentYear} {empresaNome}</p>
      <p>Sistema de Gestão para Despachantes</p>
    </div>
  )
}