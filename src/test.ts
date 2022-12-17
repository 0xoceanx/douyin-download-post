import axios from "axios";
// set proxy for axios
let headers = [
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
  "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
  "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
  "Mozilla/5.0 (compatible; DuckDuckBot/1.0; +http://duckduckgo.com/duckduckbot.html)",
  "Mozilla/5.0 (compatible; Sogou web spider/4.0; +http://www.sogou.com/docs/help/webmasters.htm#07)",
  "Mozilla/5.0 (compatible; Exabot/3.0; +http://www.exabot.com/go/robot)",
  "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)",
  "Mozilla/5.0 (compatible; SemrushBot/3~bl; +http://www.semrush.com/bot.html)",
  "Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://www.majestic12.co.uk/bot.php?+)",
];

async function ss() {
  await axios({
    method: "get",
    url: "https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=7044102463611342084",
    headers: {
      "User-Agent": headers[Math.floor(Math.random() * headers.length)],
			'Accept-Encoding':'*' 
    },
		timeout:10000,
  }).then((res) => {
    console.log(res.data);
  });
} //ip.addr == 123.1.1.1/8 || ip.addr ==124.1.1.1/8

ss()
