var stockGetInfos = undefined;
var stockGetUrl = undefined;

function isOperation() {
	var today = new Date();
	
	var day = today.getDay();
	if ( day == 0 || day == 6 )
		return false;
	
	var hour = today.getHours();
	var minute = today.getMinutes();
	var time = hour * 100 + minute;

	if ( ( time > 920 && time < 1135 ) || ( time > 1255 && time < 1505 ) ) {
		return true;
	}

	return false;
}

function isWebkitHTMLNotificationsEnabled() {
	return window.webkitNotifications && window.webkitNotifications.createHTMLNotification;
}

function openStockPage(stockCode) {
	if (backgroundPage.Settings.getValue("showSinaLink", false)) {
		chrome.tabs.create({url: "https://finance.sina.com.cn/realstock/company/" + stockCode + "/nc.shtml", selected: true});
	}
	else {
		chrome.tabs.create({url: "https://xueqiu.com/S/" + stockCode, selected: true});
	}
}

function openSinaStock() {
	chrome.tabs.create({url: "http://finance.sina.com.cn/stock/index.shtml"});
}

function getImageSrc(stockCode) {
	return "http://image.sinajs.cn/newchart/min/n/" + stockCode + ".gif?" + Math.random();
}

function getImageSrc2(stockCode) {
	return "http://image.sinajs.cn/newchart/daily/n/" + stockCode + ".gif?" + Math.random();
}

function loadStocks() {
	var stocks = Settings.getObject("stockListStocks");
	
	stockGetInfos = [];
	
	if ( stocks == undefined ) {
		return;
	}
	
	stockGetUrl = "https://qt.gtimg.cn/q=";
	
	var index = 0;
	for (var i in stocks) {
		var stock = stocks[i];
		stockGetUrl += stock.stockCode + ",";
		
		var stockInfo = {
			stockIndex: index,
			stockName: stock.stockName,
			stockCode: stock.stockCode,
			stockUpPrice: stock.stockUpPrice,
			stockDownPrice: stock.stockDownPrice,
			stockFlag: stock.stockFlag,
			stockOpenPrice: "0.00",
			stockClosePrice: "0.00",
			stockCurrPrice: "0.00",
			stockMaxPrice: "0.00",
			stockMinPrice: "0.00",
			stockLastDate: "0000-00-00",
			stockLastTime: "00:00:00",
			stockVolume: "0",
			stockTurnover: "0",
			stockCurrAlertState: 0,
			stockLastAlertState: 0,
			stockChangeAmt: "0.00",
			stockChangeRate: "0.00"
		};
		
		stockGetInfos[index] = stockInfo;
		index++;
	}
};

function setStocks(strStocks) {
	
	stockGetUrl = "https://qt.gtimg.cn/q=" + strStocks;
	stockGetInfos = [];
	
	var stockCodes = strStocks[i].split(",");
	
	for (var i=0; i< stockCodes.length -1; i++) {
		var stockInfo = {
			stockIndex: i,
			stockName: "",
			stockCode: stockCodes[i],
			stockUpPrice: "0.00",
			stockDownPrice: "0.00",
			stockOpenPrice: "0.00",
			stockClosePrice: "0.00",
			stockCurrPrice: "0.00",
			stockMaxPrice: "0.00",
			stockMinPrice: "0.00",
			stockLastDate: "0000-00-00",
			stockLastTime: "00:00:00",
			stockVolume: "0",
			stockTurnover: "0",
			stockCurrAlertState: 0,
			stockLastAlertState: 0,
			stockChangeAmt: "0.00",
			stockChangeRate: "0.00"
		};
		
		stockGetInfos[i] = stockInfo;
	}	
};

var bfirstload = true;

function updateStocks() {
	if ( stockGetUrl == undefined ) {
		return;
	}
	try {
		var xhr = new window.XMLHttpRequest();
					
		xhr.open("GET", stockGetUrl, false);
		xhr.onreadystatechange = function() {
			var stockInfo = undefined;
			if (xhr.readyState == 4) {
				var stockListArray = xhr.responseText.split(";");
				
				for (var i = 0; i < stockListArray.length; i++) {
					var stockInfo = stockGetInfos[i];
					var elements = stockListArray[i].split('~');
			
					if(elements.length > 4) {
						try {
							if ( bfirstload ) stockInfo.stockName = elements[1];
							stockInfo.stockOpenPrice = parseFloat(elements[5]).toFixed(2);
							stockInfo.stockClosePrice = parseFloat(elements[4]).toFixed(2);
							stockInfo.stockCurrPrice = parseFloat(elements[3]).toFixed(2);
							stockInfo.stockMaxPrice = parseFloat(elements[33]).toFixed(2);
							stockInfo.stockMinPrice = parseFloat(elements[34]).toFixed(2);
							stockInfo.stockVolume = 0,//(parseInt(elements[11]) / 100).toFixed();
							stockInfo.stockTurnover = 0,//(parseInt(elements[12]) / 10000).toFixed();
							stockInfo.stockLastDate = elements[30];
							stockInfo.stockLastTime = elements[30];
							
							if (stockInfo.stockOpenPrice != 0) {
								stockInfo.stockChangeAmt = parseFloat(stockInfo.stockCurrPrice - stockInfo.stockClosePrice).toFixed(2);
								stockInfo.stockChangeRate = (parseFloat(stockInfo.stockChangeAmt / stockInfo.stockClosePrice)*100).toFixed(2);
							}
						} catch(e) { 
							console.error(e); 
							console.log(elements);
						}
						
						delete stockInfo;
					}
					delete elements;
				}
				delete stockListArray;
				bfirstload = false;
			}
			
			delete xhr;
		}
		xhr.send();
	} catch(e) { console.error(e); }
};

function getStockInfo(stockCode, f){
	try {
		var xhr = new window.XMLHttpRequest();
					
		xhr.open("GET", "https://qt.gtimg.cn/q=" + stockCode, true);
		xhr.onreadystatechange = function() {
			var stockInfo = undefined;
			var stockName = undefined;
			if (xhr.readyState == 4) {
				var elements = xhr.responseText.split('~');

				if(elements.length > 5) {
					try {
						stockInfo = {
							stockOpenPrice: parseFloat(elements[5]).toFixed(2),
							stockClosePrice: parseFloat(elements[4]).toFixed(2),
							stockCurrPrice: parseFloat(elements[3]).toFixed(2),
							stockMaxPrice: parseFloat(elements[33]).toFixed(2),
							stockMinPrice: parseFloat(elements[34]).toFixed(2),
							stockVolume: 0,//(parseInt(elements[11]) / 100).toFixed(),
							stockTurnover:0,// (parseInt(elements[12]) / 10000).toFixed(),
							stockLastDate: elements[30],
							stockLastTime: elements[30],
							stockChangeAmt: "0.00",
							stockChangeRate: "0.00"
						}
						
						if (stockInfo.stockOpenPrice != 0) {
							stockInfo.stockChangeAmt = parseFloat(stockInfo.stockCurrPrice - stockInfo.stockClosePrice).toFixed(2);
							stockInfo.stockChangeRate = (parseFloat(stockInfo.stockChangeAmt / stockInfo.stockClosePrice)*100).toFixed(2);
						}
						
						stockName = elements[1];
					} catch(e) { 
						console.error(e); 
						console.log(elements);
					}
				}
				delete elements;
				
				if (typeof f == "function") {
					f(stockInfo, stockName);
				}
				if ( stockInfo == undefined ) delete stockInfo;
			}
			
			delete xhr;
		}
		xhr.send();
	} catch(e) { console.error(e); }
};