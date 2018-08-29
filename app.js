var express  =require('express')
var path = require('path')   //路径操作模块
var bodyParser = require('body-parser')
var session = require('express-session')
var router = require('./routes')


var app = express()

app.use('/public', express.static(path.join(__dirname, './public/')))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))

app.engine('html', require('express-art-template'))
app.set('views', path.join(__dirname, './views/'))

/*====================配置表单POST请求插件====================*/
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
/*====================配置表单POST请求插件====================*/

app.use(session({
    // 配置加密字符串，它会在原有加密基础之上和这个字符串拼起来去加密
    // 目的是为了增加安全性，防止客户端恶意伪造
    secret: 'itcast',
    resave: false,
    saveUninitialized: false // 无论你是否使用 Session ，我都默认直接给你分配一把钥匙
}))

app.use(router)   //把路由挂载到app

/*====================配置中间件====================*/
app.use(function (req, res) {
    res.render('404.html')
})

app.use(function (err, req, res, next) {
    res.send(err.message)
})

/*====================配置中间件====================*/
app.listen(3000, function () {
    console.log('running....')
})