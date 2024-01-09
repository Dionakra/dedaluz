const fs = require("fs")

const SKUS = ["ssams918bd256gpbliba", "ssams918bd512gcliba", "ssams918bd256gpblibb", "ssams918bd256gllibb", "ssams918bd512gglibb", "ssams918bd256gcliba",
    "ssams918bd256glliba", "ssams918bd256ggliba", "ssams918bd512gpbliba", "ssams918bd512gpblibb", "ssams918bd1tpbliba", "ssams918bd1tliba", "ssams918bd1tclibb",
    "sgoopix8p512goblibb", "sgoopix8p256gobliba", "sgoopix8p256goblibb", "sgoopix8p128gobliba", "sgoopix8p128goblibb", "sgoopix8p128gpoliba",
    "sgoopix8p256gceliba", "sgoopix8p128gpolibb", "sgoopix8p128gcelibb", "sgoopix8p128gceliba"]
const DATABASE = "./db.json"

scrape();

async function scrape() {
    const data = JSON.parse(fs.readFileSync(DATABASE, 'utf-8'))
    const date = toStringDate(new Date())

    for (const sku of SKUS) {
        const product = await getProductDetails(sku, date)
        const historic = data[sku]
        if (historic == undefined) {
            data[sku] = product
        } else {
            const previous = data[sku].prices[data[sku].prices.length - 1]
            const prices = product.prices[0]
            if (previous.sell != prices.sell || previous.exchange != prices.exchange || previous.cash != prices.cash) {
                data[sku].prices.push(prices)
            }

        }
        sleep(500)
    }

    fs.writeFileSync(DATABASE, JSON.stringify(data))
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function toStringDate(date) {
    return date.toISOString().replace(/\.\d{3}Z/, "").split("T").join(" ")
}

async function getProductDetails(sku, date) {
    const data = await fetch(`https://wss2.cex.es.webuy.io/v3/boxes/${sku}/detail`).then(response => response.json())

    const product = data.response.data.boxDetails[0]

    return {
        name: product.boxName,
        image: product.imageUrls.large,
        lastUpdate: toStringDate(new Date(product.lastPriceUpdatedDate)),
        firstSellPrice: product.firstPrice,
        prices: [
            {
                date: date,
                sell: product.sellPrice,
                exchange: product.exchangePrice,
                cash: product.cashPrice
            }
        ]
    }
}