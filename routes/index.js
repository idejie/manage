var crypto = require('crypto'),
    User = require('../model/user.js'),
    Electric = require('../model/electric.js');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  Electric.get(null,function(err,electrics){
  	if (err) {
  		electrics=[];
  	}
  	res.render('index', {
    title: '主页',
    electrics:electrics,
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
  });
  
});
/* GET 登录 */
router.get('/login', checkNotLogin);
router.get('/login',function(req,res,next){
  res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
});
/* POST 登录 */
router.post('/login', checkNotLogin);
router.post('/login', function (req, res,next) {
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  //检查用户是否存在
  User.get(req.body.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!'); 
      return res.redirect('/login');//用户不存在则跳转到登录页
    }
    //检查密码是否一致
    if (user.password != password) {
      req.flash('error', '密码错误!'); 
      return res.redirect('/login');//密码错误则跳转到登录页
    }
    //用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    req.flash('success', '登陆成功!');
    res.redirect('/');//登陆成功后跳转到主页
  });
});
/* GET 注册 */
router.get('/reg', checkNotLogin);
router.get('/reg',function(req,res,next){
  res.render('reg', {
    title: '注册',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
/* POST 注册 */
router.post('/reg', checkNotLogin);
router.post('/reg', function (req, res,next) {
  var name = req.body.name,
      password = req.body.password,
      password_re = req.body['password-repeat'];
  //检验用户两次输入的密码是否一致
  if (password_re != password) {
    req.flash('error', '两次输入的密码不一致!'); 
    return res.redirect('/reg');//返回注册页
  }
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
      name: name,
      password: password,
      email: req.body.email
      });
  //检查用户名是否已经存在 
  User.get(newUser.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', '用户已存在!');
      return res.redirect('/reg');//返回注册页
    }
    //如果不存在则新增用户
    newUser.save(function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');//注册失败返回主册页
      }
      req.session.user = newUser;//用户信息存入 session
      req.flash('success', '注册成功!');
      res.redirect('/');//注册成功后返回主页
    });
  });
});
/* GET 登出 */
router.get('/logout', checkLogin);
router.get('/logout',function(req,res,next){
	req.session.user = null;
  	req.flash('success', '登出成功!');
  	res.redirect('/');//登出成功后跳转到主页
});
/* GET 电费记录 */
router.get('/electric', checkLogin);
router.get('/electric',function(req,res,next){
  Electric.get(null, function (err, electrics) {
    if (err) {
      electrics = [];
    } 
    res.render('index', {
      title: '主页',
      user: req.session.user,
      electrics: electrics,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });res.render('electric', {
      title: '电费记录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
});
/*POST 电费记录 */
//router.post('/electric', checkLogin);
router.post('/electric', checkLogin, function (req, res,next) {
    console.log('*****');
  console.log(electric);

  var currentUser = req.session.user,
      electric = new Electric(currentUser.name, req.body.area, req.body.unit,req.body.name,req.body.start,req.body.end,req.body.price);
      
  console.log('*****');
  console.log(electric);
  electric.save(function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    req.flash('success', '上传电费成功!');
    res.redirect('/');//发表成功跳转到主页
  });
});
/* GET 水费记录 */
router.get('/water',function(req,res,next){
  res.render('water', { title: '水费记录' });
});
/*POST 水费记录 */
router.post('/water', checkLogin);
router.post('/water', function (req, res,next) {
  
});
/* GET 物业费记录 */
router.get('/manage',function(req,res,next){
  res.render('manage', { title: '物业费记录' });
});
/*POST 物业费记录 */
router.post('/manage', checkLogin);
router.post('/manage', function (req, res,next) {
  
});
function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!'); 
      res.redirect('/login');
    }
    console.log('checkLogin');
    next();
  }
function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录!'); 
      res.redirect('back');
    }
    next();
  }

module.exports = router;
