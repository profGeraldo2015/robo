const axios = require("axios");
const crypto = require("crypto");
const mysql = require("mysql");

//import toaqui from './funcoes.cjs'; 

//import { toaqui } from pkj;

//const changeData = require('./funcoes.js');
//const engolfandoAlta = require("./funcoes.js");
//toaqui('toaqui');
const API_URL = "https://testnet.binance.vision";//URL de produção: "https://api.binance.com";
const SYMBOL = "BTCUSDT";

const SELL_PRICE = 44500;
const BUY_PRICE = 43100;

const QUANTITY = "0.001";
const API_KEY = "EyoHMyzdl5AjWbFUtPrFiI9Ew80yDOTwI1NUNFdYgngLI0E8GGtQHqsDmrwyd2PF";//aprenda a criar as chaves: https://www.youtube.com/watch?v=-6bF6a6ecIs
const SECRET_KEY = "f7c4E48UcZwjk4FJULChgAtZIQQ2rEbk8ZDHvWVKCtk7KLcMjSlrBckE7YbgLAMk";

//let isOpened = false;
let isOpened = false;

let saldoUSDT = 1000;
let saldoUSDTNew = 2000;

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'scnovo2021'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

let precoAnterior = 0;

async function start() {

  const { data } = await axios.get(API_URL + "/api/v3/klines?limit=21&interval=15m&symbol=" + SYMBOL);

 // console.log(data);
/*
  if(engolfandoAlta(data)){
    console.log('>>>>>> engolfandoAlta');
  }else{
    console.log('>>>>>> engolfandoBaixa');
  }

  };
*/
  const candle = data[data.length - 1];
  let operacao = "STAY";

  const precoAtual = parseFloat(candle[4]);

  let saldd = 0;

  //console.clear();
  console.log('--------------');
  //console.log('candle ', candle);

  console.log("Price now: " + precoAtual);
  //console.log("Sell Price: " + SELL_PRICE);
  //console.log("Buy Price: " + BUY_PRICE);
  console.log('vender a ', SELL_PRICE);
  //console.log('cotação ', precoAtual);
  console.log('comprar a ', BUY_PRICE);
  console.log('carteira ', saldd);
 // console.log("Sell Price: " + SELL_PRICE);
  console.log('--------------');
  if (precoAtual > SELL_PRICE) {
    console.log(">>>>>>Sell Price: " + SELL_PRICE);
  }
  if (precoAtual < BUY_PRICE) {
    console.log(">>>>>>Buy Price: " + BUY_PRICE);

  }

  //saldd = getSaldo();
  saldd = await getSaldoDB("SELECT saldo FROM robo ORDER BY id DESC LIMIT 1");

  saldoUSDT = saldd;
  saldoUSDTNew = saldoUSDT;

  console.log("Saldo db: " + saldd);

  //console.log(' vem da fucnction ',getSaldo());

  //saldd = parseFloat(saldd);

  console.log("Saldo: " + saldoUSDT);

  const sma = calcSMA(data);
  console.log("SMA now: " + sma);
  console.log("Is Opened? " + isOpened);

  if (isOpened)
    //console.log("Sell Price: " + sma * 1.1);
    console.log(">> aberto  Sell Price: " + SELL_PRICE);

  else
    //console.log("Buy Price: " + sma * 0.9);
    console.log(">> fechado Buy Price: " + BUY_PRICE);

  //if (precoAtual <= (sma * 0.9) && !isOpened) {
  if (precoAtual <= BUY_PRICE && (saldoUSDT > 0)) {
    console.log("Comprar!", precoAtual, BUY_PRICE);
    isOpened = true;
    //newOrder(SYMBOL, QUANTITY, "BUY");
    operacao = "BUY";
    //saldoUSDT += saldoUSDT * QUANTITY * precoAtual;
    saldoUSDT += 10;// * QUANTITY * precoAtual;

  }
  //else if (precoAtual >= (sma * 1.1) && isOpened) {
  else if (precoAtual >= SELL_PRICE && (saldoUSDT > 0)) {
    console.log("Vender!", precoAtual, SELL_PRICE);
    //newOrder(SYMBOL, QUANTITY, "SELL");
    isOpened = false;
    operacao = "SELL";
    //saldoUSDT -= saldoUSDT * QUANTITY * precoAtual;
    saldoUSDT -= 10;//saldoUSDT * QUANTITY * precoAtual;

  } else if (precoAtual < SELL_PRICE && precoAtual > BUY_PRICE) {
    console.log("Manter!", precoAtual, SELL_PRICE);
    //newOrder(SYMBOL, QUANTITY, "SELL");
    isOpened = false;
    operacao = "STAY";
    //saldoUSDT -= saldoUSDT * QUANTITY * precoAtual;
    //saldoUSDT -= 10;//saldoUSDT * QUANTITY * precoAtual;

  }

  //implementar preco atual com preco anterior
  // se esta subindo compra se estiver caindo vende
  if (precoAnterior < precoAtual) {
    //operacao = "BUY";
    console.log('continua comprando...')
    saldoUSDTNew += 20;
  } else if (precoAnterior > precoAtual) {
    //operacao = "SELL";

    console.log('continua vendendo...')
    saldoUSDTNew -= 20;
  }

  console.log('carteira ', saldd * precoAtual * QUANTITY);

  let dado = changeData2();

  console.log('dado ',dado);

  //let dado2 = changeData();

  //console.log('dado2 ',dado2);

  //console.log(dado.data);
  //console.log(dado.hora);

  const registro = {
    valor: precoAtual * QUANTITY,
    data: dado.data,
    hora: dado.hora,
    quantidade: QUANTITY,
    operacao: operacao,
    saldo: saldoUSDT,
    saldoNew:saldoUSDTNew,
  };
  console.log(registro);
  //grava registro no db
  saveData(registro);

  console.log('anterior => ' + precoAnterior + " Atual => " + precoAtual);
  console.log('Saldo USDT New  =>', saldoUSDTNew);
  precoAnterior = precoAtual;

  console.log('maior menor');
  consultaMaiorMenorDB();

 // console.log('teste2');
  //toaqui("teste");

}

