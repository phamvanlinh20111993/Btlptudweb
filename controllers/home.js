var express = require('express')
var path = require('path')
var app = express()
var multipart  = require('connect-multiparty')//upload file dung connect-multiparty
var multipartMiddleware = multipart()
var router = express.Router()
var server = require('http').createServer(app)  
var io = require('socket.io')(server)
var models = require('../models/user')
var md5 = require('md5')
var fs = require('fs');
var num_of_user_online = 0;
//var session = require('express-session')

//tao thu muc chua anh dai dien voi tham so dau vao la ma nguoi dung
function Create_directory(user_id)
{
	try{
		var create_directory = 'Image/' + user_id;
		fs.mkdirSync(create_directory)
		console.log('Da tao thanh cong thu muc chua anh.')
	}catch(err)
	{
		if(err.code == 'EEXIST')
			console.log("Thu muc chua anh nay da ton tai.")
		else
			console.log(err)
	}
}

//xoa thu muc chua anh dai dien voi tham so dau vao la ma nguoi dung
function Delete_file_in_directory(user_id)
{
	var del_directory = 'Image/' + user_id;
  	if(fs.existsSync(del_directory)) {
    	fs.readdirSync(del_directory).forEach(function(file, index){//de quy xoa file trong thu muc
      		var curPath = del_directory + "/" + file;
      		if(fs.lstatSync(curPath).isDirectory()) { // recurse
        		Delete_file_in_directory(curPath)
      		}else{ // delete file
        		fs.unlinkSync(curPath);
      		}
    	});
    //	fs.rmdirSync(del_directory);
  	}
}


router.route('/home')//dieu huong app
.get(function(req, res)
{
	//load danh sach nguoi dung tu csdl
	if(typeof req.query.loaduser != 'undefined')
	{
		models.User.find({}, function(err, users){
			if (err) throw err;
  			//console.log(users);
  			res.send(users)
		})
		delete req.query.loaduser;
		//tien hanh noi dung hoi thoai giua nguoi gui va nguoi nhan bat ki
	} else if(typeof req.query.yourid != 'undefined')
	{
		console.log("da chay " + req.query.yourid + ", "+ req.query.themid)
		delete req.query.yourid;

	}else
	{//kiem tra session da duoc khai bao moi chuyen qua trang khac
		if(!req.session.name){
			res.redirect('logsg');
		}else {
      //luu lai session
      req.session.save(function(err) {
        // session saved 
        if(err) console.log(err)
      })
      //luu trang thai cua nguoi dung tren csdl de tien theo doi
      models.User.findOneAndUpdate({'email': req.session.email}, {'status': 1},
      function(err, user) {
        if (err) throw err;
      });

		  res.render('home');
		}
	}
})
.post(multipartMiddleware, function(req, res)
{
	//tien hanh dang xuat
	if(req.body.request_log_out == 1){
		req.session.destroy(function(err) {
    // cannot access session here 
      if(err) console.log(err)
    })
		res.redirect('logsg');
	}
	
	//Upload anh dai dien
	if(typeof req.files != 'undefined'){//neu co file gui len
		fs.readFile(req.files.File.path, function (err, data) {
    		var imageName = req.files.File.name
    		if(!imageName){
      			console.log("There was an error")
      			res.redirect("/home");
      			res.end();
    		} else {
    			Create_directory(req.session.chat_id)//tao lai thu muc, neu ton tai thi khong tao
    	    Delete_file_in_directory(req.session.chat_id)//xoa thu muc
    	   
    			var dirname = path.resolve(__dirname, "..");
      	 		var newPath = dirname + "/Image/" + req.session.chat_id + "/" + imageName;
      	 		var link_img = "/" + req.session.chat_id + "/" + req.files.File.name;
      	 		req.session.image = link_img;//cap nhat anh
      	 		console.log(link_img)

      			fs.writeFile(newPath, data, function (err) {
      				if(err){
          				return res.end("Error uploading file.");
        			}
              //cap nhat duong dan anh vao csdl
        			models.User.findOneAndUpdate({'email': req.session.email}, {'image': link_img},
        			function(err, user) {
  						  if (err) throw err;
  						  else{
  							 console.log(user);
  							 res.render("home")
  						  }
					});
      	 		});
        	}
 		});
	}

}).put(function(req, res)
{
  //nguoi dung quen mat khau va yeu cau nhap lai mat khau trong qua trinh dang nhap
  if(typeof req.body.repassword != 'undefined'){
    res.render('home');
  }

})


//dieu huong
router.route('/logsg')
.get(function (req, res){
  models.User.findOneAndUpdate({'email': data}, {'status': 0},
  function(err, user) {
    if (err) throw err;
  });
	res.render('login_signup');
})

//kiem tra su offline cua nguoi dung
//var Onorofline = function(email, time){
//	this.email = email;
//	this.time = time;
//}
var index = 0, index1 = 0, index2 = -1;
var Useronoroffline_email = [];//dia chi email
var Useronoroffline_time = [];//thoi gian hien tai

