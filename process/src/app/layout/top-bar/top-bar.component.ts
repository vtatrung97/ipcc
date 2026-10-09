import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  userName: string = 'Leo Nguyen';
  unreadNotifications: number = 5;
  userStatus: 'online' | 'offline' | 'busy' = 'online';

  constructor() {}

  ngOnInit(): void {}

  onToggle(): void {
    this.toggleCollapse.emit();
  }
}
