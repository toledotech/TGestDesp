import { createContext, useContext, ReactNode } from "react"
import { useNotifications } from "@/hooks/useNotifications"

const NotificationsContext = createContext<ReturnType<typeof useNotifications> | undefined>(undefined)

interface NotificationsProviderProps {
  children: ReactNode
}

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const notifications = useNotifications()

  return (
    <NotificationsContext.Provider value={notifications}>
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider')
  }
  return context
}