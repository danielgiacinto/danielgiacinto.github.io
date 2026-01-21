import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css']
})
export class ExperienceComponent implements OnInit {
  expandedExperiences: { [key: string]: boolean } = {};

  constructor() { }

  ngOnInit() {
  }

  toggleExperience(experienceId: string) {
    this.expandedExperiences[experienceId] = !this.expandedExperiences[experienceId];
  }

  isExpanded(experienceId: string): boolean {
    return this.expandedExperiences[experienceId] || false;
  }

  // Arrays de items para cada experiencia
  cuosItems = [
    'Desarrollo y mantenimiento de aplicaciones web utilizando <b>.NET</b>, <b>C#</b>, <b>Angular</b>, <b>Vue.js</b>, <b>SQL</b>, entre otros, Corrigiendo errores y creando nuevos componentes y funcionalidades.',
    'Gestión y manejo de Consultas SQL, Triggers y Procedures en bases de datos con <b>ORACLE</b>.',
    'Consumo y manejo de <b>APIs</b> RESTful, realizando pruebas y validaciones con <b>Postman</b>.',
    'Desarrollo de varios proyectos en simultaneo con diferentes lenguajes y frameworks.'
  ];

  epamItems = [
    'Gestioné implementaciones en entornos de prueba y producción.',
    'Diseñé y ejecuté casos de prueba utilizando Jira.',
    'Realicé pruebas exhaustivas probando funcionalidades en bases de datos.',
    'Documenté evidencias y hallazgos en Confluence.',
    'Ejecuté procesos automatizados a través de Jenkins.',
    'Realicé controles de posproducción para garantizar la estabilidad del sistema.',
    'Gestioné bases de datos, definí y ejecuté consultas en SQL.',
    'Analicé y resolví errores de código de manera eficiente.',
    'Realicé migración de procesos en el lenguaje Java y usé Bitbucket como control de versiones.',
    'Utilicé Postman para verificar las respuestas de la API.'
  ];

  vatesItems = [
    'Diseñé y desarrollé soluciones de software utilizando C# .NET 7.0.',
    'Utilicé Entity Framework para mapear objetos a tablas de bases de datos y realizar operaciones.',
    'Implementé servicios RESTful utilizando ASP.NET Core y Swagger para documentar la API.',
    'Utilicé LINQ para optimizar las consultas y manipular los datos de manera eficiente.',
    'Establecí y mantuve conexiones de bases de datos con SQL Server.',
    'Utilicé Git para controlar versiones y colaborar con otros desarrolladores.',
    'Implementé Entity Framework utilizando los enfoques Database First y Code First para el modelado y acceso de datos.',
    'Utilicé Postman para verificar las respuestas de la API.',
    'Hice uso del patrón de diseño CQRS para la segregación de responsabilidades y un código más eficiente.'
  ];

  totiItems = [
    'Diseño y creación de flyers para sus redes sociales, promocionando su marca y sus productos.',
    'Usé herramientas como Photoshop y Canva para las publicaciones.'
  ];

  baioccoItems = [
    'Tareas de mantenimiento, limpieza, instalación de programas y optimización de software en diversos dispositivos electrónicos.',
    'Prestación de servicios a domicilio y atención al cliente.'
  ];
}
