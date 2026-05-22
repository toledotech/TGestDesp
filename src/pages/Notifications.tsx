import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotifications } from "@/hooks/useNotifications"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Bell, CheckCheck, Trash2 } from "lucide-react"

const Notifications = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications()
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return notification.read
    return true
  })

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-semibold">Notificações</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 
                ? `${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}` 
                : 'Todas as notificações foram lidas'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Não Lidas</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <div className="text-2xl">🔴</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold text-red-600">
                  {notifications.filter(n => n.type === 'error').length}
                </p>
              </div>
              <div className="text-2xl">🚨</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avisos</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {notifications.filter(n => n.type === 'warning').length}
                </p>
              </div>
              <div className="text-2xl">⚠️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Lista */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Não Lidas ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Lidas ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {filter === 'all' && 'Nenhuma notificação ainda'}
                    {filter === 'unread' && 'Nenhuma notificação não lida'}
                    {filter === 'read' && 'Nenhuma notificação lida'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-colors ${!notification.read ? 'bg-accent/50 border-l-4 border-l-primary' : ''}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {getIconByType(notification.type)}
                          </span>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{notification.title}</h3>
                            <Badge variant={getVariantByType(notification.type)} className="text-xs">
                              {notification.type}
                            </Badge>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {format(notification.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                            <span>
                              {formatDistanceToNow(notification.timestamp, {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          
                          {notification.action && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={notification.action.onClick}
                            >
                              {notification.action.label}
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotification(notification.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Notifications