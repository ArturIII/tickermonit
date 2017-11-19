const sound = new Audio('./sounds/tick.wav')

const exchanges = [
  {
    id: 0,
    name: 'Poloniex',
    makerFee: 0.25 / 100,
    takerFee: 0.25 / 100,
    tickerUrl: 'https://poloniex.com/public?command=returnTicker',
    praseTicker: function (ticker, pair) {
      pair = pair.replace('BCC', 'BCH')
      pair = pair.split('-');
      const pairTicker = ticker[pair[1] + '_' +pair[0]];

      var ask_value = pairTicker.lowestAsk;
      var bid_value = pairTicker.highestBid;
      
      return {
        ask: parseFloat(ask_value).toFixed(8),
        bid: parseFloat(bid_value).toFixed(8)
      }
    },
    getTickerUrl: function () {
      return this.tickerUrl
    }
  },
  {
    id: 1,
    name: 'BitBay',
    makerFee: 0.43 / 100,
    takerFee: 0.43 / 100,
    praseTicker: function (ticker, pair) {
      return {
        ask: parseFloat(ticker.ask).toFixed(8),
        bid: parseFloat(ticker.bid).toFixed(8)
      }
    },
    getTickerUrl: function (pairName) {
      const pairTickerb = pairName.replace('-', '');
      return `https://bitbay.net/API/Public/${pairTickerb}/ticker.json`
    }
  }
]

const pairList = [
  {
    name: 'GAME-BTC',
    courses: [
      {
        name: 'Poloniex',
        ask: 0.00000000,
        bid: 0.00000000
      },
      {
        name: 'BitBay',
        ask: 0.00000000,
        bid: 0.00000000
      }
    ],
    coins: 100// C1
  },
  {
    name: 'ETH-BTC',
    courses: [
      {
        name: 'Poloniex',
        ask: 0.00000000,
        bid: 0.00000000
      },
      {
        name: 'BitBay',
        ask: 0.00000000,
        bid: 0.00000000
      }
    ],
    coins: 10
  },
  {
    name: 'LSK-BTC',
    courses: [
      {
        name: 'Poloniex',
        ask: 0.00000000,
        bid: 0.00000000
      },
      {
        name: 'BitBay',
        ask: 0.00000000,
        bid: 0.00000000
      }
    ],
    coins: 1// C1
  },
  {
    name: 'LTC-BTC',
    courses: [
      {
        name: 'Poloniex',
        ask: 0.00000000,
        bid: 0.00000000
      },
      {
        name: 'BitBay',
        ask: 0.00000000,
        bid: 0.00000000
      }
    ],
    coins: 1// C1
  },
  {
    name: 'DASH-BTC',
    courses: [
      {
        name: 'Poloniex',
        ask: 0.00000000,
        bid: 0.00000000
      },
      {
        name: 'BitBay',
        ask: 0.00000000,
        bid: 0.00000000
      }
    ],
    coins: 1// C1
  },
  {
    name: 'BCC-BTC',
    courses: [
      {
        name: 'Poloniex',
        ask: 0.00000000,
        bid: 0.00000000
      },
      {
        name: 'BitBay',
        ask: 0.00000000,
        bid: 0.00000000
      }
    ],
    coins: 0.5// C1
  },
]

const app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    pairs: pairList,
    exchanges,
    percentLimit: 3,
    playSounds: true
  },
  methods: {
    // E2
    getSellQty: function (coins, exchangeName) {
      const value = coins / (this.getTakerFee(exchangeName) + 1)
      return value.toFixed(8);
    },
    getTakerFee: function (exchangeName) {
      return this.getExchangeByName(exchangeName).takerFee
    },
    getExchangeByName: function (exchangeName) {
      return exchanges.filter(exchange => exchange.name === exchangeName)[0]
    },
    // F2
    getSellCost: function (pair, exchangeName) {
      const value = pair.coins * this.getCourseByExchangeName(pair, exchangeName).ask
      return value.toFixed(8);
    },
    getCourseByExchangeName: function (pair, exchangeName) {
      return pair.courses.filter(exchange => exchange.name === exchangeName)[0]
    },
    // G2
    getExchangesSpread: function (pair, buyExchangeName, sellExchangeName) {
      const buyExchange = this.getCourseByExchangeName(pair, buyExchangeName)
      const sellExchange = this.getCourseByExchangeName(pair, sellExchangeName)
      const spread = (sellExchange.bid * 100 / buyExchange.ask) - 100
      return Math.round(spread * 100) / 100
    },
    // PLValue - profit/loss value
    getPLValue: function (pair, buyExchangeName, sellExchangeName) {
      const coinsToSell = this.getSellQty(pair.coins, buyExchangeName)
      const sellExchange = this.getCourseByExchangeName(pair, sellExchangeName)
      const sellValue = coinsToSell * sellExchange.bid

      const sellFee = sellValue * this.getTakerFee(sellExchangeName)

      const value = sellValue - sellFee - this.getSellCost(pair, buyExchangeName)

      return  value.toFixed(8);
    },
    refresh: function () {
      pairList.forEach(pair => {
        exchanges.map(exchange => {
          return fetch(exchange.getTickerUrl(pair.name)).then(resp => resp.json()).then(ticker => {
            const pairTicker = exchange.praseTicker(ticker, pair.name)
            pair.courses[exchange.id].ask = pairTicker.ask
            pair.courses[exchange.id].bid = pairTicker.bid
          })
        })
      })
    },
    hasArbitrage: function (spread) {
      const hasArbitrage = spread > this.percentLimit
      if (hasArbitrage && this.playSounds) {
        sound.play()
      }
      return hasArbitrage
    }
  }
})

setInterval(() => {
  app.refresh()
}, 2 * 1000)// 2 seconds
