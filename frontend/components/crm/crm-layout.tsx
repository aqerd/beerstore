'use client'

import type { ReactNode } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/crm/app-sidebar'
import { Header } from '@/components/crm/header'
import { CRMProvider } from '@/components/crm/crm-provider'

interface CRMLayoutProps {
  children: ReactNode
}

export function CRMLayout({ children }: CRMLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
