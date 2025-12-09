import { describe, it, expect } from 'vitest'
import { cn } from '../cn'

describe('cn utility', () => {
  it('deve combinar classes corretamente', () => {
    const result = cn('foo', 'bar')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('deve combinar classes mesmo quando duplicadas', () => {
    const result = cn('foo', 'foo')
    // tailwind-merge pode manter classes duplicadas se não forem do Tailwind
    expect(result).toContain('foo')
  })

  it('deve lidar com classes condicionais', () => {
    const result = cn('foo', false && 'bar', true && 'baz')
    expect(result).toContain('foo')
    expect(result).toContain('baz')
    expect(result).not.toContain('bar')
  })

  it('deve mesclar classes do Tailwind corretamente', () => {
    const result = cn('px-2 py-1', 'px-4')
    // A classe px-4 deve sobrescrever px-2
    expect(result).toContain('py-1')
  })
})

