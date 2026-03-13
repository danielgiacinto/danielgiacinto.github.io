import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  currentProjectIndex = 0;
  totalProjects = 2;
  projectIndices = [0, 1];
  touchStartX = 0;
  touchEndX = 0;
  mouseStartX = 0;
  isDragging = false;

  constructor() { }

  ngOnInit() {
  }

  goToProject(index: number) {
    if (index >= 0 && index < this.totalProjects) {
      this.currentProjectIndex = index;
    }
  }

  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].screenX;
  }

  onTouchEnd(e: TouchEvent) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe(this.touchStartX - this.touchEndX);
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.mouseStartX = e.clientX;
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    const diff = this.mouseStartX - e.clientX;
    if (Math.abs(diff) > 80) {
      if (diff > 0) {
        this.goToProject(this.currentProjectIndex + 1);
      } else {
        this.goToProject(this.currentProjectIndex - 1);
      }
      this.isDragging = false;
    }
  }

  onMouseUp(e: MouseEvent) {
    if (this.isDragging) {
      const diff = this.mouseStartX - e.clientX;
      this.handleSwipe(diff);
      this.isDragging = false;
    }
  }

  onMouseLeave() {
    if (this.isDragging) this.isDragging = false;
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(e: MouseEvent) {
    if (this.isDragging) this.onMouseMove(e);
  }

  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(e: MouseEvent) {
    if (this.isDragging) {
      this.onMouseUp(e);
    }
  }

  handleSwipe(diff: number) {
    const swipeThreshold = 50;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.goToProject(this.currentProjectIndex + 1);
      } else {
        this.goToProject(this.currentProjectIndex - 1);
      }
    }
  }

  nextProject() {
    this.goToProject(this.currentProjectIndex + 1);
  }

  prevProject() {
    this.goToProject(this.currentProjectIndex - 1);
  }
}
