<? if (!empty($periodos)): ?>
    <label class="esquerdaAlinhado maior" for="periodo">Selecione o per�odo</label>
    <select id="periodo" name="periodo">
    <? foreach ($periodos as $periodo): ?>
        <option value="<?=$periodo['mes']?>/<?=$periodo['ano']?>"><?=$periodo['mes']?>/<?=$periodo['ano']?></option>
    <? endforeach; ?>
    </select> <br/>

    <button class="semRotuloEsquerda maior">Exibir</button>
<? else: ?>
    <fieldset class="fieldInfo">Nenhum per�odo dispon�vel para esse �rg�o.</fieldset>
<? endif; ?>
