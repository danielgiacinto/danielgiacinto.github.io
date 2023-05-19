function limpiarCampos(){
    document.getElementById('nombre').value = "";
    document.getElementById('correo').value = "";
    document.getElementById('asunto').value = "";
    document.getElementById('mensaje').value = "";

}

// Validar con Jquery el formulario
$(document).ready(function(){
    $("#validar").validate({
        rules: {
            nombre: {
                required: true,
                minlength: 2
            },
            correo: {
                required: true,
                email: true
            },
            asunto: {
                required: true
            },
            mensaje: {
                required: true,
                minlength: 2
            },
        },
    
        errorClass: "is-invalid",
        validClass: "is-valid",
    
        submitHandler: function(form) {
            Swal.fire({
                icon: 'success',
                title: 'Exito',
                text: 'Datos enviados correctamente',
                timer: 2000
            })
            
            limpiarCampos();
        }
       });
})

// Para traducir las validaciones

jQuery.extend(jQuery.validator.messages, {
    required: "Este campo es obligatorio.",
    remote: "Por favor, rellena este campo.",
    email: "Por favor, escribe una dirección de correo válida",
    url: "Por favor, escribe una URL válida.",
    date: "Por favor, escribe una fecha válida.",
    dateISO: "Por favor, escribe una fecha (ISO) válida.",
    number: "Por favor, escribe un número entero válido.",
    digits: "Por favor, escribe sólo dígitos.",
    creditcard: "Por favor, escribe un número de tarjeta válido.",
    equalTo: "Por favor, escribe el mismo valor de nuevo.",
    accept: "Por favor, escribe un valor con una extensión aceptada.",
    maxlength: jQuery.validator.format("Por favor, no escribas más de {0} caracteres."),
    minlength: jQuery.validator.format("Por favor, no escribas menos de {0} caracteres."),
    rangelength: jQuery.validator.format("Por favor, escribe un valor entre {0} y {1} caracteres."),
    range: jQuery.validator.format("Por favor, escribe un valor entre {0} y {1}."),
    max: jQuery.validator.format("Por favor, escribe un valor menor o igual a {0}."),
    min: jQuery.validator.format("Por favor, escribe un valor mayor o igual a {0}.")
  });




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

