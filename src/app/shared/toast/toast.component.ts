import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent implements OnInit {

  readonly toastService = inject(ToastService);
  private readonly el   = inject(ElementRef<HTMLElement>);

  ngOnInit() {
    document.body.appendChild(this.el.nativeElement);
  }
}