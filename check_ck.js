/*
删除/禁用过期COOKIE
更新时间：2021-8-14
*/
// */13 * * * * https://raw.githubusercontent.com/suoloo/WuHu/main/check_ck.js

const fs = require("fs");
const request = require("request");
const $ = new Env('CK检测');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
const CheCK = process.env.JD_COOKIE ?? ""
const Check_ck =  process.env.Check_ck
const Version = process.env.Version
const notify = $.isNode() ? require('./sendNotify') : '';
let token = '';
let ckdataArr = [],
    ckdata = '';
let ckid = "";
let QL_env ="";
message = ""
!(async () => {
    if (Check_ck=="Del"){
        console.log(`\n注意：‼️‼️你设置的是检测并删除过期COOKIE‼️‼️\n\n`);
    }else {
        console.log("\n\n默认禁用过期COOKIE，若想删除过期COOKIE，设置变量【export Check_ck=\"Del\"】\n仅检测已启用的COOKIE\n");
    }
    if (!Version){
        console.log("❗️未设置版本❗️,变量为【export Version=\"2.2\"】#2.2的就写2.2，2.8以上就写2.8");
        return
    }else{
        if (Version==2.8){
            QL_env="envs";
            console.log(`你的青龙版本：V2.8`);
        }
        if (Version==2.2){
            QL_env="cookies";
            console.log(`你的青龙版本：V2.2`);

        }
    }

    GetToken();
    await $.wait(1000);
    await Getckdata();

    for (let i = 0; i < ckdataArr.data.length; i++) {
        ckdata = ckdataArr.data[i];
        ckid = ckdata._id;
        ckdata = ckdata.value;
        $.UserName = decodeURIComponent(ckdata.match(/pt_pin=([^; ]+)(?=;?)/) && ckdata.match(/pt_pin=([^; ]+)(?=;?)/)[1])
        $.index = i + 1;
        if(CheCK && CheCK.indexOf(ckdata)!=-1){
            getUA();
            //console.log(ckdataid);
            $.nickName = '';
            await TotalBean();
            await $.wait(1000);
        }else {
            $.UserName2 = decodeURIComponent(ckdata.match(/pt_pin=([^; ]+)(?=;?)/) && ckdata.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            console.log(`\n*****检测序号【${$.index}】【${$.UserName2}】*****\n`);
            console.log(`禁用状态，已跳过检测`);
        }

    }
    await $.wait(1000);
    if ($.isNode()) {
        if (message.length!=0) {
            await notify.sendNotify("❗️❗️检测通知❗️❗️", `${message}吹水群聊：https://t.me/oWuHu`);
        }
    }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

function GetToken() {
    const fs = require('fs');
    const path=`../config/auth.json`;
    fs.readFile(path, function (err, data) {
        if (err) {
            console.log(err);
            console.log(`‼️获取失败,路径错误‼️，默认变量为【export QL_DIR=\\"/ql\\"】#一般不是/ql就是/QL‼️`);
            return;
        } else {
            let auth = data.toString();
            auth = JSON.parse(auth);
            token = `Bearer ${auth.token}`;
            //console.log(token);
        }
    });
}
function Getckdata() {
    return new Promise(resolve => {
        $.get({
            url: `http://127.0.0.1:5600/api/${QL_env}`,
            headers: {
                'User-Agent': $.UA,
                'Authorization': token,
            }

        }, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`‼️‼️获取失败‼️‼️`)
                    return
                } else {
                    //console.log(`获取成功🎉:成功`);
                    ckdataArr = JSON.parse(data);
                    //console.log(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function delEnv() {
    return new Promise(resolve => {
        const request = require("request");
        const options = {
            url: `http://127.0.0.1:5600/api/${QL_env}`,
            headers: {
                'User-Agent': $.UA,
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': token,
            },
            body:`["${ckid}"]`
        }
        request.delete(options, (err, resp, data) => {
            console.log(`❗️删除成功❗️`);
            message += `原序号：${$.index}   【${$.UserName}】\n帐号状态：已失效\n处理方式：❌删除❌\n\n`;
        })
    })
}

function disEnv() {
    return new Promise(resolve => {
        const request = require("request");
        const options = {
            url: `http://127.0.0.1:5600/api/${QL_env}/disable`,
            headers: {
                'User-Agent': $.UA,
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': token,
            },
            body:`["${ckid}"]`
        }
        request.put(options, (err, resp, data) => {
            console.log(`⚠️禁用成功⚠️`);
            message += `原序号：${$.index}   【${$.UserName}】\n帐号状态：已失效\n处理方式：⚠️禁用⚠️\n\n`;
        })
    })
}

async function TotalBean() {
    return new Promise(resolve => {
        const options = {
            url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
            headers: {
                'Host': "me-api.jd.com",
                'User-Agent': $.UA,
                'Cookie': ckdata,
                "Accept-Language": "zh-cn",
                "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
                "Accept-Encoding": "gzip, deflate, br",
                'Connection': 'keep-alive',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
            }
        }
        $.get(options,  (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['retcode'] === "1001") {
                            console.log(`\n*****检测序号【${$.index}】【${$.nickName || $.UserName}】*****\n`);
                            console.log(`❗️失效账号❗️`);
                            //console.log(`❗️禁用成功❗️`);
                            if (Check_ck == "Del") {
                                delEnv();
                                //await notify.sendNotify(`${$.name}`, `原序号${$.index} ${$.UserName}\n‼️‼️已过期删除‼️‼️`);
                            } else {

                                //await  notify.sendNotify(`${$.name}`, `原序号${$.index} ${$.UserName}\n‼️‼️已过期禁用‼️‼️`);
                                disEnv();
                            }
                        }
                        if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
                            $.nickName = data.data.userInfo.baseInfo.nickname;
                            console.log(`\n*****检测序号【${$.index}】【${$.nickName || $.UserName}】*****\n`);
                            console.log(`🎉有效账号🎉`);
                        }
                    } else {
                        console.log(`\n*****检测序号【${$.index}】【${$.nickName || $.UserName}】*****\n`);
                        $.log('京东服务器返回空数据，跳过检测');
                    }
                }
            } catch (e) {
                $.logErr(e)
            } finally {
                resolve();
            }
        })
    })
}

function getUA(){
    $.UA = `jdapp;iPhone;10.0.10;14.3;${randomString(40)};network/wifi;model/iPhone12,1;addressid/4199175193;appBuild/167741;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`
}
function randomString(e) {
    e = e || 32;
    let t = "abcdef0123456789", a = t.length, n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}


