
$(document).ready(function() {
    $("#divPedido").dialog({title: "Pedido de ajuste", width: 650, height: 350, autoOpen:false, modal:true});
    if ($("#nrPonto").val() != '') {
        // se � corre��o de registro, n�o mostra abono e per�odo
        $("label[for=tipoA]").hide();
        $("#tipoA").hide();
        $("label[for=tipoP]").hide();
        $("#tipoP").hide();
        $("#divPedido").dialog('open');
        if ($("#nrPonto").val() == 0) {
            var aux = $("#tipoEDataAjuste").val().split("|");
            $("#tipo"+aux[0]).prop('checked', true);
            $("#data").val(aux[1]);
            $("#hora").focus();
        }
        else {
            $("#justificativa").focus();
        }
    }
    
    $("input[name=tipo]").change(function() {
        var tipo = $("input[name=tipo]:checked").val();
        $("#divHoraSaida").slideUp();
        $("#divHorasAbono").slideUp();
        $("#lblHora").html("Hora:");
        $(".opt_A").show();
        $(".opt_T").hide();
        $(".opt_P").hide();
        if (tipo == "P") {
            $("#divHoraSaida").slideDown();
            $("#lblHora").html("Hora de Entrada:");
            $(".opt_A").hide();
            $(".opt_T").hide();
            $(".opt_P").show();
        }
        else if (tipo == "A") {
            $("#lblHora").html("Tempo a abonar:");
            $(".opt_A").hide();
            $(".opt_P").hide();
            $(".opt_T").show();
        }
    });
    
    $("#data").datepicker({dateFormat:"dd/mm/yy", maxDate: 0});
    $("#data").mask("99/99/9999");
    $("#hora").mask("99:99");
    $("#horaSaida").mask("99:99");
    
    $("#selVinculo").change(function() {
        if ($(this).val() != '') {
            window.location = HOME + 'ajuste/pedido/?v='+$(this).val();
        }
    });
});

function novoAjuste() {
    $("#divPedido input[type=text]").val('');
    $("#divPedido select").val('');
    $("#divPedido input[type=radio]").prop('checked', false);
    $("label[for=tipoA]").show();
    $("#tipoA").show();
    $("label[for=tipoP]").show();
    $("#tipoP").show();
    $("#divPedido").dialog('open');
}

function verificaJustificativa(val) {
    $("#divOutraJustificativa").slideUp();
    if (val == "o") {
        $("#divOutraJustificativa").slideDown();
    }
}

function enviaSolicitacao() {
    var msg = "";
    if ($("input[name=tipo]:checked").val() == undefined) {
        msg += "Selecione o tipo de ajuste. <br/>";
    } 
    if ($("#data").val() == "") {
        msg += "Selecione o dia para o ajuste. <br/>";
    }
    else {
        // testa se � um dia v�lido
        var auxData = $("#data").val().split("/");
        auxData = auxData[2] + "/" + auxData[1] + "/" + auxData[0];
        if (!Date.parse(auxData)) {
            msg += "Escreva um dia v�lido. <br/>";
        }
        else {
            // testa se o dia � maior que o atual
            var hoje = new Date();
            auxData = new Date(auxData);
            if (auxData > hoje) {
                msg += "O ajuste n�o pode ser solicitado para uma data futura. <br/>";
            }
        }
    }
    if ($("#hora").val() == "") {
        msg += "Selecione a hora para o ajuste. <br/>";
    }
    else {
        // testa se � um hor�rio v�lido
        if (!/^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])$/i.test($("#hora").val())) {
            msg += "Escreva um hor�rio v�lido. <br/>";
        }
    }
    if ($("input[name=tipo]:checked").val() == "P") {
        if ($("#horaSaida").val() == "") {
            msg += "Selecione a hora de sa�da para o ajuste. <br/>";
        }
        else if (!/^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])$/i.test($("#horaSaida").val())) {
            msg += "Escreva um hor�rio de sa�da v�lido. <br/>";
        }
    }
    if (($("#justificativa").val() == "") || (($("#justificativa").val() == "o") && $("#outraJustificativa").val() == "")) {
        msg += "Justifique o seu pedido de ajuste. <br/>";
    }
    if (($("#justificativa").val() == "o") && ($("#outraJustificativa").val().length > 2048)) {
        msg += "Digite no m�ximo 2048 caracteres na justificativa (atualmente "+$("#outraJustificativa").val().length+")."
    }
    if ($("#registroAnterior").val() == ($("input[name=tipo]:checked").val()+$("#data").val()+$("#hora").val())) {
        msg += "Voc� n�o alterou o dia e hor�rio para solicitar o ajuste.";
    }
    if (msg != "") {
        $("#mensagens").html(msg).slideDown();
    }
    else {
        var formData = new FormData($('form')[0]);
        $("#botaoEnviar").html('<img src="/Design/visual_ufrgs/smallLoader.gif"/> Enviando...');
        $("progress").css('width', '100%').show();
        $.ajax({
            type: 'POST',
            url: HOME+'/ajuste/enviarPedido',
            dataType: 'JSON',
            xhr: function() {  // Custom XMLHttpRequest
                 var myXhr = $.ajaxSettings.xhr();
                 if(myXhr.upload){ // Check if upload property exists
                     myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // For handling the progress of the upload
                 }
                 return myXhr;
            },
            data: formData,
            //Options to tell jQuery not to process data or worry about content-type.
            cache: false,
            contentType: false,
            processData: false,
            success: function(retorno) {
                $("#botaoEnviar").html(retorno.mensagem);
                if (retorno.mensagem.indexOf("sucesso") != -1) {
                    $("#botaoEnviar").addClass("fieldSucesso").slideDown();
                    setTimeout(function(){window.location=HOME+"ajuste/pedido/"}, 2000);
                }
                else {
                    $("#botaoEnviar").addClass("fieldErro").slideDown();
                    $("#botaoEnviar").append('<input type="button" value="Enviar" onclick="enviaSolicitacao()"/>');
                }
            },
            error: function(retorno) {
                $("#botaoEnviar").addClass("fieldErro");
                $("#botaoEnviar").html(retorno).slideDown();
            }
        });
    }
}

function excluir(nr, tipo) {
    if (confirm("Tem certeza que deseja excluir esse pedido de ajuste?")) {
        $.ajax({
            type: 'POST',
            url: HOME + 'ajuste/excluirPedido',
            data: { nr: nr, tipo: tipo },
            success: function (result) {
                alert(result);
                if (result.indexOf("sucesso") != -1)
                    document.location.reload(true);
            },
            error: function (result) {
                alert(result);
            }
        });
    }
}

function progressHandlingFunction(e){
    if(e.lengthComputable){
        $('progress').attr({value:e.loaded,max:e.total});
    }
}