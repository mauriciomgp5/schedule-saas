import { Star, Quote } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Testimonial {
  id: number
  name: string
  role?: string
  avatar?: string
  rating: number
  comment: string
  date?: string
}

interface TestimonialsProps {
  testimonials: Testimonial[]
  className?: string
  columns?: 1 | 2 | 3
}

export default function Testimonials({
  testimonials,
  className,
  columns = 3,
}: TestimonialsProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <div className={cn('py-16', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-in-up">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Confira os depoimentos de quem já experimentou nossos serviços
          </p>
        </div>

        <div className={cn('grid gap-8', gridCols[columns])}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 animate-scale-in',
                `animation-delay-${(index % 3) * 200 + 200}`
              )}
            >
              <div className="flex items-center gap-4 mb-6">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {testimonial.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  {testimonial.role && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  )}
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-4 h-4',
                          i < testimonial.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <Quote className="w-8 h-8 text-primary/20" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                "{testimonial.comment}"
              </p>
              {testimonial.date && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                  {testimonial.date}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
