const sanitize = require("sanitize-filename");
import { chromium } from 'playwright';
import { writeFileSync, readFileSync, readdirSync, mkdirSync, createWriteStream } from 'fs';
import axios from 'axios';
import { finished } from 'stream';

// Description: scrape video from douyin by user page url
// config : config/config.json
// usage : npm run compile
// naming rule : author - description - <i> . [jpg/mp4]
// BUG catch error and log
// BUG maybe desc and tag is same so will miss some video. this can fixed by add aweme_id but it look ugly so not a option ;(
// BUG some video can't be resovled by iesdouyin.com
// BUG windows max length limit


var save_dir = 'E:\\NSFW\\';
var cookies = '__ac_signature=_02B4Z6wo00f01y00zYgAAIDAboxoUMv5wdMtFMkAAKiT98; __ac_referer=__ac_blank'
class Video {
	aweme_id: string = "";
	urls: string[] = [];
	url: string = "";
	name: string = "";
	description: string = "";
	type: string = "";
	constructor() {
	}
}
var downloading: number = 0;
// var headers = [
// 	"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
// 	"Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
// 	"Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
// 	"Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
// 	"Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
// 	"Mozilla/5.0 (compatible; DuckDuckBot/1.0; +http://duckduckgo.com/duckduckbot.html)",
// 	"Mozilla/5.0 (compatible; Sogou web spider/4.0; +http://www.sogou.com/docs/help/webmasters.htm#07)",
// 	"Mozilla/5.0 (compatible; Exabot/3.0; +http://www.exabot.com/go/robot)",
// 	"Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)",
// 	"Mozilla/5.0 (compatible; SemrushBot/3~bl; +http://www.semrush.com/bot.html)",
// 	"Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://www.majestic12.co.uk/bot.php?+)",
// ]; // bypass anti-spider


function init() {
	// create folder and file if not exists
	let files = readdirSync(`./`);
	if (!files.includes("videos")) {
		mkdirSync(`./videos`);
	}
	if (!files.includes("config")) {
		mkdirSync(`./config`);
		mkdirSync(`./config/config.json`);
	}
	if (!files.includes("log")) {
		mkdirSync(`./log`);
		mkdirSync(`./log/error.log`);
	}

}

function get_config() {
	const PATH = "./config/config.json"
	// read config from file
	const config = JSON.parse(readFileSync(PATH, 'utf8'))
	return config['target'];
}

// download video and save as name
function download(video: Video) {
	// check if folder exists
	let folders = readdirSync(`${save_dir}`);
	let dir = sanitize(video.name);
	if (!folders.includes(dir)) {
		console.log(`${save_dir}${dir}`)
		mkdirSync(`${save_dir}${dir}`);
	}
	let target_folder = readdirSync(`${save_dir}${dir}`);
	// check if file exists
	let file_name = sanitize(video.name + " - " + video.description + ".mp4");
	let file_name2 = sanitize(video.name + " - " + video.description + " - 1.jpg");
	if (target_folder.includes(file_name) || target_folder.includes(file_name2)) {
		console.log("file exists " + file_name);
		return;
	}
	if (video.type == "error") {
		return;
	}
	// if is video write file
	if (video.type == "video") {
		downloading++;
		axios.get(video.url, { responseType: 'stream' }).then((res) => {
			res.data.pipe(createWriteStream(`${save_dir}${dir}/${file_name}`))
			console.log("downloaded " + file_name);
			downloading--;
		}).catch((err) => {
			writeFileSync("./log/error.log", video.url + " " + err + "\n", { flag: 'a' })
		});
	} else {
		for (let i = 0; i < video.urls.length; i++) {
			downloading++;
			// file_name2 = sanitize(video.name + " - " + video.description + " - " + video.aweme_id + " - " + i + ".jpg");
			file_name2 = sanitize(video.name + " - " + video.description + " - " + i + ".jpg");
			let img_stream = createWriteStream(`${save_dir}${dir}/${file_name2}`); //XXX img_stream should create out of then() otherwise will write to incorrect file
			//use closure to give correct stream and name
			(function (file_name2, img_stream) {
				axios.get(video.urls[i], { responseType: 'stream' }).then((res) => { // 
					res.data.pipe(img_stream)
					finished(img_stream, (err) => {
						if (err) {
							writeFileSync("./log/error.log", video.urls[i] + " " + err + "\n", { flag: 'a' })
						} else {
							console.log("downloaded " + file_name2);
						}
					})
					downloading--;
				}).catch((err) => {
					writeFileSync("./log/error.log", video.urls[i] + " " + err + "\n", { flag: 'a' })
				});
			})(file_name2, img_stream);
		}
	}
}


