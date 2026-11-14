import { LevelLabelPipe } from './level-label.pipe';

describe('LevelLabelPipe', () => {
  const pipe = new LevelLabelPipe();

  it('traduce los niveles a español', () => {
    expect(pipe.transform('beginner')).toBe('Principiante');
    expect(pipe.transform('intermediate')).toBe('Intermedio');
    expect(pipe.transform('advanced')).toBe('Avanzado');
  });

  it('devuelve vacío si no hay nivel', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
