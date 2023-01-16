"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var sanitize = require("sanitize-filename");
var playwright_1 = require("playwright");
var fs_1 = require("fs");
var axios_1 = require("axios");
var stream_1 = require("stream");
// Description: scrape video from douyin by user page url
// config : config/config.json
// usage : npm run compile
// naming rule : author - description - <i> . [jpg/mp4]
// BUG catch error and log
// BUG maybe desc and tag is same so will miss some video. this can fixed by add aweme_id but it look ugly so not a option ;(
// BUG some video can't be resovled by iesdouyin.com
// BUG windows max length limit
var save_dir = 'E:\\NSFW\\';
var cookies = '__ac_signature=_02B4Z6wo00f01y00zYgAAIDAboxoUMv5wdMtFMkAAKiT98; __ac_referer=__ac_blank';
var Video = /** @class */ (function () {
    function Video() {
        this.aweme_id = "";
        this.urls = [];
        this.url = "";
        this.name = "";
        this.description = "";
        this.type = "";
    }
    return Video;
}());
var downloading = 0;
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
    var files = (0, fs_1.readdirSync)("./");
    if (!files.includes("videos")) {
        (0, fs_1.mkdirSync)("./videos");
    }
    if (!files.includes("config")) {
        (0, fs_1.mkdirSync)("./config");
        (0, fs_1.mkdirSync)("./config/config.json");
    }
    if (!files.includes("log")) {
        (0, fs_1.mkdirSync)("./log");
        (0, fs_1.mkdirSync)("./log/error.log");
    }
}
function get_config() {
    var PATH = "./config/config.json";
    // read config from file
    var config = JSON.parse((0, fs_1.readFileSync)(PATH, 'utf8'));
    return config['target'];
}
// download video and save as name
function download(video) {
    // check if folder exists
    var folders = (0, fs_1.readdirSync)("".concat(save_dir));
    var dir = sanitize(video.name);
    if (!folders.includes(dir)) {
        console.log("".concat(save_dir).concat(dir));
        (0, fs_1.mkdirSync)("".concat(save_dir).concat(dir));
    }
    var target_folder = (0, fs_1.readdirSync)("".concat(save_dir).concat(dir));
    // check if file exists
    var file_name = sanitize(video.name + " - " + video.description + ".mp4");
    var file_name2 = sanitize(video.name + " - " + video.description + " - 1.jpg");
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
        axios_1["default"].get(video.url, { responseType: 'stream' }).then(function (res) {
            res.data.pipe((0, fs_1.createWriteStream)("".concat(save_dir).concat(dir, "/").concat(file_name)));
            console.log("downloaded " + file_name);
            downloading--;
        })["catch"](function (err) {
            (0, fs_1.writeFileSync)("./log/error.log", video.url + " " + err + "\n", { flag: 'a' });
        });
    }
    else {
        var _loop_1 = function (i) {
            downloading++;
            // file_name2 = sanitize(video.name + " - " + video.description + " - " + video.aweme_id + " - " + i + ".jpg");
            file_name2 = sanitize(video.name + " - " + video.description + " - " + i + ".jpg");
            var img_stream = (0, fs_1.createWriteStream)("".concat(save_dir).concat(dir, "/").concat(file_name2)); //XXX img_stream should create out of then() otherwise will write to incorrect file
            //use closure to give correct stream and name
            (function (file_name2, img_stream) {
                axios_1["default"].get(video.urls[i], { responseType: 'stream' }).then(function (res) {
                    res.data.pipe(img_stream);
                    (0, stream_1.finished)(img_stream, function (err) {
                        if (err) {
                            (0, fs_1.writeFileSync)("./log/error.log", video.urls[i] + " " + err + "\n", { flag: 'a' });
                        }
                        else {
                            console.log("downloaded " + file_name2);
                        }
                    });
                    downloading--;
                })["catch"](function (err) {
                    (0, fs_1.writeFileSync)("./log/error.log", video.urls[i] + " " + err + "\n", { flag: 'a' });
                });
            })(file_name2, img_stream);
        };
        for (var i = 0; i < video.urls.length; i++) {
            _loop_1(i);
        }
    }
}
function get_video_info(id) {
    return __awaiter(this, void 0, void 0, function () {
        var api_url, video;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api_url = "https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id=".concat(id, "&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333");
                    video = new Video();
                    // use bot user-agent will cause html problem , some link will not show in the <a>
                    return [4 /*yield*/, axios_1["default"].get(api_url, { headers: { "Accept-Encoding": 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', Cookie: cookies } })
                            .then(function (res) {
                            var data = res.data;
                            if (data.aweme_detail.images != null) { // images
                                for (var i = 0; i < data.aweme_detail.images.length; i++) {
                                    video.urls.push(data.aweme_detail.images[i].url_list[3]);
                                }
                            }
                            video.url = data.aweme_detail.video.play_addr.url_list[0].replace(/playwm/, "play");
                            video.name = data.aweme_detail.author.nickname;
                            video.description = data.aweme_detail.desc;
                            video.aweme_id = data.aweme_detail.aweme_id;
                        })["catch"](function (err) {
                            video.type = "error";
                            (0, fs_1.writeFileSync)("./log/error.log", err + "\n", { flag: 'a' });
                        })];
                case 1:
                    // use bot user-agent will cause html problem , some link will not show in the <a>
                    _a.sent();
                    return [2 /*return*/, video];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var downloading, urls, context, page, count, i, no_more, video_urls, author_name, files, i, video_urls, j, video, tmp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    init();
                    downloading = 0;
                    urls = get_config();
                    return [4 /*yield*/, playwright_1.chromium.launchPersistentContext('', { headless: true, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36', viewport: { width: 1200, height: 900 }, args: ['--disable-web-security', '--disable-site-isolation-trials'], bypassCSP: true })];
                case 1:
                    context = _a.sent();
                    return [4 /*yield*/, context.newPage()];
                case 2:
                    page = _a.sent();
                    console.log(context.pages.length);
                    count = 0;
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < urls.length)) return [3 /*break*/, 14];
                    // visit url 
                    return [4 /*yield*/, page.goto(urls[i])];
                case 4:
                    // visit url 
                    _a.sent();
                    // scroll down to load more videos until there's no more videos
                    return [4 /*yield*/, page.waitForTimeout(5000)];
                case 5:
                    // scroll down to load more videos until there's no more videos
                    _a.sent();
                    _a.label = 6;
                case 6:
                    if (!true) return [3 /*break*/, 10];
                    return [4 /*yield*/, page.evaluate(function () {
                            window.scrollTo(0, document.body.scrollHeight);
                        })];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, page.waitForTimeout(1000)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            return document.querySelector("#douyin-right-container > div._bEYe5zo > div > div > div:nth-child(2) > div.mwo84cvf > div.wwg0vUdQ > div.UFuuTZ1P > div > div").textContent == '暂时没有更多了';
                        })];
                case 9:
                    no_more = _a.sent();
                    if (no_more) {
                        return [3 /*break*/, 10];
                    }
                    return [3 /*break*/, 6];
                case 10: return [4 /*yield*/, page.evaluate(function () {
                        var video_urls = [];
                        // <HTMLAnchorElement[]><unknown>
                        var video_nodes = document.querySelector("#douyin-right-container > div._bEYe5zo > div > div > div:nth-child(2) > div.mwo84cvf > div.wwg0vUdQ > div.UFuuTZ1P > ul").children;
                        for (var i_1 = 0; i_1 < video_nodes.length; i_1++) {
                            var link = video_nodes[i_1].children[0];
                            if (link != null) {
                                video_urls.push(link.getAttribute("href"));
                            }
                        }
                        return video_urls;
                    })];
                case 11:
                    video_urls = _a.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            return document.querySelector("#douyin-right-container > div._bEYe5zo > div > div > div.x2yFtBWw.Ll07vpAQ > div.p6_XFKN2 > div.HqxPzh_q > h1 > span > span > span > span > span > span").textContent;
                        })];
                case 12:
                    author_name = _a.sent();
                    // save video urls to file
                    (0, fs_1.writeFileSync)("./config/".concat(sanitize(author_name), ".json"), JSON.stringify(video_urls, null, 2));
                    _a.label = 13;
                case 13:
                    i++;
                    return [3 /*break*/, 3];
                case 14:
                    files = (0, fs_1.readdirSync)("./config");
                    i = 0;
                    _a.label = 15;
                case 15:
                    if (!(i < files.length)) return [3 /*break*/, 23];
                    if (!(files[i].endsWith(".json") && files[i] != "config.json")) return [3 /*break*/, 22];
                    video_urls = JSON.parse((0, fs_1.readFileSync)("./config/".concat(files[i])).toString());
                    j = 0;
                    _a.label = 16;
                case 16:
                    if (!(j < video_urls.length)) return [3 /*break*/, 22];
                    video = void 0;
                    tmp = video_urls[j].split("/");
                    if (!!video_urls[j].includes('note')) return [3 /*break*/, 18];
                    return [4 /*yield*/, get_video_info(tmp[2])];
                case 17:
                    video = _a.sent();
                    video.type = "video";
                    return [3 /*break*/, 20];
                case 18: return [4 /*yield*/, get_video_info(tmp[4])];
                case 19:
                    video = _a.sent();
                    video.type = "image";
                    _a.label = 20;
                case 20:
                    // console.log(count++, video.name, video.description)
                    // download video
                    download(video);
                    _a.label = 21;
                case 21:
                    j++;
                    return [3 /*break*/, 16];
                case 22:
                    i++;
                    return [3 /*break*/, 15];
                case 23:
                    if (!downloading) return [3 /*break*/, 25];
                    return [4 /*yield*/, page.waitForTimeout(1000)];
                case 24:
                    _a.sent();
                    return [3 /*break*/, 23];
                case 25:
                    // close browser 
                    console.log('close browser');
                    return [4 /*yield*/, context.close()];
                case 26:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