async function get_video_info(id: string) {
	// get video info from api
	const api_url: string = `https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id=${id}&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333`;
	// send request to api_url
	let video = new Video(); //FIXME issue: axios is broken [https://github.com/harlan-zw/unlighthouse/issues/42]
	// use bot user-agent will cause html problem , some link will not show in the <a>
	await axios.get(api_url, { headers: { "Accept-Encoding": 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', Cookie: cookies } })
		.then((res) => {
			const data = res.data;
			if (data.aweme_detail.images != null) { // images
				for (let i = 0; i < data.aweme_detail.images.length; i++) {
					video.urls.push(data.aweme_detail.images[i].url_list[3])
				}
			}
			video.url = data.aweme_detail.video.play_addr.url_list[0].replace(/playwm/, "play");
			video.name = data.aweme_detail.author.nickname;
			video.description = data.aweme_detail.desc;
			video.aweme_id = data.aweme_detail.aweme_id;
		}).catch((err) => {
			video.type = "error";
			writeFileSync("./log/error.log", err + "\n", { flag: 'a' });
		});
	return video;
}


async function main() {
	init()
	var downloading = 0;
	// headers for bypass anti-spider
	let urls = get_config();
	// lanuch browser and go to the url 
	// let browser = await chromium.launch({ headless: false, args: ['--disable-web-security', '--disable-site-isolation-trials'], });
	let context = await chromium.launchPersistentContext('', { headless: true, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36', viewport: { width: 1200, height: 900 }, args: ['--disable-web-security', '--disable-site-isolation-trials'], bypassCSP: true });
	let page = await context.newPage();
	let count = 0;
	for (let i = 0; i < urls.length; i++) {
		// visit url 
		await page.goto(urls[i]);
		// scroll down to load more videos until there's no more videos
		await page.waitForTimeout(5000);
		while (true) {
			await page.evaluate(() => {
				window.scrollTo(0, document.body.scrollHeight);
			});
			await page.waitForTimeout(1000);
			let no_more = await page.evaluate(() => {
				return document.querySelector("#douyin-right-container > div._bEYe5zo > div > div > div:nth-child(2) > div.mwo84cvf > div.wwg0vUdQ > div.UFuuTZ1P > div > div")!.textContent == '暂时没有更多了';
			});
			if (no_more) {
				break;
			}
		}
		// get all video urls
		let video_urls = await page.evaluate(() => {
			let video_urls = [];
			// <HTMLAnchorElement[]><unknown>
			let video_nodes = document.querySelector("#douyin-right-container > div._bEYe5zo > div > div > div:nth-child(2) > div.mwo84cvf > div.wwg0vUdQ > div.UFuuTZ1P > ul")!.children;
			for (let i = 0; i < video_nodes.length; i++) {
				let link = video_nodes[i].children[0];
				if (link != null) {
					video_urls.push(link.getAttribute("href"));
				}
			}

			return video_urls;
		});
		// get author name 
		let author_name = await page.evaluate(() => {
			return document.querySelector("#douyin-right-container > div._bEYe5zo > div > div > div.x2yFtBWw.Ll07vpAQ > div.p6_XFKN2 > div.HqxPzh_q > h1 > span > span > span > span > span > span")!.textContent;
		});
		// save video urls to file
		writeFileSync(`./config/${sanitize(author_name)}.json`, JSON.stringify(video_urls, null, 2));
	}

	// get file list in config folder
	let files = readdirSync("./config");
	for (let i = 0; i < files.length; i++) {
		// if file is a json file and not config.json
		if (files[i].endsWith(".json") && files[i] != "config.json") {
			// read video urls from file
			let video_urls = JSON.parse(readFileSync(`./config/${files[i]}`).toString());
			for (let j = 0; j < video_urls.length; j++) {
				// get video info from api
				let video;
				let tmp = video_urls[j].split("/");
				if (!video_urls[j].includes('note')) {
					video = await get_video_info(tmp[2]);
					video.type = "video";
				} else { // image url
					video = await get_video_info(tmp[4]);
					video.type = "image";
				}
				// console.log(count++, video.name, video.description)
				// download video
				download(video);
			}

		}
	}
	// after all download finished
	while (downloading) {
		await page.waitForTimeout(1000);
	}
	// close browser 
	console.log('close browser');
	await context.close();
}


main();


