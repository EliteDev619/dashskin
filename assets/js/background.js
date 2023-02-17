chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.type) {
        case "priceProvider":
            {
                var proxy = 'https://cors-anywhere.herokuapp.com/';
                const json_url = proxy + 'https://prices.csgotrader.app/latest/prices_v6.json';
                fetch(json_url)
                .then(response => response.json()
                    .then(t => sendResponse(t)))
                .catch(error => handleError(error))
                return true;
            }; break;
        case "rate":
            {
                var proxy = 'https://cors-anywhere.herokuapp.com/';
                const json_url = proxy + 'https://economia.awesomeapi.com.br/json/last/USD-BRL';
                fetch(json_url)
                .then(response => response.json()
                    .then(t => sendResponse(t)))
                .catch(error => handleError(error))
                return true;
            };
    }
});
