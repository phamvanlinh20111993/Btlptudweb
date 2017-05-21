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
  						  if (err)  throw err;
  							res.render("home")
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
	res.render('login_signup');
})

//kiem tra su offline cua nguoi dung
//var Onorofline = function(email, time){
//	this.email = email;
//	this.time = time;
//}
var index = 0, flag = false, Length;
var Useronoroffline_email = [];//dia chi email
var SocketID = [];//moi connect tuong ung voi 1 ID

//khi clien connect vao server
io.on('connection', function(client)
{  
    console.log('Client connected ' + client.id);//nguoi dung ket noi vao server
    num_of_user_online ++;
    client.on('chat', function(data)
     {//nguoi dung lang nghe tren su kien chat nhan tin cho doi phuong     
      var id_sender = data.substring(0, 24);//24 so dau la ma nguoi gui
      var id_receiver = data.substring(24, 48);//24 so tiep theo la ma nguoi nhan
      var content = data.substring(48, data.length);//con lai la noi dung chat
                                       
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

		  data = id_sender.concat(id_receiver)
		  data = data.concat(content)
	  //	client.emit('reply', data);
		  client.broadcast.emit('reply', data);//server gui tin nhan den nguoi nhận

    });

    //nguoi dung tat chat thoat khoi page :))), co thong bao ai do da offline
    client.on('disconnect', function(){
        console.log("Co ai do da off line " + client.id)
        Length = Useronoroffline_email.length
        for(index = 0; index < Length; index++)
        {
          if((client.id) == SocketID[index])
          {
            client.emit('offline', Useronoroffline_email[index].concat("55555"))
            client.broadcast.emit('offline', Useronoroffline_email[index].concat("55555"))
            //luu trang thai nguoi dung vao csdl(trang thai offline)
            models.User.findOneAndUpdate({'email': Useronoroffline_email[index]}, {'status': 0},
            function(err, user) {
              if (err) throw err;
            });
            //xoa nguoi offline khoi danh danh nguoi dung online
            Useronoroffline_email.splice(index, 1)
            SocketID.splice(index, 1)  
            break;
          }
        }
        //Thong bao cho tat ca may trong server khi co ai do offline
        client.broadcast.emit('useronline', Useronoroffline_email.length)
        client.emit('useronline', Useronoroffline_email.length)
    });
  
    //thong bao nhung ai dang online
    client.on('online', function(data)
    {
    	//xet thoi gian, cho nguoi dung online
      console.log(data +"  "+ client.id)
      Length = Useronoroffline_email.length
    	for(index = 0; index < Length; index ++)
      {//nguoi dung da ton tai roi thi khong them
        if(Useronoroffline_email[index] == data){
          SocketID[index] = client.id;//sua lai gia tri ID cua nguoi dung
          client.broadcast.emit('offline', data)//bao voi tat ca may khac la tao online
          models.User.findOneAndUpdate({'email': data}, {'status': 1},//cap nhat csdl bao la t online
          function(err, user) {
            if (err) throw err;
          });
          flag = true;
          break;
        }
      }
      //neu chua ton tai nguoi dung
      if(flag == false)
      {
        Length = Useronoroffline_email.length
        Useronoroffline_email[Length] = data;
        models.User.findOneAndUpdate({'email': data}, {'status': 1},//nguoi dung moi thi cap nhat vao csdl
        function(err, user) {
          if (err) throw err;
        });
        SocketID[Length] = client.id;
        //thong bao cu the nguoi nao do online
        client.broadcast.emit('offline', data)
      }else flag = false;//khoi tao lai gia tri

    	client.broadcast.emit('useronline', Useronoroffline_email.length)//do dai khong thay doi hoac thay 
                                                             //doi neu co them nguoi dung moi 
    	client.emit('useronline', Useronoroffline_email.length)
      console.log("email " + Useronoroffline_email)
    })

  //nguoi dung dang nhap tin nhan
  client.on('chatting', function(data){
    client.broadcast.emit('typing...', data)
  })

});

//tao cong de nhan tin
var port = process.env.PORT || 5556;
var ip = process.env.IP || '127.0.0.1'

server.listen(port, ip, function(){
	console.log('Server dang lang nghe nguoi dung chat tai cong %s:%s!', ip, port)
});

module.exports = router;