const axios = require("axios");

console.log('Vamos lá Geraldo!!!, go ahead');
const SYMBOL = "BTCUSDT";
const BUY_PRICE = 35720;
const SELL_PRICE = 35764;
const API_URL = "https://testnet.binance.vision";
const QUANTITY = "0.001";

let isOpened = false;

//let money = 100;
let carteira = 100;

async function start() {

    console.log('Searching data...')
    const { data } = await axios.get(API_URL + "/api/v3/klines?limit=21&interval=15m&symbol="+SYMBOL);
    const candle = data[data.length -1];
    const price = parseFloat(candle[4]);
    //console.log(candle);
    console.clear();
    const sma = calcSMA(data);
    console.log("SMA now: " + sma);
    console.log("Is Opened? " + isOpened);

    console.log('vender a ',SELL_PRICE);
    console.log('cotação ',price);
    console.log('comprar a ',BUY_PRICE);
    console.log('carteira ',carteira);
   // console.log('array ',data);

    if (price < BUY_PRICE && !isOpened) {
        
        isOpened = true;
        
        console.log('comprar');
        newOrder(SYMBOL,QUANTITY ,true,price)
        //money -= money;
        
    } 
    
    if(price > SELL_PRICE && isOpened){
        
        console.log('vender ');
        newOrder(SYMBOL,QUANTITY ,false,price)
        
        isOpened = false;
        
        //money -=5;
        
    }
    //newOrder(SYMBOL,QUANTITY ,false,price)
    
    
}

const calcSMA = (candles)=>{
    const closes = candles.map( c => parseFloat(c[4]))
    const sum = closes.reduce((a,b) => a+b);
    return sum / closes.length;
}

async function newOrder(symbol, quantity, side,price){
    const order = {symbol, quantity,side};
    if (side){
        
        carteira += carteira * QUANTITY * price
        
    }else{
        carteira -= carteira * QUANTITY * price

    }


}
setInterval(start, 3000)

start();
