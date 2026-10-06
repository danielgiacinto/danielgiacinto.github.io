import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { SkillsComponent } from './components/skills/skills.component';
import { EducationComponent } from './components/education/education.component';
import { ScrollAnimationDirective } from './directives/scroll-animation.directive';
import { EnfoqueScrollDirective } from './directives/enfoque-scroll.directive';
import { TextoHoverDirective } from './directives/texto-hover.directive';
import { TextoParticulasComponent } from './components/texto-particulas/texto-particulas.component';
import { CursorPersonalizadoComponent } from './components/cursor-personalizado/cursor-personalizado.component';

@NgModule({
  declarations: [
    AppComponent,
    ExperienceComponent,
    ProjectsComponent,
    SkillsComponent,
    EducationComponent,
    ScrollAnimationDirective,
    EnfoqueScrollDirective,
    TextoHoverDirective,
    TextoParticulasComponent,
    CursorPersonalizadoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
