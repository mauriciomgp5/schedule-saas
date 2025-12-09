import { Calendar, Clock, Users, Shield, Zap, Star, Check, ArrowRight, Sparkles } from 'lucide-react'
import Hero from '@/components/ui/Hero'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Testimonials from '@/components/ui/Testimonials'
import Gallery from '@/components/ui/Gallery'
import Footer from '@/components/ui/Footer'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Calendar,
    title: 'Agendamento Inteligente',
    description: 'Sistema de agendamento automático que evita conflitos e otimiza sua agenda.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
  {
    icon: Clock,
    title: 'Disponibilidade 24/7',
    description: 'Seus clientes podem agendar a qualquer hora, aumentando suas conversões.',
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
  {
    icon: Users,
    title: 'Gestão de Clientes',
    description: 'Mantenha histórico completo, preferências e comunicação com seus clientes.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
  },
  {
    icon: Shield,
    title: '100% Seguro',
    description: 'Proteção de dados com criptografia e conformidade com LGPD.',
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
  },
  {
    icon: Zap,
    title: 'Notificações Automáticas',
    description: 'Lembretes por email e SMS reduzem faltas em até 70%.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  {
    icon: Sparkles,
    title: 'Personalização Total',
    description: 'Adapte cores, logo e domínio para refletir sua marca.',
    color: 'text-pink-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900/20',
  },
]

const plans = [
  {
    name: 'Básico',
    price: 'R$ 49',
    period: '/mês',
    description: 'Perfeito para profissionais autônomos',
    features: [
      'Até 100 agendamentos/mês',
      '1 profissional',
      'Calendário online',
      'Notificações por email',
      'Suporte por email',
    ],
    popular: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 99',
    period: '/mês',
    description: 'Ideal para pequenas equipes',
    features: [
      'Agendamentos ilimitados',
      'Até 5 profissionais',
      'Calendário + Agenda',
      'Email + SMS',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'R$ 199',
    period: '/mês',
    description: 'Para empresas que querem escalar',
    features: [
      'Tudo do Profissional',
      'Profissionais ilimitados',
      'API personalizada',
      'White label',
      'Integração com ERPs',
      'Gerente de conta dedicado',
    ],
    popular: false,
  },
]

const testimonials = [
  {
    id: 1,
    name: 'Maria Silva',
    role: 'Proprietária - Salão Beleza Pura',
    rating: 5,
    comment:
      'O sistema transformou completamente meu negócio! Reduzi as faltas em 80% com os lembretes automáticos e meus clientes adoram a facilidade de agendar online.',
    date: 'Há 2 meses',
  },
  {
    id: 2,
    name: 'João Santos',
    role: 'Fisioterapeuta',
    rating: 5,
    comment:
      'Antes eu gastava horas por semana organizando agenda. Agora tudo é automático e posso focar no que importa: meus pacientes. Excelente investimento!',
    date: 'Há 1 mês',
  },
  {
    id: 3,
    name: 'Ana Costa',
    role: 'Barbearia Moderna',
    rating: 5,
    comment:
      'A personalização é incrível! Consegui deixar tudo com a cara da minha marca. Os clientes elogiam muito a facilidade de uso.',
    date: 'Há 3 semanas',
  },
]

const galleryImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    title: 'Salão de Beleza',
    description: 'Interface moderna e intuitiva',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400',
    title: 'Barbearia',
    description: 'Agendamento simplificado',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=400',
    title: 'Clínica',
    description: 'Gestão profissional',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400',
    title: 'Consultório',
    description: 'Organização total',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
    title: 'Equipe',
    description: 'Colaboração facilitada',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400',
    title: 'Dashboard',
    description: 'Controle completo',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Theme Toggle */}
      <ThemeToggle className="fixed top-4 right-4 z-50 animate-slide-in-right" />

      {/* Hero */}
      <Hero
        title={
          <>
            Transforme seu <span className="gradient-text">agendamento</span>
            <br />
            em experiência
          </>
        }
        subtitle="Sistema SAAS completo"
        description="A plataforma mais completa para gestão de agendamentos online. Aumente suas conversões, reduza faltas e automatize seu negócio."
        badges={
          <>
            <Badge variant="success" size="lg" icon={<Star className="w-4 h-4" />}>
              4.9/5 estrelas
            </Badge>
            <Badge variant="info" size="lg" icon={<Users className="w-4 h-4" />}>
              +5000 clientes
            </Badge>
            <Badge variant="purple" size="lg" icon={<Shield className="w-4 h-4" />}>
              LGPD Compliant
            </Badge>
          </>
        }
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
          <Button size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
            Começar Gratuitamente
          </Button>
          <Button size="xl" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20">
            Ver Demonstração
          </Button>
        </div>
      </Hero>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-in-up">
            <Badge variant="info" size="lg" className="mb-4">
              Recursos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Ferramentas poderosas para automatizar, organizar e escalar seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                padding="lg"
                hover
                className={`animate-scale-in animation-delay-${(index % 3) * 200 + 200}`}
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-in-up">
            <Badge variant="purple" size="lg" className="mb-4">
              Galeria
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Veja o sistema em ação
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Interface moderna, intuitiva e totalmente responsiva
            </p>
          </div>

          <Gallery images={galleryImages} columns={3} />
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-in-up">
            <Badge variant="success" size="lg" className="mb-4">
              Planos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Sem taxas ocultas. Cancele quando quiser. 14 dias de teste grátis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                padding="lg"
                hover
                className={`relative animate-scale-in animation-delay-${index * 200 + 200} ${
                  plan.popular
                    ? 'border-2 border-primary shadow-2xl scale-105 dark:bg-gray-700'
                    : 'dark:bg-gray-800'
                }`}
              >
                {plan.popular && (
                  <Badge
                    variant="info"
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                  >
                    Mais Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                    size="lg"
                  >
                    Começar Agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials testimonials={testimonials} />

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-in-up">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 opacity-90 animate-slide-in-up animation-delay-200">
            Junte-se a milhares de profissionais que já automatizaram seus agendamentos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-slide-in-up animation-delay-400">
            <Link to="/login">
              <Button
                size="xl"
                className="bg-white text-primary hover:bg-gray-100"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Criar Conta Grátis
              </Button>
            </Link>
            <Button
              size="xl"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
            >
              Agendar Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        businessName="Booking System"
        email="contato@bookingsystem.com"
        phone="+55 (11) 9999-9999"
        address="São Paulo, SP - Brasil"
        businessHours="Seg - Sex: 9h às 18h"
        social={{
          instagram: 'https://instagram.com',
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com',
        }}
      />
    </div>
  )
}
