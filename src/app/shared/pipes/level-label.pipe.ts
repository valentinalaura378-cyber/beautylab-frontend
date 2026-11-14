import { Pipe, PipeTransform } from '@angular/core';
import { LEVEL_LABELS } from '../../core/labels';
import { Level } from '../../core/models';

@Pipe({ name: 'levelLabel' })
export class LevelLabelPipe implements PipeTransform {
  transform(level: Level | string | undefined | null): string {
    if (!level) return '';
    return LEVEL_LABELS[level as Level] ?? level;
  }
}
