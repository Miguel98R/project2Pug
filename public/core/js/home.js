$(document).ready(function (){


    $('#save_directories').click(function () {

        let in_directori = $('#inputOriginDir').val()
        let out_directori = $('#inputOutDir').val()

        if(in_directori == '' || in_directori == undefined){
            notyf.open({type: "warning", message: "Ingrese el directorio de entrada"});
            return
        }
        if(out_directori == '' || out_directori == undefined){
            notyf.open({type: "warning", message: "Ingrese el directorio de salida"});
            return

        }

        $.post('/api/convert/', {in_directori,out_directori}, function (response) {

            notyf.success(response.message)



        })

        setTimeout(function () {
            $.post('/api/mover_convertidos/', {in_directori,out_directori}, function (response) {

                notyf.success(response.message)

            })


        }, 1400)







    })









})