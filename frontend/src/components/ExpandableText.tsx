'use client'

import { useState, useRef, useEffect } from 'react'

interface ExpandableTextProps {
    text: string
    maxLength?: number
    className?: string
}

export function ExpandableText({ text, maxLength = 100, className = '' }: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showButton, setShowButton] = useState(false)
    const [contentHeight, setContentHeight] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const textRef = useRef<HTMLDivElement>(null)
    const fullTextRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (text.length > maxLength) {
            setShowButton(true)
        }

        if (fullTextRef.current) {
            setContentHeight(fullTextRef.current.scrollHeight)
        }
    }, [text, maxLength])

    const toggleExpanded = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isAnimating) return

        setIsAnimating(true)
        setIsExpanded(!isExpanded)

        // Reset animation flag after animation completes
        setTimeout(() => {
            setIsAnimating(false)
        }, 500)
    }

    const displayText = isExpanded ? text : text.slice(0, maxLength) + (text.length > maxLength ? '...' : '')

    return (
        <div className={className}>
            {/* Texto completo para medir altura */}
            <div
                ref={fullTextRef}
                className="absolute opacity-0 pointer-events-none"
                style={{ visibility: 'hidden' }}
            >
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {text}
                </p>
            </div>

            {/* Container com animação suave */}
            <div
                ref={textRef}
                className="overflow-hidden transition-all duration-500 ease-in-out relative"
                style={{
                    maxHeight: isExpanded ? `${contentHeight}px` : '4.5rem' // 4.5rem = ~72px para 2 linhas
                }}
            >
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {displayText}
                </p>

                {/* Gradiente de fade no final quando colapsado */}
                {!isExpanded && showButton && (
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
                )}
            </div>

            {showButton && (
                <button
                    onClick={toggleExpanded}
                    disabled={isAnimating}
                    className={`mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-all duration-200 flex items-center group hover:scale-105 ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    <span className="mr-2 transition-all duration-200">
                        {isExpanded ? 'Ver menos' : 'Ver mais'}
                    </span>
                    <div className="relative">
                        <svg
                            className={`w-4 h-4 transition-all duration-300 ease-in-out ${isExpanded ? 'rotate-180' : 'rotate-0'
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                        {/* Efeito de brilho no hover */}
                        <div className="absolute inset-0 bg-blue-400/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300"></div>
                    </div>
                </button>
            )}
        </div>
    )
}
