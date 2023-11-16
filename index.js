const axios = require("axios");
const crypto = require("crypto");
const mysql = require("mysql");

const API_URL = "https://testnet.binance.vision";//URL de produção: "https://api.binance.com";
const SYMBOL = "BTCUSDT";
const BUY_PRICE = 38800;//36530;

const SELL_PRICE = 37750;

const QUANTITY = "0.001";
const API_KEY = "EyoHMyzdl5AjWbFUtPrFiI9Ew80yDOTwI1NUNFdYgngLI0E8GGtQHqsDmrwyd2PF";//aprenda a criar as chaves: https://www.youtube.com/watch?v=-6bF6a6ecIs
const SECRET_KEY = "f7c4E48UcZwjk4FJULChgAtZIQQ2rEbk8ZDHvWVKCtk7KLcMjSlrBckE7YbgLAMk";

let isOpened = false;
let saldoUSDT = 1000;

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

async function start() {
    const { data } = await axios.get(API_URL + "/api/v3/klines?limit=21&interval=15m&symbol=" + SYMBOL);
    const candle = data[data.length - 1];
    let operacao = "STAY";
    const price = parseFloat(candle[4]);

    let saldd = 0;

    console.clear();
    console.log("Price now: " + price);

    //saldd = getSaldo();
    saldd = await consultarBancoDeDados("SELECT saldo FROM robo ORDER BY id DESC LIMIT 1");
    
    console.log("Saldo db: " + saldd);
    
    //console.log(' vem da fucnction ',getSaldo());

    //saldd = parseFloat(saldd);
    console.log("Saldo: " + saldoUSDT);
    
    const sma = calcSMA(data);
    console.log("SMA now: " + sma);
    console.log("Is Opened? " + isOpened);

    if (isOpened)
        //console.log("Sell Price: " + sma * 1.1);
        console.log("Sell Price: " + SELL_PRICE);

    else
        //console.log("Buy Price: " + sma * 0.9);
        console.log("Buy Price: " + BUY_PRICE);

    //if (price <= (sma * 0.9) && !isOpened) {
    if (price <= BUY_PRICE && !isOpened && saldoUSDT > 0) {

        console.log("Comprar!");
        isOpened = true;
        //newOrder(SYMBOL, QUANTITY, "BUY");
        operacao = "BUY";
        saldoUSDT += saldoUSDT * QUANTITY * price;
    }
    
    //else if (price >= (sma * 1.1) && isOpened) {
    else if (price >= SELL_PRICE && isOpened && saldoUSDT > 0) {
            console.log("Vender!");
            //newOrder(SYMBOL, QUANTITY, "SELL");
            isOpened = false;
            operacao = "SELL";
            saldoUSDT -= saldoUSDT * QUANTITY * price;
        
    }
    // Example usage
    let dado = changeData();

    //console.log(dado.data);
    //console.log(dado.hora);

    const registro = {
        valor: price * QUANTITY,
        data: dado.data,
        hora: dado.hora,
        quantidade: QUANTITY,
        operacao: operacao,
        saldo: saldoUSDT,
    };
    console.log(registro);
    saveData(registro);

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

setInterval(start, 6000);

start();

// Create a function to save data to the database
function saveData(data) {
    const query = 'INSERT INTO robo(valor, data,hora, quantidade,operacao,saldo) VALUES(?, ?, ?, ?,?,?)';
    //console.log(query);
    const values = [data.valor, data.data, data.hora, data.quantidade,data.operacao,data.saldo];
    //console.log(values);

    connection.query(query, values, (err, result) => {
        if (err) {
            console.error('Error saving data to the database:', err);
            return;
        }
        console.log('Data saved to the database');
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

    return dataFormatada; // Exibe a data formatada com hora


}

// Função para realizar uma consulta e retornar o resultado
function consultarBancoDeDados(sql) {
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
        resolve(results[0].saldo);
      }
    });
  });
}

// Exemplo de uso da função
async function exemploConsulta() {
  const sql = 'SELECT * FROM sua_tabela';
  try {
    const resultadoConsulta = await consultarBancoDeDados(sql);
    console.log('Resultado da Consulta:', resultadoConsulta);
  } catch (error) {
    console.error('Erro na Consulta:', error.message);
  }
}

// Executar o exemplo
exemploConsulta();
