import { Mail, Phone, MapPin, Clock, Instagram, Facebook, Twitter, Heart } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FooterProps {
  businessName?: string
  email?: string
  phone?: string
  address?: string
  businessHours?: string
  social?: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  className?: string
}

export default function Footer({
  businessName = 'Booking System',
  email,
  phone,
  address,
  businessHours,
  social,
  className,
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn('bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-20', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {businessName}
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Agendamento online rápido, fácil e sem complicação. Escolha seu horário e confirme em poucos cliques.
            </p>

            {/* Social Links */}
            {social && (
              <div className="flex gap-3 mt-6">
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contato</h4>
            <ul className="space-y-3 text-gray-400">
              {email && (
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                    {phone}
                  </a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Business Hours */}
          {businessHours && (
            <div>
              <h4 className="text-lg font-bold mb-4">Horário de Funcionamento</h4>
              <div className="flex items-start gap-3 text-gray-400">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="whitespace-pre-line">{businessHours}</p>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Serviços
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} {businessName}. Todos os direitos reservados.
            </p>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              Feito com <Heart className="w-4 h-4 text-red-500 fill-current" /> pela equipe
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
