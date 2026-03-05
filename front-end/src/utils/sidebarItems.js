import {
    LayoutDashboard, 
    Airplay, 
    ShoppingCart, 
    ChartNoAxesCombined, 
    Users, 
    BanknoteArrowDown, 
    Package, 
    NotepadText, 
    Bell,
    Settings,
    MessageCircleQuestionMark, 
    LogOut
} from "lucide-react"

export const items = [
    { id: 1, name: "Dashboard", path: "/dashboard", link: "dashboard", icon: LayoutDashboard },
    { id: 2, name: "Caisse", path: "/counter", link: "counter", icon: Airplay },
    { id: 4, name: "Commandes", path: "/orders", link: "orders", icon: ShoppingCart },
    { id: 8, name: "Vente", path: "/sales", link: "sales", icon: ChartNoAxesCombined },
    { id: 3, name: "Clients", path: "/customers", link: "customers", icon: Users },
    { id: 5, name: "Payements", path: "/payments", link: "payments", icon: BanknoteArrowDown },
    { id: 6, name: "Produits", path: "/products", link: "products", icon: Package },
    { id: 7, name: "Rapport", path: "/reports", link: "reports", icon: NotepadText },
    { id: 12, name: "Notifications", path: "/notifications", link: "notifications", icon: Bell },
    { id: 9, name: "Paramètres", path: "/settings", link: "settings", icon: Settings },
    { id: 10, name: "Assistance", path: "/help", link: "help", icon: MessageCircleQuestionMark },
    { id: 11, name: "Déconnexion", path: "/logout", link: "logout", icon: LogOut },
]