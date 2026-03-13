"use client"

import { usePathname, useRouter } from "next/navigation"
import { BarChart2, CreditCard, FolderOpen, TrendingUp, Repeat, Wallet, Target, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Dock } from "@/components/ui/dock-two"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/subscriptions", label: "Subscriptions", icon: Repeat },
  { href: "/categories", label: "Categories", icon: FolderOpen },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/net-worth", label: "Net Worth", icon: Wallet },
  { href: "/savings-goals", label: "Goals", icon: Target },
]

function ThemeDockIcon() {
  const { resolvedTheme } = useTheme()
  return resolvedTheme === "dark" ? Sun : Moon
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  const items = [
    ...navLinks.map(({ href, label, icon }) => ({
      icon,
      label,
      active: pathname === href || pathname.startsWith(href + "/"),
      onClick: () => router.push(href),
    })),
    {
      icon: resolvedTheme === "dark" ? Sun : Moon,
      label: resolvedTheme === "dark" ? "Light Mode" : "Dark Mode",
      active: false,
      onClick: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    },
  ]

  return <Dock items={items} />
}
