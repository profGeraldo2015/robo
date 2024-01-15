function toaqui (param) {
  console.log(param);
}

function changeData() {

  // Criando um novo objeto de data
  const data = new Date();

  // Obtendo o dia, mês e ano
  const dia = data.getDate();
  const mes = data.getMonth() + 1; // Adicione +1 porque os meses começam do zero (janeiro é 0)
  const ano = data.getFullYear();

  // Obtendo a hora, minuto e segundo
  const hora = data.getHours();
  const minuto = data.getMinutes();
  const segundo = data.getSeconds();

  // Formatando para o formato dia-mês-ano hora:minuto:segundo
  //const dataFormatada = `${dia}-${mes}-${ano} ${hora}:${minuto}:${segundo}`;
  const dataFormatada =
  {
    data: `${ano}-${mes}-${dia}`,
    hora: `${hora}:${minuto}:${segundo}`
  };

  console.log('data dentro da funcao ',dataFormatada);

  return dataFormatada; // Exibe a data formatada com hora


}
module.exports = changeData;

function checkIfIsRedCandle(candleObj) {
  let close = parseFloat(candleObj.close);
  let open = parseFloat(candleObj.open);
  if (close < open) {
    return true;
  }

  return true;
}
module.exports = checkIfIsRedCandle;

function engolfandoAlta(candles) {
/*
  if (
    checkIfIsRedCandle(candles[candles.length - 2]) &&
    !checkIfIsRedCandle(candles[candles.length - 1]) &&
    parseFloat(candles[candles.length - 1].open) <=
    parseFloat(candles[candles.length - 2].close) &&
    parseFloat(candles[candles.length - 1].close) >
    parseFloat(candles[candles.length - 2].open)

  ) {
    return true;
  }*/
  return false;
}
module.exports = engolfandoAlta;