//khi clien connect vao server
io.on('connection', function(client){  
    console.log('Client connected...');//nguoi dung ket noi vao server
    num_of_user_online ++;

    client.on('chat', function(data) {//nguoi dung lang nghe tren su kien chat nhan tin cho doi phuong
      //  console.log(data)
      //  console.log("so nguoi online la " +num_of_user_online)                                              
       //luu du lieu vao co so du lieu
      //  client.emit('hello', 'Hello from Server')
      	/*models.User.findOne({email: "phamvanlinh2011199#@gmail.com"}).
			exec(function(err, value){
				if(err){
				console.log(err)
				}else{
					console.log("hi")
					console.log(sess.name)
				}
			}) */

		var id_sender = data.substring(0, 24);//24 so dau la ma nguoi gui
		var id_receiver = data.substring(24, 48);//24 so tiep theo la ma nguoi nhan
		var content = data.substring(48, data.length);//con lai la noi dung chat

		data = id_sender.concat(id_receiver)
		data = data.concat(content)
		console.log(data)
	//	client.emit('reply', data);
		client.broadcast.emit('reply', data);//server gui tin nhan den nguoi nhận

    });

    //nguoi dung tat chat thoat khoi page :))), co thong bao ai do da offline
    client.on('disconnect', function(data){
        num_of_user_online --;
        //so luong nguoi dung dang online-khi co ai do offline
        client.broadcast.emit('useronline', num_of_user_online)
        client.emit('useronline', num_of_user_online)

        //Có 1 trường hợp rất hi hữu. Nếu A la người online cuối cùng(người duy nhất còn online) trên website nay thì
        //khi A tắt trang hoặc tắt trình duyệt (không đăng xuất) thì trạng thái online trên csdl vẫn là online. Do đó
        //Cần 1 hàm check tình trạng csdl nếu đây là ng online cuối cùng rồi
        if(num_of_user_online == 0){//người cuối cùng vừa offline
          models.User.update({'status': 1},{'status': 0}, {multi: true},
           function(err, value){//cap nhat lai tat ca nhung nguoi dung dang online ve offline
            if(err) console.log(err)
            console.log(value)
          });
        }

    });
  
    //thong bao nhung ai dang online 15s client request 1 lan
    client.on('online', function(data){
    	//xet thoi gian, cho nguoi dung online
    	client.emit('offline', data)
    	client.broadcast.emit('offline', data)
    	//day la nguoi onlline moi hay nguoi dung da on line nhung refresh lai page
    	if(num_of_user_online > 0)
    	{
        //them nguoi dung vao mang de thong bao so luong nguoi online
    		index1 = 0;
    		while(true)
    		{
    			if(data == Useronoroffline_email[index1]){//nguoi dung cu
    				Useronoroffline_time[index1] = new Date();//cap nhat thoi gian moi online
    				if(index1 == 0) index1 ++;//nguoi dung dau tien dang nhap
    				break;
    			}

    			if(typeof Useronoroffline_email[index1] == 'undefined'){//nguoi dung moi tham gia
    				Useronoroffline_email[index1] = data;
    				Useronoroffline_time[index1] = new Date();//ghi nhan thoi gian
    				index1++;
    				break;
    			}
    			index1++;
    		}

    		if(index2 == -1){//day la gia tri khoi tao ban dau
    			index2 = index1;//lay gia tri lon nhat cua index1 la so nguoi dang online
    		}else{
    			if(index1 > index2) index2 = index1;//cap nhat lai so nguoi dung online lon nhat
    		}
    	}
    //  console.log("email la " + Useronoroffline_email)

    	//co ai do da offline
    	var Time_now = new Date()
    	var index3 = index2;//bien chay
    	for(index = 0; index <= index3; index++){
    		//so sanh dia chi email cua tung nguoi dung da online
    		if(typeof Useronoroffline_email[index] != 'undefined' && data != Useronoroffline_email[index])
    		{
    			 //lon hon thoi gian 17s ma phai client khong phan hoi tuc la offline
    			if((Time_now - Useronoroffline_time[index]) > 17000)
    			{ 
    				client.emit('offline', Useronoroffline_email[index].concat("55555"))
    				client.broadcast.emit('offline', Useronoroffline_email[index].concat("55555"))

            //luu trang thai nguoi dung vao csdl(trang thai offline)
            models.User.findOneAndUpdate({'email': Useronoroffline_email[index]}, {'status': 0},
              function(err, user) {
                if (err) throw err;
              //  console.log("khong chay "+user)
            });

    				//xoa nguoi offline khoi danh danh nguoi dung online
    				Useronoroffline_email.splice(index, 1)
    		 		Useronoroffline_time.splice(index, 1)

    		 		index2 --;//so nguoi online giam di 1
    		 		if(index2 == 0) index2 = -1;//khoi dong lại gia trị
    			}
    		}
    	}

    	if(num_of_user_online > (index2 + 1))
    	{//neu nguoi dung lien tuc refresh lai trang web, xay ra hieu hung num_of_user_online tang
    	 // theo so lan refresh do, nhu the nguoi dung bi hieu nham.
    		client.broadcast.emit('useronline', index2)
    		client.emit('useronline', index2)
    	}else{
    		client.broadcast.emit('useronline', num_of_user_online)
    		client.emit('useronline', num_of_user_online)
    	}
    })
});

//tao cong de nhan tin
var port = process.env.PORT || 5556;
var ip = process.env.IP || '127.0.0.1'

server.listen(port, ip, function(){
	console.log('Server dang lang nghe nguoi dung chat tai cong %s:%s!', ip, port)
});

module.exports = router;