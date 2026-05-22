import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useNotifications } from "@/hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCheck, X, Bell } from "lucide-react"

export const NotificationsList = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications()

  const getVariantByType = (type: string) => {
    switch (type) {
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      case 'success': return 'default'
      case 'info': return 'outline'
      default: return 'outline'
    }
  }

  const getIconByType = (type: string) => {
    switch (type) {
      case 'error': return '🚨'
      case 'warning': return '⚠️'
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      default: return '🔔'
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          Nenhuma notificação ainda
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">
          Notificações
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Marcar todas
          </Button>
        )}
      </div>

      {/* Lista de notificações */}
      <ScrollArea className="max-h-96">
        {notifications.map((notification, index) => (
          <div key={notification.id}>
            <div
              className={`p-4 hover:bg-accent transition-colors cursor-pointer ${
                !notification.read ? 'bg-accent/50' : ''
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {getIconByType(notification.type)}
                    </span>
                    <h4 className="text-sm font-medium leading-none">
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.timestamp, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                    {notification.action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          notification.action?.onClick()
                        }}
                        className="text-xs h-6 px-2"
                      >
                        {notification.action.label}
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeNotification(notification.id)
                  }}
                  className="h-6 w-6 p-0 hover:bg-destructive/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {index < notifications.length - 1 && <Separator />}
          </div>
        ))}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full text-xs"
            onClick={() => window.location.href = '/notifications'}
          >
            Ver todas as notificações
          </Button>
        </div>
      )}
    </div>
  )
}