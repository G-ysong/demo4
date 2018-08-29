var express = require('express')
var User = require('./models/user')
var md5 = require('blueimp-md5')  //引用md5包来对密码进行加密

var router = express.Router()  //设置一个路由

router.get('/', function (req, res) {
    res.render('index.html', {
        user: req.session.user
    })
})

router.get('/login', function (req, res) {
    res.render('login.html')
})

router.post('/login', function (req, res) {
    var body = req.body
    User.findOne({
        email: body.email,
        password: md5(md5(body.password))
    }, function (err, user) {
        if (err) return next(err)
        if (!user) {
            return res.status(200).json({
                err_code: 1,
                message: '邮箱或密码错误'
            })
        }

        // 用户存在，登陆成功，通过 Session 记录登陆状态
        req.session.user = user
        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    })
})

router.get('/register', function (req, res) {
    res.render('register.html')
})
router.post('/register', function (req, res) {
    /**
     * 1.获取表单数据 req.body
     * 2.操作数据库
     * 3.发送响应
     */
    var body = req.body
    User.findOne({
        $or: [
            {email: body.email},
            {nickname: body.nickname}
        ]
    }, function (err, data) {
        /*if (err){
            return res.status(500).json({
                err_code: 500,
                message: '服务端错误'
            })
        }*/
        if (err) return next(err)
        if (data) {
            if (data.email === body.email) {
                return res.status(200).json({
                    err_code: 1,
                    message: '邮箱已经存在!!!'
                })
                /*return res.render('register.html', {
                    err_message: '邮箱已被使用',
                    form: body
                })*/
            }
            if (data.nickname === body.nickname) {
                return res.status(200).json({
                    err_code: 2,
                    message: '昵称已经存在!!!'
                })
                /*return res.render('register.html', {
                    err_message: '昵称已被使用',
                    form: body
                })*/
            }
        }
        //用md5对密码重复加密
        body.password = md5(md5(body.password))
        new User(body).save(function (err, user) {
            if (err) next(err)
            res.status(200).json({
                err_code: 0,
                message: '注册成功!'
            })
        })

    })
})

router.get('/logout', function (req, res) {
    delete req.session.user
    res.redirect('/login')
})
/*====================账户设置====================*/
router.get('/settings/admin', function (req, res) {
    var user = req.session.user
    if (user) {
        res.render('./settings/admin.html', {
            user: user
        })
    } else {
        res.redirect('/login')
    }

})
router.post('/settings/admin', function (req, res) {
    var body = req.body
    if (body.newPassword !== body.confirmPassword) {
        return res.render('./settings/admin.html', {
            message: '两次输入密码不一致！',
            user: req.session.user.email
        })
    }
    User.findOne({
        email: req.session.user.email,
        password: md5(md5(body.currentPassword))
    }, function (err, data) {
        if (err) return next(err)
        console.log(data)
        if (data) return data
        return res.render('./settings/admin.html', {
            message: '当前密码输入有误！',
            user: req.session.user.email
        })

    })
    .then(function (data) {
        User.findOneAndUpdate({
            password: data.password
        }, {
            password: md5(md5(body.newPassword))
        }, function (err, data) {
            if (err) return next(err)
            res.redirect('/login')
        })
    })
})

/*====================账户设置====================*/

/*====================基本信息====================*/
router.get('/settings/profile', function (req, res) {
    var user = req.session.user
    if (user) {
        res.render('./settings/profile.html', {
            user: req.session.user
        })
    } else {
        res.redirect('/login')
    }
})

router.post('/settings/profile', function (req, res) {
    var body = req.body
    User.findOneAndUpdate({
        email: body.email
    },{
        nickname: body.nickname,
        bio: body.bio,
        gender: body.gender,
        birthday: body.birthday
    }, function (err, data) {
        var user = data
        if (err) return next(err)
        req.session.user = user
        res.render('./settings/profile.html', {
            user: user
        })
    })
})

/*====================基本信息====================*/

/*====================删除账户====================*/
router.get('/deleteUser', function (req, res) {
    var user = req.session.user
    User.findOneAndDelete({
        email: user.email
    }, function (err, data) {
        if (err) return next(err)
        res.redirect('/login')
    })
})
/*====================删除账户====================*/
module.exports = router