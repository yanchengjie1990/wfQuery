var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    querystring = require("querystring");

var list = JSON.parse( fs.readFileSync( "mzd.json", 'utf-8') ),
    trim = function(str){
        return (str+"").replace(/^\s*(.*?)\s*$/,'$1')
    };

http.createServer(function (req, resp){
    var repeat = 0,
        res = querystring.parse( url.parse(req.url).query );
        resp.writeHead(200, {"Content-Type": 'application/javascript'});
    
    if(req.url.toString() === "/favicon.ico"){
        var expires = new Date();
        expires.setFullYear( expires.getFullYear() + 1 );
        resp.writeHead(200, {"Content-Type": 'image/x-icon',"Expires": expires});
        resp.end("");
    }else{
        var name = trim( decodeURIComponent(res.name) ),
            phone = trim( decodeURIComponent(res.phone) ),
            car = trim( decodeURIComponent(res.car) ),
            sheng = trim( decodeURIComponent(res.sheng) ),
            city = trim( decodeURIComponent(res.city) ),
            time = +new Date;

        res.success = true;
        if( res.call_all_order_list ){
            res.list = list;
        }else if( res.call_list_length ){
            res.callback = "show_order_num";
            res.length = Object.keys(list).length;
        }else if( name && phone && car && sheng && city ){
            res.success = false;
            if( list[ phone ] ){
                res.error = "该电话号码已经注册";
            }else if( !/^\d{7,11}$/.test(phone) ){
                res.error = "电话号码需要是7~11位纯数字";
            }else{
                res.success = true;
                list[ phone ] = {
                    name: name,
                    car: car,
                    sheng: sheng,
                    city: city,
                    time: time
                };
            }
        }else{
            res.success = false;
            res.error = "请填写姓名和电话并选择车系以及地区和经销商！";
        }
        out( res, resp );
    }
}).listen(8974);

function out(res, resp){
    resp.end( (res.callback || "callback") + '('+JSON.stringify(res)+');' );
}

function saveList(){
    fs.writeFile( "mzd.json", JSON.stringify(list,null,4) );
    setTimeout(saveList, 1000*60*2);
}
saveList();
