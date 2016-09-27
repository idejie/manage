var mongodb = require('./db');

function Electric(author,area, unit,name,start,end,price ) {
  this.author=author;
  this.area = area;
  this.unit = unit;
  this.name = name;
  this.start = start;
  this.end = end;
  this.price = price;
}

module.exports = Electric;
//存储一条电费信息
Electric.prototype.save = function(callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
  //要存入数据库的文档
  var electric = {
  	  author: this.author,
      area: this.area,
      time: time,
      unit: this.unit,
      name: this.name,
      start: this.start,
      end: this.end,
      price: this.price
  };
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 electrics 集合
    db.collection('electrics', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //将信息插入 electrics 集合
      collection.insert(electric, {
        safe: true
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err
        }
        callback(null);//返回 err 为 null
      });
    });
  });
};

//读取电费信息
Electric.get = function(name, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取electrics 集合
    db.collection('electrics', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      //根据 query 对象查询电费
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err
        }
        callback(null, docs);//成功！以数组形式返回查询的结果
      });
    });
  });
};