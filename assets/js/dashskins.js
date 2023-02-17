console.log('dashskins page----')
var pricesList = {};
var rate = 0;
var converter = {
    'Nova de Fábrica': 'Factory New',
    'Pouco Usada': 'Minimal Wear',
    'Testada em Campo': 'Field-Tested',
    'Bem Desgastada': 'Well-Worn',
    'Veterana de Guerra': 'Battle-Scarred',
}

MutationObserver = window.MutationObserver;
var config = {
    childList: true,
};

function getPriceProvider() {

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'priceProvider' }, response => {
            console.log(response);
            pricesList = response;
            resolve(response);
        });
    })
}

function getRate2BRL() {

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'rate' }, response => {
            console.log(response);
            rate = response.USDBRL.bid;
            resolve(response);
        });
    })
}

function addRate() {
    let div = document.createElement('div');
    div.classList.add('navbar-item');
    div.innerHTML = "USD = R$" + rate;
    let parent_el = $('.navbar-end');
    parent_el.prepend(div);
}

async function toCheckItems(mutationsList, observer) {
    for (let mutation of mutationsList) {
        if (mutation.type == 'childList' && mutation.addedNodes.length > 0) {
            try {
                const item = mutation.addedNodes[0]
                setBuffValue(item);
            }
            catch (e) {
                // console.log(e)
            }
        }
    }
}

async function startMutation(itemsGrid) {
    const observer = new MutationObserver(toCheckItems);
    observer.observe(itemsGrid, config);
}

Start();

async function Start() {
    await getPriceProvider().then(() => {
        getRate2BRL().then(() => {
            addRate();
            const intervalFindHeader = setInterval(function () {
                const skin_el = document.querySelector("body > div > div > div > div.container > div.is-multiline")

                if (skin_el) {
                    clearInterval(intervalFindHeader)
                    startMutation(skin_el);
                    setValue();
                }
            }, 50)
        })
    })
}

function setValue() {
    const intervalItemGrid = setInterval(async function () {

        if (document.querySelector("body > div > div > div > div.container > div.is-multiline")) {
            clearInterval(intervalItemGrid);
            const itemsGrid = document.querySelector("body > div > div > div > div.container > div.is-multiline").children;

            for (var i = 0; i < itemsGrid.length; i++) {
                var item = itemsGrid[i];
                if (i < 3 || i == itemsGrid.length - 1) {
                    continue;
                }
                setBuffValue(item);
            }
        }
    }, 50)
}

function setBuffValue(item) {
    var itemInfo = {};
    let itemName = '';
    let title_el = item.querySelector("a > div.listing > div:nth-child(1)").innerHTML;
    // console.log(title_el);
    if (title_el) {
        itemInfo.weapon = title_el.split("<")[0].trim();
    } else {
        console.log("can not get title element!");
        return;
    }
    itemName += itemInfo.weapon;

    if (item.querySelector("a > div.listing > div:nth-child(1) > span")) {
        // console.log(item.querySelector("a > div.listing > div:nth-child(1) > span").innerHTML.trim());
        itemInfo.weapon += item.querySelector("a > div.listing > div.title > span").innerHTML.trim();
    }

    // if (item.querySelector("a > div.listing > div:nth-child(2)")) {
    //     let skinWeapon = item.querySelector("a > div.listing > div:nth-child(2)").innerHTML.trim()

    //     itemInfo.skinWeapon = skinWeapon
    //     itemName += ' ' + skinWeapon;
    // }

    if (item.querySelector("a > div.listing > div.tags > div:nth-child(1)")) {
        let tag = item.querySelector("a > div.listing > div.tags > div:nth-child(1)").innerHTML.trim()

        tag = converter[tag];
        itemInfo.tag = tag
        itemName += ' (' + tag + ')';
    }

    // if (item.querySelector('cw-item > div:nth-child(2) > div:nth-child(2) > cw-item-variant-details')) {
    //     let qualitieWeapon = item.querySelector('cw-item > div:nth-child(2) > div:nth-child(2) > cw-item-variant-details > div > div').innerHTML.trim()

    //     itemInfo.qualitieWeapon = qualitieWeapon
    //     itemName += " (" + qualitieWeapon + ")";
    // } else if (item.querySelector('cw-item > div:nth-child(1) > div:nth-child(2) > cw-item-variant-details')) {
    //     let qualitieWeapon = item.querySelector('cw-item > div:nth-child(1) > div:nth-child(2) > cw-item-variant-details > div > div').innerHTML.trim()

    //     itemInfo.qualitieWeapon = qualitieWeapon
    //     itemName += " (" + qualitieWeapon + ")";
    // }

    // console.log(itemName);
    // var dopplerCase = '';
    // if (itemName.includes("Doppler")) {
    //     var tmpName = itemName.split("Doppler");
    //     itemName = tmpName[0] + "Doppler (" + itemInfo.qualitieWeapon + ")";
    //     var tmpDopplerCase = tmpName[1].split("(" + itemInfo.qualitieWeapon + ")");
    //     dopplerCase = tmpDopplerCase[0].trim();
    // }

    let priceInfo = pricesList[itemName];
    // console.log(priceInfo);
    if (priceInfo === undefined) return;
    let tbuffVal = priceInfo.buff163.highest_order.price * 0.9 * rate;
    // if (dopplerCase != "") {
    //     tbuffVal = priceInfo.buff163.highest_order.doppler[dopplerCase] * 0.9 * rate;
    // }
    let buffVal = Math.floor(tbuffVal * 100) / 100

    let div = document.createElement('div');
    div.style.display = 'flex';
    let img_el = document.createElement('img');
    img_el.src = 'https://pricempire.com/assets/logos/buff163_icon.png';
    let span_el = document.createElement('span');
    const textnode = document.createTextNode("Buff163 * 0.9 : " + buffVal);
    span_el.appendChild(textnode);
    div.appendChild(img_el);
    div.appendChild(span_el);

    let parent_el = item.querySelector("a > div.listing > div.tags");
    parent_el.appendChild(div);
}