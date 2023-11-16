const axios = require('axios');

const API_KEY = 'SUA_CHAVE_API';
const API_SECRET = 'SUA_CHAVE_SECRETA';

const symbol = 'BTCUSDT';
let saldoUSDT = 1000; // Saldo inicial em USDT (apenas um valor de exemplo)

async function makeSignedRequest(method, endpoint, params = {}) {
  // ... (o mesmo código para criar uma solicitação assinada)

  try {
    const response = await axios({
      method,
      url,
      headers: { 'X-MBX-APIKEY': API_KEY },
    });

    return response.data;
  } catch (error) {
    console.error('Erro na solicitação:', error.message);
    throw error;
  }
}

async function getOrderBook(symbol) {
  const params = { symbol };
  return makeSignedRequest('get', '/depth', params);
}

async function marketOrder(symbol, side, quantity) {
  const params = { symbol, side, type: 'MARKET', quantity };
  return makeSignedRequest('post', '/order', params);
}

async function obterSaldo() {
  const params = {};
  const accountInfo = await makeSignedRequest('get', '/account', params);
  
  // Encontrar o saldo de USDT
  const balance = accountInfo.balances.find(b => b.asset === 'USDT');
  
  return parseFloat(balance.free);
}

async function main() {
  try {
    // Obter informações do livro de ordens
    const orderBook = await getOrderBook(symbol);
    console.log('Livro de Ordens:', orderBook);

    // Obter o saldo atual
    saldoUSDT = await obterSaldo();
    console.log('Saldo Atual:', saldoUSDT);

    // Realizar uma ordem de mercado de compra de 0.001 BTC
    const quantidadeCompra = 0.001;
    const buyOrder = await marketOrder(symbol, 'BUY', quantidadeCompra);
    console.log('Ordem de Compra:', buyOrder);

    // Obter o saldo após a compra
    saldoUSDT = await obterSaldo();
    console.log('Saldo Após Compra:', saldoUSDT);

    // Realizar uma ordem de mercado de venda de 0.001 BTC
    const quantidadeVenda = 0.001;
    const sellOrder = await marketOrder(symbol, 'SELL', quantidadeVenda);
    console.log('Ordem de Venda:', sellOrder);

    // Obter o saldo após a venda
    saldoUSDT = await obterSaldo();
    console.log('Saldo Após Venda:', saldoUSDT);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

main();
