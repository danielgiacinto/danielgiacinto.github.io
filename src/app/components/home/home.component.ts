import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  title = ''; 
  fullTitle = "Daniel Giacinto."; 
  typingSpeed = 200;
  roles = ["Full Stack Developer", "Java Developer", "Angular Developer", ".NET Core Developer"];
  currentRoleIndex = 0; 
  currentRole = this.roles[this.currentRoleIndex]; 
  changeInterval = 3000; 
  fadeIn = true;

  constructor() { }

  ngOnInit() {
    this.typeText();
    this.loopRoles();
  }

  typeText() {
    let i = 0;
    const interval = setInterval(() => {
      if (i < this.fullTitle.length) {
        this.title += this.fullTitle[i];
        i++;
      } else {
        clearInterval(interval); // Detenemos el intervalo al completar el texto
      }
    }, this.typingSpeed);
  }

  loopRoles() {
    setInterval(() => {
      this.fadeIn = false; // Desactiva el fade-in temporalmente
      setTimeout(() => {
        // Cambia el rol y vuelve a activar el fade-in
        this.currentRoleIndex = (this.currentRoleIndex + 1) % this.roles.length;
        this.currentRole = this.roles[this.currentRoleIndex];
        this.fadeIn = true;
      }, 500); // Espera 500 ms para reiniciar el efecto de fade-in
    }, this.changeInterval);
  }
}
