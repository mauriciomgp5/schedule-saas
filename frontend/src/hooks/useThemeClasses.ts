import { useTheme } from '@/contexts/ThemeContext'

export const useThemeClasses = () => {
    // ✅ Hook sempre no topo - nunca condicional
    const { theme } = useTheme()

    const getInputClasses = () => {
        const baseClasses = "w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition"

        if (theme === 'dark') {
            return `${baseClasses} bg-gray-700 text-white border-gray-600 placeholder-gray-400`
        }

        return `${baseClasses} bg-white text-gray-900 border-gray-300 placeholder-gray-500`
    }

    const getLabelClasses = () => {
        return theme === 'dark'
            ? "block text-sm font-medium text-gray-300 mb-2"
            : "block text-sm font-medium text-gray-700 mb-2"
    }

    const getCardClasses = () => {
        return theme === 'dark'
            ? "bg-gray-800 rounded-2xl shadow-lg p-6"
            : "bg-white rounded-2xl shadow-lg p-6"
    }

    const getTextClasses = (variant: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
        if (theme === 'dark') {
            switch (variant) {
                case 'primary': return "text-white"
                case 'secondary': return "text-gray-300"
                case 'tertiary': return "text-gray-400"
                default: return "text-white"
            }
        }

        switch (variant) {
            case 'primary': return "text-gray-900"
            case 'secondary': return "text-gray-600"
            case 'tertiary': return "text-gray-500"
            default: return "text-gray-900"
        }
    }

    return {
        theme,
        getInputClasses,
        getLabelClasses,
        getCardClasses,
        getTextClasses
    }
}
