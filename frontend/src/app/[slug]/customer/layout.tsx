import { ReactNode } from 'react'

interface CustomerLayoutProps {
    children: ReactNode
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {children}
        </div>
    )
}
