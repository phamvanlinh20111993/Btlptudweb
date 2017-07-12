var express = require('express')
var path = require('path')
var app = express()
var multipart  = require('connect-multiparty')//upload file dung connect-multiparty
var multipartMiddleware = multipart()
var router = express.Router()
var server = require('http').createServer(app)  
var io = require('socket.io')(server)
var models = require('../models/user')
var models1 = require('../models/message')
var models2 = require('../models/warning')
var models3 = require('../models/ban')
var md5 = require('md5')
var fs = require('fs');


//che bien lai du lieu tra ve danh sach nguoi bi canh bao
//tham so dau vao la data-mang object chua thong tin nguoi bi canh bao
function To_process_data_warning(data)
{
	var index = 0, length = data.length, id_temp, count = 0;
	var List_warn = []

	//khoi tao danh sach ban dau
	List_warn[0] = {
		who_was_warn: {
			_id : data[0][0].who_was_warn._id,
			username : data[0][0].who_was_warn.username,
			email : data[0][0].who_was_warn.email,
			image : data[0][0].who_was_warn.image,
			sex : data[0][0].who_was_warn.sex
		},
		
		list_who_warn: {
			who_warn : {}
		}
	}
	
	List_warn[0].list_who_warn.who_warn[0] = {	
		_id : data[0][0].who_warn._id,
		username : data[0][0].who_warn.username,
		email : data[0][0].who_warn.email,
		created_at: data[0][0].created_at,
		code_warn: data[0][0].code_warn
	}
	
	
	/*for(index = 1; index < length; index++)
	{
		id_temp = data[index - 1].who_was_warn._id
		List_warn[0].list_who_warn.who_warn[index] = {
			_id : data[index][0].who_warn._id,
			username : data[index][0].who_warn.username,
			email : data[index][0].who_warn.email,
			created_at: data[index][0].created_at,
			code_warn: data[index][0].code_warn
		}
		
	} */
	console.log(data)
	console.log(data[0].length)
	
	return List_warn
}

router.route('/admin')//dieu huong app
.get(function(req, res)
{
	if(req.session.name){	
		res.render('admin')
	}else{
		res.redirect('logsg')
	}
})

.post(function(req, res){

})

.put(function(req, res){

})

.delete(function(req, res){

})

router.route('/admin/manageuser')//dieu huong app
.get(function(req, res)
{
	if(req.query.who_request_users)
	{
		console.log("run")
		models.User.find({"_id": {$ne: req.query.who_request_users}},//khong them admin vao quan li nguoi dung
			{"pass": 0, "updated_at": 0, "num_of_was_warn": 0})
		.exec(function(err, users){
			if(err)
				throw err
			
			res.send(JSON.stringify(users))
		})
	}
	
	
})

.post(function(req, res){
	
	var ban_user = new models3.Ban({
		id_user: req.body.id,
		description: req.body.description,
		time: req.body.time
	})
	
	ban_user.save(function(err){
		if(err){
			console.log(err)
			res.json({message: "Error"})
		}
		
		res.send("Success!!!")
		
	})
	
})

.put(function(req, res){

})

.delete(function(req, res)
{
	//khi xoa nguoi dung nay khoi csdl thi dong thoi cấm đoán email này vĩnh viễn
	//khai bao cac bien chua thong tin nguoi dung
	var username = req.body.name
	var userid = req.body.id
	var useremail = req.body.email
	
	models.User.findOneAndRemove({ "_id": userid }, function(err)
	{
		if (err){
			throw err;
			res.send("Error!.")
		}
		
		var ban_user = new models3.Ban({
			name: username,
			email: useremail,
			description: "Vi phạm các điều khoản của ứng dụng cho phép.",
			time: new Date("October 6, 1995 15:15:15").toISOString()
		})
	
		ban_user.save(function(err){
			if(err){
				console.log(err)
				res.json({message: "Error"})
			}
			
			// we have deleted the user
			console.log('User deleted!');
			res.send("User deleted!.")
		})

	});
	
})

router.route('/admin/warninguser')//dieu huong app
.get(function(req, res)
{
	
	 models2.Warning.aggregate([
         {
            $group:
               { "_id": "$who_was_warn"}
         },
		 {
			$limit: 15
		 },
		 {
			$skip: 0
		 }
      ])
      .then(function(iduser)
      {
      //  console.log("find value " + JSON.stringify(iduser))
		 
		var List_warn = []
		
		iduser.forEach(function(id){
			
			List_warn.push(
				models2.Warning.find({'who_was_warn': id._id}, {'updated_at': 0})
				.populate({
					path: "who_was_warn", //lay thong tin nhung nguoi bi canh bao
					select: {'hobbies': 0, 'created_at': 0, 'age': 0, 'password': 0, 'updated_at': 0, 'status': 0,  'update_infor': 0} //bo qua ca truong nay
				})
				.populate({
					path: "who_warn",//lay thong tin nhung nguoi canh bao
					select: {'num_of_was_warn': 0, 'hobbies': 0, 'age': 0, 'created_at': 0, 'password': 0, 'updated_at': 0, 'status': 0,  'update_infor': 0, 'sex': 0, 'image': 0} //bo qua ca truong nay
				})
				.sort({'who_was_warn': 1})
				.exec(function(err, data){
					
				})	
			)
		})
		 
		return Promise.all(List_warn); //dong bo tin nhan va nguoi dung 
      })
	  
	  .then(function (Result)
	  {
	//	console.log(Result)
		//console.log("value " + Result[1][0].who_warn._id)
	//	To_process_data_warning(Result)
		res.send(JSON.stringify(Result))
	  })
	  .catch(function(error)
	  {
		console.log("Some errors " + error)
		  
	  })
	
})

.post(function(req, res){

})

.put(function(req, res){

})

.delete(function(req, res){

})

router.route('/admin/dashboard')//dieu huong app
.get(function(req, res)
{
	
	 	res.render('admin')
	
})

.post(function(req, res){

})

.put(function(req, res){

})

.delete(function(req, res){

})



module.exports = router;