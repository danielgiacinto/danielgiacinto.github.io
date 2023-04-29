let menuVisible = false;
//Funcion que oculta o muestra el menu
function mostrarOcultarMenu(){
    if(menuVisible){
        document.getElementById("nav").classList ="";
        menuVisible = false;
    }
    else{
        document.getElementById("nav").classList = "responsive";
        menuVisible = true;
    }
}

function seleccionar(){
    // ocultar el menu cuando apreto una opcion
    document.getElementById("nav").classList = "";
    menuVisible = false;
}




// detecto el scrolling para aplicar la animacion
window.onscroll = function(){
    efectoHabilidades();
} 

// funcino que aplica las animaciones de skills
function efectoHabilidades(){
    var skills = document.getElementById("habilidades");
    var distancia_skills = window.innerHeight - skills.getBoundingClientRect().top;
    if(distancia_skills >= 300){
        let habilidades = document.getElementsByClassName("progreso");
        habilidades[0].classList.add("HTML");
        habilidades[1].classList.add("CSS");
        habilidades[2].classList.add("JavaScript");
        habilidades[3].classList.add("Csharp");
        habilidades[4].classList.add("SQLServer");
        habilidades[5].classList.add("Net");
        habilidades[6].classList.add("Git");
        habilidades[7].classList.add("python");
        habilidades[8].classList.add("photoshop");
        habilidades[9].classList.add("java");
    }
}

function verCv(){
    window.open("/doc/CV_Giacinto, Daniel.pdf", "_blank")
}

