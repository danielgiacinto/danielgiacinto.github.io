<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST["nombre"];
    $email = $_POST["email"];
    $mensaje = $_POST["texto"];

    $destinatario = "danielgiacinto@gmail.com"; // Cambia esto por la dirección deseada
    $asunto = "Nuevo mensaje desde el formulario de contacto";

    $cabeceras = "From: $email";

    if (mail($destinatario, $asunto, $mensaje, $cabeceras)) {
        echo json_encode(array("status" => "success"));
    } else {
        echo json_encode(array("status" => "error"));
    }
}
?>
