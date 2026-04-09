import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountUp } from './useCountUp';

describe('useCountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('empieza en 0', () => {
    const { result } = renderHook(() => useCountUp(100));
    // En el primer render, antes de que la animación avance
    expect(result.current).toBe(0);
  });

  it('llega al valor objetivo después de la duración', async () => {
    const { result } = renderHook(() => useCountUp(50, 500));

    // Avanzar todos los frames de animación
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current).toBe(50);
  });

  it('se actualiza cuando cambia el target', async () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCountUp(target, 500),
      { initialProps: { target: 100 } },
    );

    // Completar primera animación
    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toBe(100);

    // Cambiar target
    rerender({ target: 200 });

    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toBe(200);
  });
});
