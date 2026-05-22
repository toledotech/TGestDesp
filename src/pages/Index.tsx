import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

const Index = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // If user is not authenticated, show login prompt
  if (!loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold mb-4">Sistema de Gestão para Despachantes</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Faça login para acessar o sistema
          </p>
          <Button 
            onClick={() => navigate('/login')} 
            size="lg"
            className="bg-gradient-to-r from-primary to-primary-hover"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg">Carregando...</div>
        </div>
      </div>
    )
  }

  // Authenticated user - redirect to dashboard
  return null
}

export default Index;
