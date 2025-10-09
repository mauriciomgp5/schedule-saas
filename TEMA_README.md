# Sistema de Tema Escuro/Claro

Este documento explica como funciona o sistema de temas implementado no sistema de agendamento.

## 🌙 Funcionalidades Implementadas

### ✅ **Sistema Completo de Temas**

1. **Contexto de Tema**: Gerenciamento global do estado do tema
2. **Persistência**: Tema salvo no localStorage
3. **Preferência do Sistema**: Detecta automaticamente a preferência do usuário
4. **Toggle Suave**: Transições suaves entre temas
5. **Aplicação Global**: Todas as páginas suportam tema escuro/claro

## 🎨 **Como Funciona**

### **1. Contexto de Tema (`ThemeContext`)**
- Gerencia o estado global do tema (light/dark)
- Salva preferência no localStorage
- Detecta preferência do sistema operacional
- Evita problemas de hidratação

### **2. Hook `useTheme`**
- Fornece acesso ao tema atual
- Função `toggleTheme()` para alternar
- Função `setTheme()` para definir tema específico

### **3. Componente `ThemeToggle`**
- Botão com ícones de sol/lua
- Animação suave entre temas
- Acessibilidade (aria-label)
- Hover states

## 🚀 **Implementação**

### **Arquivos Criados/Modificados:**

```
frontend/src/
├── contexts/
│   └── ThemeContext.tsx          # Contexto de tema
├── components/
│   └── ThemeToggle.tsx           # Botão de toggle
└── app/
    ├── layout.tsx                # Provider de tema
    ├── page.tsx                  # Toggle na página de login
    ├── dashboard/
    │   ├── page.tsx              # Toggle no dashboard
    │   ├── configuracoes/page.tsx # Toggle nas configurações
    │   └── horarios/page.tsx     # Toggle nos horários
    ├── lojas/page.tsx            # Toggle na página de lojas
    └── [slug]/customer/
        ├── page.tsx              # Toggle na página da loja
        └── agendar/[serviceId]/page.tsx # Toggle no agendamento
```

## 🎯 **Classes CSS Utilizadas**

### **Backgrounds:**
- `bg-white dark:bg-gray-800` - Cards e containers
- `bg-gray-50 dark:bg-gray-900` - Backgrounds secundários
- `from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800` - Gradientes

### **Textos:**
- `text-gray-900 dark:text-white` - Textos principais
- `text-gray-600 dark:text-gray-400` - Textos secundários
- `text-gray-500 dark:text-gray-400` - Textos terciários

### **Bordas:**
- `border-gray-300 dark:border-gray-600` - Bordas padrão
- `border-gray-200 dark:border-gray-700` - Bordas sutis

### **Estados:**
- `hover:bg-gray-100 dark:hover:bg-gray-700` - Hover states
- `focus:ring-blue-500` - Focus states (mantém cor)

## 🔧 **Como Usar**

### **1. Em Componentes:**
```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MeuComponente() {
  const { theme, toggleTheme, setTheme } = useTheme()
  
  return (
    <div className="bg-white dark:bg-gray-800">
      <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  )
}
```

### **2. Adicionando Toggle:**
```tsx
import { ThemeToggle } from '@/components/ThemeToggle'

function MinhaPagina() {
  return (
    <div>
      <header>
        <ThemeToggle />
      </header>
    </div>
  )
}
```

### **3. Classes de Tema:**
```tsx
// Sempre use as classes dark: para tema escuro
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <h1 className="text-2xl font-bold">Título</h1>
  <p className="text-gray-600 dark:text-gray-400">Descrição</p>
</div>
```

## 📱 **Posicionamento dos Toggles**

### **Páginas Públicas:**
- **Posição**: `fixed top-4 right-4 z-50`
- **Páginas**: Login, Lojas, Páginas do Cliente

### **Dashboard:**
- **Posição**: No header, ao lado do botão "Sair"
- **Páginas**: Dashboard, Configurações, Horários

## 🎨 **Cores do Tema Escuro**

### **Paleta de Cores:**
- **Background Principal**: `gray-900`
- **Background Secundário**: `gray-800`
- **Background Terciário**: `gray-700`
- **Texto Principal**: `white`
- **Texto Secundário**: `gray-400`
- **Texto Terciário**: `gray-500`
- **Bordas**: `gray-600`, `gray-700`

## 🔄 **Transições**

- **Duração**: `duration-200` (200ms)
- **Propriedades**: `transition-colors`
- **Estados**: Hover, focus, active

## 💾 **Persistência**

- **LocalStorage**: Chave `theme`
- **Valores**: `'light'` ou `'dark'`
- **Fallback**: Preferência do sistema
- **Inicialização**: Detecta preferência na primeira visita

## 🚀 **Como Testar**

1. **Acesse qualquer página** do sistema
2. **Clique no botão de tema** (sol/lua)
3. **Veja a transição** suave entre temas
4. **Recarregue a página** - tema é mantido
5. **Teste em diferentes páginas** - tema é consistente

## 🎯 **URLs para Testar**

```
http://localhost:3000/                    # Login com toggle
http://localhost:3000/lojas               # Lojas com toggle
http://localhost:3000/dashboard           # Dashboard com toggle
http://localhost:3000/illo-cumque-consecte/customer  # Cliente com toggle
```

O sistema de temas está completamente funcional e aplicado em todas as páginas! 🌙☀️
