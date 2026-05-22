import {
  Home,
  Users,
  Car,
  FileText,
  Calendar,
  AlertTriangle,
  DollarSign,
  Settings,
  BarChart3,
  Bell,
  CreditCard,
  Package
} from "lucide-react"
import { NavLink } from "react-router-dom"
import { usePermissions } from "@/hooks/usePermissions"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const allMenuItems = [
  { title: "Dashboard",        url: "/",             icon: Home,          adminOnly: false },
  { title: "Processos",        url: "/processos",    icon: FileText,      adminOnly: false },
  { title: "Agenda",           url: "/agenda",       icon: Calendar,      adminOnly: false },
  { title: "Clientes",         url: "/clientes",     icon: Users,         adminOnly: false },
  { title: "Veículos",         url: "/veiculos",     icon: Car,           adminOnly: false },
  { title: "Financeiro",       url: "/financeiro",   icon: DollarSign,    adminOnly: false },
  { title: "Prazos",           url: "/prazos",       icon: AlertTriangle, adminOnly: false },
  { title: "Relatórios",       url: "/relatorios",   icon: BarChart3,     adminOnly: false },
  { title: "Notificações",     url: "/notifications",icon: Bell,          adminOnly: false },
  { title: "Assinatura",       url: "/assinatura",   icon: CreditCard,    adminOnly: false },
  { title: "Gerenciar Planos", url: "/planos",       icon: Package,       adminOnly: true  },
  { title: "Configurações",    url: "/configuracoes",icon: Settings,      adminOnly: false },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { isAdmin } = usePermissions()

  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin())

  return (
    <Sidebar collapsible="icon" className="border-r border-blue-800">
      <SidebarContent className="bg-gradient-to-b from-blue-900 to-blue-800">
        <SidebarGroup className="px-3 pt-6 pb-4">
          <SidebarGroupLabel className={`${isCollapsed ? 'hidden' : 'block'} text-blue-300 font-semibold uppercase tracking-widest text-xs mb-2`}>
            Menu Principal
          </SidebarGroupLabel>

          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    end={item.url === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative w-full ${
                        isActive
                          ? 'bg-white/15 text-cyan-300 shadow-md'
                          : 'text-blue-200 hover:bg-white/20 hover:text-cyan-300'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="p-1.5 shrink-0">
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        {!isCollapsed && (
                          <span className="font-medium text-sm">{item.title}</span>
                        )}
                        {isActive && !isCollapsed && (
                          <div className="absolute right-3 w-1 h-5 bg-white/70 rounded-full"></div>
                        )}
                      </>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
