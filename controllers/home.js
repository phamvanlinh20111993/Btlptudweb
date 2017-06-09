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
  	if(fs.existsSync(del_directory))
    {
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

//ham tra ve 1 so  nguyen nam trong khoang max, min
function RandomInt(max, min)
{
  return Math.floor(Math.random() * max + min);
}

router.route('/home')//dieu huong app
.get(function(req, res)
{
	//load danh sach nguoi dung tu csdl, cần có độ ưu tiên hiển thị những người online trước, sau đó
   //là những người offline với thòi gian online gần nhất với thời điểm hiện tại.Như vậy sort field
   //by status(online hay offline) và time(thời gian off gần nhất)
	if(req.query.loaduser)
	{
    //load gia tri nguoi dung ban dau
    var num_of_rq = req.query.num_of_user
    if(req.query.loaduser == 1)
    {
		 models.User.find({}, {created_at: 0, password: 0, __v: 0})
       .sort({status: -1, updated_at: -1})
       .limit(parseInt(num_of_rq))//gioi han so nguoi can tim
       .skip((parseInt(num_of_rq) - 10))//bo qua so ban ghi tinh tu vi tri dau tien
       .exec(function(err, users)
       {
			   if (err) throw err;
  			 // console.log(users);
  			   res.send(users)
		 })
    }else if(req.query.loaduser == 2)//tra ve mot nguoi dung random trong danh sach online
    {// có 1 vấn đề đặt ra là hàm random trả về người dùng hiện tại.Người dùng sẽ nt vs chính mình?            

      var Length_of_document;
      models.User.find().count(function(err, count){
         Length_of_document = count
      });

      setTimeout(function(){
         var Random = RandomInt(parseInt(Length_of_document), 0)//random 1 nguoi dua tren vi 
                                       //tri cua nguoi dung trong danh sach
         console.log(Random + "  " + Length_of_document)
         if(Random == 0) Random = 1;//trường hợp skip bỏ qua 
         models.User.find({})
         .limit(1)
         .skip(Random - 1)
         .exec(function(err, user)
         {
            if (err) throw err;
            console.log(user)
            res.send(user)
         }) 
         }, 300);   //request sau 300ms
    }else//load nguoi dung voi gia tri tim kiem value duoc nhap boi nguoi dung
    {
      var val = req.query.valsearch
      console.log(val)
    }

	}else if(req.query.loadmessagea)//req.query.loadmessagea la ma id nguoi dung hien tai muon load message
  {                              //req.query.loadmessageb la nguoi ma nguoi dung htai đang nhan tin cung

      /* mỗi lần người dùng thanh scroll trong hôp thoại chat thì nếu người dùng cứ request lên liên tục 
       thì đó không phải là 1 ý tưởng tốt. Do đó cần truy cấn csdl tìm ra số lượng tin nhắn hiện tại của
       người dùng với đối phương. do mỗi lần request, số lương tin nhắn cần hiển thị sẽ tăng dần lên, tới
       1 thời điểm nào đó thì số lượng tin nhắn cần hiện thị = số bản ghi thực trong bản ghi, khi đó hệ thống
       sẽ không trả về dữ liệu nữa
      */

      var Count_message = 0;//số lương tin nhắn hiện có

      models1.Message.find({$or:[{$and:[{'id_user_A': req.query.loadmessagea},
       {'id_user_B': req.query.loadmessageb}]},{$and:[{'id_user_A': req.query.loadmessageb},
       {'id_user_B': req.query.loadmessagea}]}]}).count(function(err, num)
      {
         Count_message = num;
      })

      //Hệ thống chỉ trả về mỗi lần request của người dùng 15 tin nhắn bắt đầu từ những tin nhắn mới nhất trở về
      //trước
      setTimeout(function(){//giai quyet van de giua 2 ham async, giai phap tam thoi

          console.log("so luong tin nhan la: " + Count_message + " " + req.query.num)
         if(Count_message > (req.query.num - 15))
         {
            var Skip_field = Count_message - req.query.num;
            var Limit_field = Skip_field + 15;
            if(Skip_field < 0) Skip_field = 0;

            console.log("so ban ghi bi bo qua la: " + Skip_field)
            console.log("gioi han " + Limit_field)
            models1.Message.find({$or:[{$and:[{'id_user_A': req.query.loadmessagea},
            {'id_user_B': req.query.loadmessageb}]},{$and:[{'id_user_A': req.query.loadmessageb},
            {'id_user_B': req.query.loadmessagea}]}]})
            .populate({//truy van bo qua null  { "$exists": true, "$ne": null }....
               path: 'id_user_A',
               match: 
               {
                  $or:[{'_id': req.query.loadmessagea}, 
                     {'_id': req.query.loadmessageb}
               ]},
               select: {'password': 0, 'updated_at': 0, 'status': 0, 'Update_info': 0} //bo qua ca truong nay
            })
            .skip(Skip_field)// bo qua Skip_field ban ghi
            .limit(Limit_field)//gioi han so ban ghi
            .sort({'created_at': 1})//sap xep tang dan theo thoi gian
            .exec(function(err, message)
            {
               if (err) 
               return handleError(err);
               console.log("so luong tin nhan tra ve: " + message.length)
               res.send(message)
            });
         }

      }, 600)

  }else//kiem tra session da duoc khai bao moi chuyen qua trang khac
  {
		if(!req.session.name){//nguoi dung chua dang nhap
			res.redirect('logsg');
		}else
    {
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
	if(typeof req.files != 'undefined')
  {//neu co file gui len
		fs.readFile(req.files.File.path, function (err, data)
    {
    		var imageName = req.files.File.name
    		if(!imageName)
        {
      			console.log("There was an error")
      			res.redirect("/home");
      			res.end();
    		}else
        {
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

  //nhan query canh bao nguoi dung
  if(req.body.warning_someone)
  {
      console.log("Da chay " + req.body.warning_someone + "  " + req.body.warning)
      // luu du lieu vao co so du lieu
      var Awarning = new models2.Warning({
        who_warn: req.session.chat_id,
        who_was_warn: req.body.warning_someone,
        code_warn:req.body.warning, // gia tri canh bao
      })

      Awarning.save(function(err){
        if(err) 
          console.log("Loi luu canh bao nguoi dung: " + err)
      })
  }

}).put(function(req, res)
{
  //nguoi dung quen mat khau va yeu cau nhap lai mat khau trong qua trinh dang nhap
  if(typeof req.body.repassword != 'undefined'){
    res.render('home');
  }

  //nhan du lieu cap nhat thong tin nguoi dung
  if(req.body.update_user_info)
  {
    /*  mảng này tương ứng có các giá trị sau Update_info[0]- tương ứng là mã người dùng
      Update_info[1]- tương ứng là giá trị cập nhật tên người dùng
      Update_info[2]- tương ứng là sở thích người dùng
      Update_info[3]- tương ứng là giới tính
      Update_info[4]- tương ứng là mật khẩu
    */
    var Update_info = JSON.parse(req.body.update_user_info)
    var Information = "";

    /* Việc cập nhật thông tin không thể tùy tiện, chỉ cho phép update 3 tháng(90 ngày) 1 lần, đầu tiên, 
      cần truy vấn kiểm tra xem nguoif dùng đã cập nhật bao giờ chưa */
    models.User.find({"_id": Update_info[0]})
    .select({"update_infor": 1, "_id": 0})// lay truong cap nhat password
    .exec(function(err, user){
      Information = user
    });

    //neu do dai user la 1 thi nguoi dung chua cap nhat bao gio
    //neu la user la 2 thi nguoi dung da cap nhat roi, can kiem tra thoi gian xem co lon hon 3 thang khong
    setTimeout(function()
    {
        if(typeof Information[0].update_infor == 'undefined'){
          models.User.findOneAndUpdate({"_id": Update_info[0]}, 
            {"$set": {'username': Update_info[1], 'password': md5(Update_info[4]), 'sex': Update_info[3], 'hobbies': Update_info[2], 'update_infor': new Date()}},
          function(err, user) {
            if(err)  throw err;
            res.send("Đã cập nhật thành công.")
          });
        }else
        {
          var Date_now = new Date();
          var Date_update = new Date(Information[0].update_infor)//chinh thoi gian IOSdate sang standard Date
          if((Date_now - Date_update) < 24*3600*90*1000){
             res.send("Bạn đã cập nhật thông tin. Thời gian update tiếp theo phải sau 90 ngày nữa.")
          }else
          {
            models.User.findOneAndUpdate({"_id": Update_info[0]}, 
            {"$set": {'username': Update_info[1], 'password': md5(Update_info[4]), 'sex': Update_info[3], 'hobbies': Update_info[2], 'update_infor': new Date()}},
            function(err, user) {
              if(err)  throw err;
              res.send("Đã cập nhật thành công.")
            });
          }
        }

    }, 500)

  }

}).delete(function(req, res){

  
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
    client.on('chat', function(data)//nguoi dung lang nghe tren su kien chat nhan tin cho doi phuong 
    {    
      var id_sender = data.substring(0, 24);//24 so dau la ma nguoi gui
      var id_receiver = data.substring(24, 48);//24 so tiep theo la ma nguoi nhan
      var content = data.substring(48, data.length);//con lai la noi dung chat
                     
      // luu du lieu vao co so du lieu
      var Amessage = new models1.Message({
        id_user_A: id_sender,
        id_user_B: id_receiver,
        content: content, //noi dung tin nhan
        check: 0,//gia gia mac dinh la chua ai xem
			})

      Amessage.save(function(err){
        if(err) 
          console.log("Loi luu tin nhan: " + err)
      })

		  data = id_sender.concat(id_receiver)
		  data = data.concat(content)
	  //	client.emit('reply', data);
		  client.broadcast.emit('reply', data);//server gui tin nhan den nguoi nhận

    });

    //nguoi dung tat chat thoat khoi page :))), co thong bao ai do da offline
    client.on('disconnect', function()
    {
        console.log("Co ai do da off line " + client.id)
        Length = Useronoroffline_email.length
        for(index = 0; index < Length; index++)
        {
          if((client.id) == SocketID[index])
          {
            client.emit('offline', Useronoroffline_email[index].concat("55555"))
            client.broadcast.emit('offline', Useronoroffline_email[index].concat("55555"))
            //luu trang thai nguoi dung vao csdl(trang thai offline)
            models.User.findOneAndUpdate({'email': Useronoroffline_email[index]}, 
               {"$set": {'status': 0, 'updated_at': new Date().toISOString()}},//cap nhat thoi gian offline
            function(err, user) {
              if (err) throw err;
            });
            console.log(new Date().toISOString())
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
    	for(index = 0; index < Length; index ++)//nguoi dung da ton tai roi thi khong them
      {
        if(Useronoroffline_email[index] == data)
        {
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