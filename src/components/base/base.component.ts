import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../services/translation.service';

@Component({
  template: ''
})
export abstract class BaseComponent implements OnDestroy {
  protected destroy$ = new Subject<void>();

  constructor(public translationService: TranslationService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected takeUntilDestroy<T>() {
    return takeUntil<T>(this.destroy$);
  }

  protected translate(key: string): string {
    return this.translationService.translate(key);
  }

  protected switchLanguage(): void {
    this.translationService.switchLanguage();
  }
}
