
const makeGETRequest = (url) => {
    let request;

    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }

    return new Promise(function (resolve, reject) {
        request.open('GET', url, true);
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                (request.status > 199 && request.status < 300) ?
                    resolve(request.responseText):
                    reject(request.status);
            }
        }
        request.send();
    });
}

const makePOSTRequest = (url,data) => {
    let request;
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return new Promise(function (resolve, reject) {
        request.open('POST', url, true);
        request.setRequestHeader('accept', 'application/json');
        request.send(data);
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                (request.status > 199 && request.status < 300) ?
                    resolve(request.statusText):
                    reject(request.status);
            }
        }
    });
}


const API_URL = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';
var goodList = document.querySelector('#goods-list');
var basket = document.querySelector('#basketList');

class GoodsItem {
    constructor(id_product, product_name, price, img) {
        this.product_name = product_name;
        this.id_product = id_product;
        this.price = price;
    }
    render() {
        return `<div class="goods-item"><a href="#"><img class="card-img-top" src="#"><h3> ${this.product_name} </h3><span> ${this.price} </span><span> руб.</span><button type="button" class="buyBtn" value=${this.id_product}>Добавить в корзину</button></a></div>`;
    }
}

class GoodsList {
    constructor(list) {
        this.goods = [];
    }
    fetchGoods() {
        makeGETRequest(`${API_URL}/catalogData.json`)
            .then(response => {
                this.goods = JSON.parse(response);
            })
            .then(() => this.render())
    }

    render() {
        let listHtml = '';
        this.goods.forEach(good => {
            const goodItem = new GoodsItem(good.id_product, good.product_name, good.price);
            listHtml += goodItem.render();
        });
        goodList.innerHTML = listHtml;
    }
}

const list = new GoodsList();
list.fetchGoods();


class BasketItem {
    constructor(id_product, product_name, price) {
        this.product_name = product_name;
        this.id_product = id_product;
        this.price = price;
    }
    render() {
        return `<li class="basket-item"><p> ${this.product_name} </p><span> ${this.price} </span><span> руб.</span><button type="button" class="delBtn" value=${this.id_product}>X</button></li>`;
    }
}

class BasketList {
    constructor() {
        this.cart = this.fetchGoods();
        this.amount = 0;
        this.countGoods = 0;
        this.goodsList = [];
    }
    getItems(list) {
        this.amount = this.cart['amount'];
        this.countGoods = this.cart['countGoods'];
        this.goodsList = this.cart['contents'];
    }
    fetchGoods() {

        makeGETRequest(`${API_URL}/getBasket.json`)
            .then(response => {
                this.cart = JSON.parse(response);
            })
            .then(() => this.getItems(this.cart))
            .then(() => this.calcAmount())
            .then(() => this.calcCountGoods())
            .then(() => this.render())
            .then(() => this.renderCount())
            .catch((error) => {
                throw new Error(`${error}! В корзине проблемы!`);
            });

    }
    render () {
        let listHtml = '';
        this.goodsList.map(good => {
            const goodItem2 = new BasketItem(good.id_product, good.product_name, good.price, good.quantity);
            listHtml += goodItem2.render();
        });
        basket.innerHTML = listHtml;
    }
    calcAmount() {
        this.amount = this.goodsList.reduce((sum, currentItem) => sum + (+currentItem.quantity) * (+currentItem.price), 0);

        return this.amount;
    };

    calcCountGoods() {
        this.countGoods = this.goodsList.reduce((sum, currentItem) => sum + (+currentItem.quantity), 0);

        return this.countGoods;
    };
    renderCount() {
        document.getElementById('info_basket').innerHTML = `<span>Кол-во товаров: ${this.countGoods}</span><span>на сумму: ${this.amount}  р.</span> `;
    }
    deleteItem(id) {
        this.goodsList.forEach(function (item, i) {
            if (item.id_product == id) {
                this.goodsList.splice(i, 1);
                makeGETRequest(`${API_URL}/deleteFromBasket.json`)
                    .then(() => this.calcCountGoods())
                    .then(() => this.calcAmount())
                    .then(() => this.render())
                    .then(() => this.renderCount())
                    .catch((error) => {
                        throw new Error(`${error}! Товарн не удален!`);
                    });
            }

        }.bind(this));
        console.log(this)
    }
    addItem(id) {
        this.goodsList.forEach(function (item, i) {

            if (item.id_product == id) {
                this.goodsList.push(item);
                console.log(item);
                console.log(this);
                makeGETRequest(`${API_URL}/addToBasket.json`)
                    .then(() => this.calcCountGoods())
                    .then(() => this.calcAmount())
                    .then(() => this.render())
                    .then(() => this.renderCount())
                    .catch((error) => {
                        throw new Error(`${error}! Товар не добавлен!`);
                    });

            }
        }.bind(this));
    }
}


const bsk = new BasketList();
bsk.fetchGoods();


var addToBasket = function (evt) {
    if (evt.target.className == 'buyBtn') {
        bsk.addItem(evt.target.value)
    }
};

var deleteFromBasket = function (evt) {
    if (evt.target.className == 'delBtn') {
        bsk.deleteItem(evt.target.value)
    }
};

basketList.style.display = 'none'
var showList = function (evt) {
    if (evt.target.id == 'basket') {
        console.log(evt.target)
        if (basketList.style.display == 'block') {
            console.log(basketList)
            basketList.style.display = 'none'
            console.log(basketList.style.display)
        } else if (basketList.style.display == 'none') {
            console.log(2)
            basketList.style.display = 'block'
        }
    }
}

document.addEventListener('click', addToBasket);
document.addEventListener('click', deleteFromBasket);
document.addEventListener('click', showList);