function calcSMA(candles) {
  const closes = candles.map(c => parseFloat(c[4]));
  const sum = closes.reduce((a, b) => a + b);
  return sum / closes.length;
}

async function newOrder(symbol, quantity, side) {
  const order = { symbol, quantity, side };
  order.type = "MARKET";
  order.timestamp = Date.now();

  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(new URLSearchParams(order).toString())
    .digest("hex");

  order.signature = signature;

  try {
    const { data } = await axios.post(
      API_URL + "/api/v3/order",
      new URLSearchParams(order).toString(),
      {
        headers: { "X-MBX-APIKEY": API_KEY }
      });

    console.log(data);
  } catch (err) {
    //para erros e soluções com essa API, consulte https://www.luiztools.com.br/post/erros-comuns-com-as-apis-da-binance/
    console.error(err.response.data);
  }
}

setInterval(start, 5 * 60 * 1000);//cada 5 minutos

start();

// Create a function to save data to the database
function saveData(data) {
  const query = 'INSERT INTO robo(valor, data,hora, quantidade,operacao,saldo,saldoNew) VALUES(?, ?, ?, ?,?,?,?)';
  //console.log(query);
  const values = [data.valor, data.data, data.hora, data.quantidade, data.operacao, data.saldo, data.saldoNew];
  //console.log(values);

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error saving data to the database:', err);
      return;
    }
    console.log('Data saved to the database');
    console.log('Id => ', result.insertId);
  });

}



// Close the connection to the database
//connection.end((err) => {
//    if (err) {
//        console.error('Error closing the database connection:', err);
//        return;
//    }
//    console.log('Connection to the database closed');
//});



// Função para realizar uma consulta e retornar o resultado
function getSaldoDB(sql) {
  return new Promise((resolve, reject) => {
    // Conectar ao banco de dados
    //connection.connect();

    // Executar a consulta
    connection.query(sql, (error, results, fields) => {
      // Fechar a conexão, independentemente do resultado
      //connection.end();

      if (error) {
        reject(error);
      } else {
        //      results[0].saldo === undefined ? resolve(0) :
        resolve(results[0].saldo);
      }
    });
  });
}
function getMaiorMenorDB(sql) {
  return new Promise((resolve, reject) => {
    // Conectar ao banco de dados
    //connection.connect();

    // Executar a consulta
    connection.query(sql, (error, results, fields) => {
      // Fechar a conexão, independentemente do resultado
      //connection.end();

      if (error) {
        reject(error);
      } else {
        //      results[0].saldo === undefined ? resolve(0) :
        resolve(results[0]);
      }
    });
  });
}

// Exemplo de uso da função
async function consultaMaiorMenorDB() {
  const sql = 'SELECT max(valor) as maior , min(valor) as menor FROM robo';
  try {
    const resultadoConsulta = await getMaiorMenorDB(sql);
    console.log('Resultado da Consulta 2:', resultadoConsulta);
  } catch (error) {
    console.error('Erro na Consulta:', error.message);
  }
}

// Executar o exemplo
//consultaMaiorMenorDB();

function changeData2() {

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

  return dataFormatada; // Exibe a data formatada com hora


}