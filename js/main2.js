const sound = new Audio('./sounds/tick.wav')
Vue.filter('8places', value => parseFloat(value).toFixed(8))

const exchanges = [
  {
    id: 0,
    name: 'BitBay',
    makerFee: 0.43 / 100,
    takerFee: 0.43 / 100,
    praseTicker: function (ticker, pair) {
      return {
        ask: parseFloat(ticker.ask),
        bid: parseFloat(ticker.bid)
      }
    },
    getTickerUrl: function (pairName) {
      const pairTickerb = pairName.replace('-', '');
      return `https://bitbay.net/API/Public/${pairTickerb}/ticker.json`
    }
  },
  {
    id: 1,
    name: 'Bittrex',
    makerFee: 0.25 / 100,
    takerFee: 0.25 / 100,
    praseTicker: function (ticker, pair) {
      const responseTicker = ticker.query.results.json.result
      return {
        ask: parseFloat(responseTicker.Ask),
        bid: parseFloat(responseTicker.Bid)
      }
    },
    getTickerUrl: function (pairNameOrygial) {
      pair = pairNameOrygial.split('-');
      const pairName = pair[1] + '-' +pair[0];
      
      return `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%20%3D%20%27https%3A%2F%2Fbittrex.com%2Fapi%2Fv1.1%2Fpublic%2Fgetticker%3Fmarket%3D${pairName}%27&format=json&callback=`
    }
  }
]

const pairList = [
  {
    name: 'GAME-BTC',
    courses: [
      {
        name: 'Bittrex',
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
        name: 'Bittrex',
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
        name: 'Bittrex',
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
        name: 'Bittrex',
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
        name: 'Bittrex',
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
        name: 'Bittrex',
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
    pairs: pairList,
    exchanges,
    percentLimit: 3,
    playSounds: true
  },
  methods: {
    // E2
    getSellQty: function (coins, exchangeName) {
      const value = coins / (this.getTakerFee(exchangeName) + 1)
      return value;
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
      return value;
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

      return  value;
    },
    refresh: function () {
      pairList.forEach(pair => {
        exchanges.map(exchange => {
          return fetch(exchange.getTickerUrl(pair.name)).then(resp => resp.json()).then(ticker => {
            const pairTicker = exchange.praseTicker(ticker, pair.name)
		console.log(pairTicker);
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
