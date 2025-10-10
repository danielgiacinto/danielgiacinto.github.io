import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit, AfterViewInit {
  constructor(private el: ElementRef) { }

  ngOnInit() {}

  ngAfterViewInit() {
    const cards = this.el.nativeElement.querySelectorAll('.efecto-habilidad');
    cards.forEach((card: HTMLElement) => {
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tracker = card.querySelector('.tracker-border') as HTMLElement;
        if (tracker) {
          tracker.style.setProperty('--x', `${x}px`);
          tracker.style.setProperty('--y', `${y}px`);
        }
      });
      card.addEventListener('mouseleave', () => {
        const tracker = card.querySelector('.tracker-border') as HTMLElement;
        if (tracker) {
          tracker.style.setProperty('--x', `50%`);
          tracker.style.setProperty('--y', `50%`);
        }
      });
    });
}
}
