// Re-exporta useAuth do AuthContext para manter compatibilidade com todos os imports existentes.
// O estado de autenticação agora é compartilhado via Context (único listener por sessão).
export { useAuth } from '@/contexts/AuthContext'
