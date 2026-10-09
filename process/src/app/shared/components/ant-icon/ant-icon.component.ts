import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const SVG_ICONS: Record<string, string> = {
  'plus': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"/><path d="M160 482h704q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8z"/></svg>',
  'edit': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.6 9.6 0 0 0 0-13.6L681.4 102a9.6 9.6 0 0 0-13.6 0L243.9 525.8c-1.5 1.5-2.4 3.3-2.8 5.3L211.9 699c-1.2 6.6 4.3 12.5 10.9 12.5 2.1 0 4.1-.3 6.1-.8l28.8-5.7z"/></svg>',
  'delete': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M360 180h304q8 0 8 8v52H352v-52q0-8 8-8zm496 60H168q-8 0-8 8v40q0 8 8 8h56v540q0 33 23.5 56.5T304 916h416q33 0 56.5-23.5T800 836V296h56q8 0 8-8v-40q0-8-8-8z"/></svg>',
  'copy': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M720 160H232q-33 0-56.5 23.5T152 240v552q0 8 8 8h60q8 0 8-8V240q0-8 8-8h484q8 0 8-8v-60q0-8-8-8zm152 168H376q-33 0-56.5 23.5T296 408v480q0 33 23.5 56.5T376 968h496q33 0 56.5-23.5T952 888V408q0-33-23.5-56.5T872 328z"/></svg>',
  'search': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M909.6 854.5L649.9 594.8C690.2 537.8 714 468.5 714 394 714 217.3 570.7 74 394 74S74 217.3 74 394s143.3 320 320 320c74.5 0 143.8-23.8 200.8-64.1l259.7 259.7a8.2 8.2 0 0 0 11.6 0l43.5-43.5c3.2-3.2 3.2-8.4 0-11.6zM394 628c-129.2 0-234-104.8-234-234s104.8-234 234-234 234 104.8 234 234-104.8 234-234 234z"/></svg>',
  'reload': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M756.2 316.4C690.4 242 595.6 196 490 196c-175.7 0-322.4 121.2-359.8 284.1-1.8 7.9 3.8 15.5 11.9 15.5h67.5c6.3 0 11.6-4.6 12.6-10.9 33.7-133 153.2-232.7 267.8-232.7 87.8 0 166.4 39.4 219.7 101.4L640 452h272V180l-155.8 136.4z"/></svg>',
  'close': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M799.86 166.31l-48.4-47.9-239.5 237.2-239.4-237.2-48.4 47.9 239.4 237.2-239.4 237.3 48.4 47.9 239.4-237.3 239.5 237.3 48.4-47.9-239.5-237.3z"/></svg>',
  'down': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"/></svg>',
  'user': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64c-176.7 0-320 143.3-320 320 0 17.7 14.3 32 32 32h576c17.7 0 32-14.3 32-32 0-176.7-143.3-320-320-320z"/></svg>',
  'setting': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.7s-1.6-38.8-4.7-57.7l65.5-56a32 32 0 0 0 9.3-35.2l-64-154.5a32 32 0 0 0-31.5-19.5l-84.3 11.2c-29.6-22.3-62.8-39.7-98.8-51.5l-23.7-82a32 32 0 0 0-30.8-23.8H423.4a32 32 0 0 0-30.8 23.8l-23.7 82c-36 11.8-69.2 29.2-98.8 51.5l-84.3-11.2a32 32 0 0 0-31.5 19.5l-64 154.5a32 32 0 0 0 9.3 35.2l65.5 56c-3.1 19-4.7 38.4-4.7 57.7s1.6 38.8 4.7 57.7l-65.5 56a32 32 0 0 0-9.3 35.2l64 154.5a32 32 0 0 0 31.5 19.5l84.3-11.2c29.6 22.3 62.8 39.7 98.8 51.5l23.7 82a32 32 0 0 0 30.8 23.8h177.2a32 32 0 0 0 30.8-23.8l23.7-82c36-11.8 69.2-29.2 98.8-51.5l84.3 11.2a32 32 0 0 0 31.5-19.5l64-154.5a32 32 0 0 0-9.3-35.2zM512 672a160 160 0 1 1 0-320 160 160 0 0 1 0 320z"/></svg>',
  'check': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M878.3 166.3L371.1 673.5 145.7 448.1a8 8 0 0 0-11.3 0l-45.3 45.3a8 8 0 0 0 0 11.3l276.7 276.7a8 8 0 0 0 11.3 0l546.5-546.5a8 8 0 0 0 0-11.3l-45.3-45.3a8 8 0 0 0-11.3 0z"/></svg>',
  'filter': '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M880.1 154H143.9c-24.5 0-39.8 26.7-27.5 48L349 607.4V838c0 17.7 14.2 32 31.8 32h162.4c17.6 0 31.8-14.3 31.8-32V607.4L807.6 202c12.3-21.3-3-48-27.5-48z"/></svg>'
};

@Component({
  selector: 'ant-icon',
  templateUrl: './ant-icon.component.html',
  styleUrls: ['./ant-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AntIconComponent implements OnInit, OnChanges {
  @Input() name: string = '';
  @Input() theme: 'outline' | 'fill' = 'outline';
  @Input() size?: number | string;
  @Input() color?: string;
  @Input() spin: boolean = false;
  @Input() rotate?: number;

  trustedSvg: SafeHtml | null = null;
  parsedSize: string | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.updateSvg();
    this.updateSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name'] || changes['theme']) {
      this.updateSvg();
    }
    if (changes['size']) {
      this.updateSize();
    }
  }

  private updateSize(): void {
    if (this.size == null) {
      this.parsedSize = null;
    } else if (typeof this.size === 'number') {
      this.parsedSize = `${this.size}px`;
    } else {
      this.parsedSize = this.size.endsWith('px') || this.size.endsWith('rem') || this.size.endsWith('em')
        ? this.size
        : `${this.size}px`;
    }
  }

  private updateSvg(): void {
    if (!this.name) {
      this.trustedSvg = null;
      return;
    }

    const key = this.name.trim().toLowerCase().replace(/-o$/, '').replace(/-outline$/, '');
    const svgStr = SVG_ICONS[key] || `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>`;
    this.trustedSvg = this.sanitizer.bypassSecurityTrustHtml(svgStr);
  }
}
