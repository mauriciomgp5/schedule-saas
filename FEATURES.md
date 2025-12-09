# 🚀 Sistema de Agendamento SAAS - Guia Completo de Features

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Componentes UI](#componentes-ui)
- [Páginas](#páginas)
- [Animações](#animações)
- [Dark Mode](#dark-mode)
- [Como Usar](#como-usar)

---

## 🎯 Visão Geral

Sistema SAAS completo para agendamento de serviços com frontend moderno em React + TypeScript e backend Laravel 12.

### ✨ Destaques
- 🎨 **Design Moderno**: Interface elegante com Tailwind CSS
- 🌓 **Dark Mode**: Suporte completo a tema escuro
- 📱 **Responsivo**: Funciona perfeitamente em mobile, tablet e desktop
- ⚡ **Performance**: Animações suaves e carregamento rápido
- 🎭 **Personalizável**: Temas e cores customizáveis por tenant
- 🔒 **Seguro**: Autenticação Laravel Sanctum

---

## 🧩 Componentes UI

### Button
Botão versátil com múltiplas variantes e estados.

**Variantes:**
- `primary` - Botão principal (azul)
- `secondary` - Botão secundário (cinza)
- `outline` - Botão com borda
- `ghost` - Botão fantasma
- `destructive` - Botão de ação destrutiva (vermelho)

**Tamanhos:** `sm`, `md`, `lg`, `xl`

**Props:**
- `isLoading` - Mostra spinner de carregamento
- `leftIcon` / `rightIcon` - Ícones dos lados

```tsx
<Button
  variant="primary"
  size="lg"
  isLoading={false}
  rightIcon={<ArrowRight />}
>
  Confirmar
</Button>
```

---

### Card
Sistema modular de cards com componentes compostos.

**Componentes:**
- `Card` - Container principal
- `CardHeader` - Cabeçalho
- `CardTitle` - Título
- `CardDescription` - Descrição
- `CardContent` - Conteúdo
- `CardFooter` - Rodapé

**Props:**
- `hover` - Efeito de hover (scale + shadow)
- `padding` - `none`, `sm`, `md`, `lg`, `xl`

```tsx
<Card padding="lg" hover>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição aqui</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo do card
  </CardContent>
  <CardFooter>
    Rodapé com ações
  </CardFooter>
</Card>
```

---

### Badge
Badges coloridos para destacar informações.

**Variantes:**
- `default` - Cinza
- `success` - Verde
- `warning` - Amarelo
- `error` - Vermelho
- `info` - Azul
- `purple` - Roxo

**Tamanhos:** `sm`, `md`, `lg`

```tsx
<Badge variant="success" size="lg" icon={<Check />}>
  Confirmado
</Badge>
```

---

### Hero
Seção hero com gradiente animado ou imagem de fundo.

**Features:**
- Gradiente personalizado ou imagem
- Logo e nome do negócio
- Badges informativos
- Efeitos de blob animados
- Wave separator no rodapé
- Overlay configurável

```tsx
<Hero
  title={<>Seu <span className="gradient-text">Título</span></>}
  subtitle="Subtítulo"
  description="Descrição longa aqui"
  backgroundColor="#667eea"
  backgroundImage="https://..."
  logo="/logo.png"
  businessName="Meu Negócio"
  overlay={true}
  badges={<Badge>Badge 1</Badge>}
>
  <Button>Call to Action</Button>
</Hero>
```

---

### Gallery
Galeria de imagens com lightbox.

**Features:**
- Grid responsivo (2, 3 ou 4 colunas)
- Lightbox com zoom
- Navegação por teclado (setas, ESC)
- Thumbnails com hover effect
- Contador de imagens
- Títulos e descrições

```tsx
const images = [
  {
    id: 1,
    url: 'https://...',
    thumbnail: 'https://...',
    title: 'Imagem 1',
    description: 'Descrição'
  }
]

<Gallery images={images} columns={3} />
```

---

### Testimonials
Grade de depoimentos de clientes.

**Features:**
- Cards com avatar
- Sistema de 5 estrelas
- Layout 1, 2 ou 3 colunas
- Animações staggered
- Suporte a dark mode

```tsx
const testimonials = [
  {
    id: 1,
    name: 'João Silva',
    role: 'CEO',
    avatar: 'https://...',
    rating: 5,
    comment: 'Excelente serviço!',
    date: 'Há 2 semanas'
  }
]

<Testimonials testimonials={testimonials} columns={3} />
```

---

### Footer
Rodapé profissional com múltiplas seções.

**Seções:**
- Sobre o negócio
- Informações de contato
- Horário de funcionamento
- Links rápidos
- Redes sociais
- Copyright

```tsx
<Footer
  businessName="Meu Negócio"
  email="contato@exemplo.com"
  phone="+55 11 9999-9999"
  address="São Paulo, SP"
  businessHours="Seg - Sex: 9h às 18h"
  social={{
    instagram: 'https://instagram.com/...',
    facebook: 'https://facebook.com/...',
    twitter: 'https://twitter.com/...'
  }}
/>
```

---

### ThemeToggle
Botão para alternar entre modo claro e escuro.

**Features:**
- Ícones animados (Sol/Lua)
- Rotação suave
- Persistência em localStorage
- Detecção de preferência do sistema

```tsx
<ThemeToggle className="fixed top-4 right-4" />
```

---

### Input & Textarea
Campos de formulário estilizados.

**Features:**
- Labels automáticos
- Indicador de obrigatório
- Mensagens de erro
- Suporte a ícones
- Estados focus/disabled

```tsx
<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  error="Email inválido"
  icon={<Mail />}
  required
/>

<Textarea
  label="Mensagem"
  rows={4}
  placeholder="Digite sua mensagem"
  required
/>
```

---

## 📄 Páginas

### Landing Page (`/landing`)
Página institucional completa com:

**Seções:**
1. **Hero** - Chamada principal com CTAs
2. **Features** - Grade com 6 recursos principais
3. **Gallery** - Showcase de imagens
4. **Pricing** - 3 planos com preços
5. **Testimonials** - Depoimentos de clientes
6. **CTA Final** - Última chamada para ação
7. **Footer** - Informações completas

**Acesso:** `http://localhost:5173/landing`

---

### PublicBooking (`/agendar/:domain`)
Página de agendamento público totalmente reformulada.

**Features:**
- Hero personalizado com branding do tenant
- Processo em 4 etapas com progresso visual
- Seleção de serviços com cards animados
- Escolha de profissional (opcional)
- Calendário de datas
- Grade de horários disponíveis
- Formulário de dados do cliente
- Resumo completo do agendamento
- Footer com informações de contato

**Acesso:** `http://localhost:5173/agendar/meu-dominio`

---

### Dashboard (`/`)
Painel administrativo com sidebar moderna.

**Features:**
- Navegação lateral animada
- Menu mobile responsivo
- Avatar com gradiente
- Dark mode toggle
- Estados ativos destacados
- Logout estilizado

---

## 🎬 Animações

### Keyframes Disponíveis

**1. Blob** - Movimento orgânico
```css
.animate-blob
```

**2. Float** - Flutuação suave
```css
.animate-float
```

**3. Slide In** - Entrada deslizante
```css
.animate-slide-in-left
.animate-slide-in-right
.animate-slide-in-up
```

**4. Fade In** - Fade suave
```css
.animate-fade-in
```

**5. Scale In** - Zoom de entrada
```css
.animate-scale-in
```

**6. Pulse** - Pulsação lenta
```css
.animate-pulse-slow
```

**7. Shimmer** - Brilho deslizante
```css
.animate-shimmer
```

**8. Bounce** - Bounce sutil
```css
.animate-bounce-subtle
```

### Animation Delays
```css
.animation-delay-200  /* 0.2s */
.animation-delay-400  /* 0.4s */
.animation-delay-600  /* 0.6s */
.animation-delay-800  /* 0.8s */
.animation-delay-1000 /* 1s */
.animation-delay-2000 /* 2s */
.animation-delay-4000 /* 4s */
```

### Utility Classes

**Hover Effects:**
```css
.hover-lift       /* Eleva no hover */
.hover-glow       /* Brilho no hover */
```

**Glass Effects:**
```css
.glass            /* Glassmorphism claro */
.glass-dark       /* Glassmorphism escuro */
```

**Gradient Text:**
```css
.gradient-text    /* Texto com gradiente */
```

---

## 🌓 Dark Mode

### Como Ativar

**Manualmente:**
```tsx
import ThemeToggle from '@/components/ui/ThemeToggle'

<ThemeToggle />
```

**Programaticamente:**
```tsx
// Ativar dark mode
document.documentElement.classList.add('dark')
localStorage.setItem('theme', 'dark')

// Desativar dark mode
document.documentElement.classList.remove('dark')
localStorage.setItem('theme', 'light')
```

### Classes Dark Mode

Todos os componentes suportam dark mode:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Conteúdo com suporte a dark mode
</div>
```

### Componentes com Dark Mode

- ✅ Button
- ✅ Card
- ✅ Badge
- ✅ Input / Textarea
- ✅ Hero
- ✅ Gallery
- ✅ Testimonials
- ✅ Footer
- ✅ Layout
- ✅ ThemeToggle

---

## 🎯 Como Usar

### 1. Instalação

```bash
cd frontend
npm install
npm run dev
```

### 2. Páginas Disponíveis

```
Landing Page:        http://localhost:5173/landing
Login:               http://localhost:5173/login
Dashboard:           http://localhost:5173/
Agendamento Público: http://localhost:5173/agendar/:domain
```

### 3. Componentes

Importe os componentes necessários:

```tsx
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Hero from '@/components/ui/Hero'
import Gallery from '@/components/ui/Gallery'
import Testimonials from '@/components/ui/Testimonials'
import Footer from '@/components/ui/Footer'
import ThemeToggle from '@/components/ui/ThemeToggle'
```

### 4. Animações

Use classes de animação diretamente:

```tsx
<div className="animate-slide-in-up animation-delay-200">
  Conteúdo animado
</div>
```

### 5. Dark Mode

Adicione o toggle em qualquer lugar:

```tsx
<ThemeToggle className="fixed top-4 right-4 z-50" />
```

---

## 🎨 Customização

### Cores

Edite `frontend/tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: 'hsl(221.2 83.2% 53.3%)',
      // ... outras cores
    }
  }
}
```

### Animações

Adicione novas animações em `frontend/src/index.css`:

```css
@keyframes minhaAnimacao {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-minha {
  animation: minhaAnimacao 0.3s ease-out;
}
```

---

## 📱 Responsividade

Todos os componentes são responsivos por padrão:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Use breakpoints do Tailwind:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Grade responsiva */}
</div>
```

---

## 🔥 Performance

### Otimizações Implementadas

- ✅ Lazy loading de imagens
- ✅ Code splitting automático (Vite)
- ✅ Animações com GPU
- ✅ Debounce em inputs
- ✅ Memoização de componentes pesados
- ✅ Compressão de assets
- ✅ Tree shaking

---

## 🐛 Troubleshooting

### Animações não funcionam

Verifique se o Tailwind está configurado:

```js
// tailwind.config.js
plugins: [require("tailwindcss-animate")]
```

### Dark mode não persiste

Verifique o localStorage:

```js
console.log(localStorage.getItem('theme'))
```

### Imagens não carregam

Verifique o CORS no backend e URLs das imagens.

---

## 📚 Recursos Adicionais

- [Tailwind CSS Docs](https://tailwindcss.com/)
- [React Router Docs](https://reactrouter.com/)
- [Lucide Icons](https://lucide.dev/)
- [TanStack Query](https://tanstack.com/query/)

---

## 🎉 Conclusão

Sistema completo com design moderno, animações suaves, dark mode e componentes reutilizáveis. Pronto para produção e fácil de customizar!

**Criado com ❤️ usando React, TypeScript, Tailwind CSS e Laravel**
