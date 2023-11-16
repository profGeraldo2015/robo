const axios = require('axios');

const API_KEY = 'SUA_CHAVE_API';
const API_SECRET = 'SUA_CHAVE_SECRETA';

const symbol = 'BTCUSDT';
let saldoUSDT = 1000;

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

async function obterSaldo() {
  const params = {};
  const accountInfo = await makeSignedRequest('get', '/account', params);
  
  // Encontrar o saldo de USDT
  const balance = accountInfo.balances.find(b => b.asset === 'USDT');
  
  return parseFloat(balance.free);
}

async function obterPrecoAtual() {
  const params = { symbol };
  const ticker = await makeSignedRequest('get', '/ticker/price', params);
  
  return parseFloat(ticker.price);
}

async function realizarOrdemDeCompra(quantidade) {
  const params = { symbol, side: 'BUY', type: 'MARKET', quantity };
  return makeSignedRequest('post', '/order', params);
}

async function realizarOrdemDeVenda(quantidade) {
  const params = { symbol, side: 'SELL', type: 'MARKET', quantity };
  return makeSignedRequest('post', '/order', params);
}

async function estrategiaBasica() {
  try {
    // Obter o preço atual
    const precoAtual = await obterPrecoAtual();
    console.log('Preço Atual:', precoAtual);

    // Obter o saldo atual
    saldoUSDT = await obterSaldo();
    console.log('Saldo Atual:', saldoUSDT);

    // Definir estratégia simples: comprar se o preço for abaixo de 10 e vender se for acima de 12
    if (precoAtual < 10 && saldoUSDT > 0) {
      const quantidadeCompra = saldoUSDT / precoAtual;
      await realizarOrdemDeCompra(quantidadeCompra);
      console.log('Ordem de Compra realizada:', quantidadeCompra);
    } else if (precoAtual > 12 && saldoUSDT > 0) {
      const quantidadeVenda = saldoUSDT;
      await realizarOrdemDeVenda(quantidadeVenda);
      console.log('Ordem de Venda realizada:', quantidadeVenda);
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

// Executar a estratégia a cada intervalo (por exemplo, a cada 5 minutos)
setInterval(estrategiaBasica, 5 * 60 * 1000); // Intervalo em milissegundos
