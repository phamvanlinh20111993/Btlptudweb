
//gui toi server cac gia tri de cam nguoi dung
function Server_ban_user(id_user, time, description)
{
	
	$.ajax({
		type: "POST",
		url: "./user/manageuser",
		data:{id: id_user, time: time, description: description},
		success: function(data)
		{
			if(data.length < 10)
				alert("Xay ra loi trong qua trinh Ban nguoi dung nay.")
			else
				alert("Ban nguoi dung thanh cong.")
		}
		
	})
}

//khoa nguoi dung trong thoi gian bao nhieu lau
function Ban_user(index)//tham so lay vi tri thong tin
{
	var table = document.getElementById("Manage_users_id").getElementsByTagName("table")
    var table_tbody = table[0].getElementsByTagName("tbody")
	var table_tbody_tr = table_tbody[0].getElementsByTagName('tr')[index]
	
	$('#myModal444').modal('show');
	
}

//ham hien thi them thong tin cua nguoi dung
function More_infor_user(index)
{
	var table = document.getElementById("Manage_users_id").getElementsByTagName("table")
    var table_tbody = table[0].getElementsByTagName("tbody")
	var table_tbody_tr = table_tbody[0].getElementsByTagName('tr')[index]
	
	
	
}

//xoa nguoi dung khoi csdl
function Remove_user(index)//tham so lay vi tri thong tin
{

	var table = document.getElementById("Manage_users_id").getElementsByTagName("table")
    var table_tbody = table[0].getElementsByTagName("tbody")
	var table_tbody_tr = table_tbody[0].getElementsByTagName('tr')[index]
	
	var email = table_tbody_tr.getElementsByTagName('input')[5].value
	var name    = table_tbody_tr.getElementsByTagName('input')[1].value
	//console.log(name)
	var r = confirm("Admin chắc chắn muốn xóa "+name+" này khỏi danh sách người dùng ???")

	if(r){
		Del_users(email, name)
	}
}

//ham hien thi bang quan li nguoi dung voi tham so data la object array users
function Create_table_show_users(data, tbody_table)
{
	var user_length, index = 0;
	user_length = data.length;
	
	var elements = "";
	
	for(index = 0; index < user_length; index++)
	{
		elements += '<tr>'
		elements += '<td>'	+ data[index].email+	'</td>'
		elements += '<td> <image src = "'	+ data[index].image + ' " style="height: 40px;width: 40px;"></td>'
		elements += '<td>'+data[index].age+'</td>'
		if(typeof data[index].sex != 'undefined')
			elements += '<td>'	+ data[index].sex+'</td>'
		else
			elements += '<td>Not update</td>'
		
		if(data[index].status == 1)
			elements += '<td>Online</td>'
		else
			elements += '<td>Offline</td>'
		
		elements += '<td style="text-align:center;"><button type="button" class="btn btn-warning" onclick = "Ban_user('+index+')">Khóa</button></td>'
		elements += '<td style="text-align:center;"><button type="button" class="btn btn-danger"  onclick = "Remove_user('+index+');">Xóa sổ</button></td>'
		elements += '<td style="text-align:center;"><button type="button" class="btn btn-primary">More...</button></td>'
		//cac thong tin bo sung se hien ra khi click vao nut More...
		elements += '<input type="hidden" value = "'+data[index]._id+'">';
		elements += '<input type="hidden" value = "'+data[index].username+'">';
		elements += '<input type="hidden" value = "'+data[index].created_at+'">';
		elements += '<input type="hidden" value = "'+data[index].hobbies+'">';
		elements += '<input type="hidden" value = "'+data[index].update_infor+'">';
		elements += '<input type="hidden" value = "'+data[index].email+'">';
		
		elements += '</tr>'
	}
	
	tbody_table[0].innerHTML += elements
}

//ham chuyen doi code_warn ve ma string
function Transfer_code_warn_to_String(code_warn)
{
	var Str = ""
	
	switch(code_warn)
	{
		case "AB111":
			Str = "Lời lẽ xúc phạm, đe dọa, phản động"
			break;
			
		case "AB222":
			Str = "Cảm thấy ghét, hận, thù"
			break;
			
		case "AB333":
			Str = "Kẻ biến thái"
			break;
			
		case "AB444":
			Str = "Tục tĩu, vô duyên"
			break;
			
		case "AB555":
			Str = "Không thích người này"
			break;
		
	}
	
	return Str;
	
}

//ham chuyen ISOdate trong mongo ve Date js
function Time_transfer(ISOdate)
{
    dt = new Date(ISOdate)
    var  time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + ", "+ dt.getDate()+ "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
    return time;
}

//bat su kien
function Detail_user_warning(pos)
{
	var table = document.getElementById("Warning_id").getElementsByTagName("table")
    var table_tbody = table[0].getElementsByTagName("tbody")
	var table_tbody_tr = table_tbody[0].getElementsByTagName('tr')[pos]
	
	var infor_users_warning = JSON.parse(table_tbody_tr.getElementsByTagName('input')[0].value)
	/*
		$('#myModal').modal('toggle');
		$('#myModal').modal('show');
		$('#myModal').modal('hide');
	*/
	$('#myModal111').modal('show');
	var Modal = document.getElementById("myModal111")
	var Modal_body = Modal.getElementsByClassName("modal-body")
	
	var Modal_body_h4 = Modal.getElementsByTagName("h4")
	var Modal_body_table = Modal_body[0].getElementsByTagName("table")
	if(infor_users_warning.length > 0)
		Modal_body_h4[0].innerHTML = "Thông tin <span style='font-size: 110%;'><i>" + infor_users_warning[0].who_was_warn.username + "</i></span> bị cảnh báo"
	
	var index = 0, pos = 0, elements = "<thead><tr><th>Stt</th><th>Người cảnh báo</th><th>Email</th><th>Nội dung cảnh báo</th><th>Thời gian</th></tr></thead>";
	Modal_body_table[0].innerHTML = ""
	
	for(index = 0; index < infor_users_warning.length; index++)
	{
		elements += '<tr>'
		elements += '<td>' + (index + 1) + '</td>'
		elements += '<td>' + infor_users_warning[index].who_warn.username + '</td>'
		elements += '<td>' + infor_users_warning[index].who_warn.email + '</td>'
		elements += '<td>' + Transfer_code_warn_to_String(infor_users_warning[index].code_warn) + '</td>'
		elements += '<td>' + Time_transfer(infor_users_warning[index].created_at) + '</td>'
		elements += '</tr>'
	}
	
	Modal_body_table[0].innerHTML += elements
	
	//console.log(JSON.stringify(infor_users_warning)) // right
}

//ham hien thi bang quan li nguoi dung bi canh bao tham so data la object array users
function Create_table_warning_users(data, tbody_table)
{
	var user_length, index = 0;
	user_length = data.length;
	var elements = '';
	
	for(index = 0; index < user_length; index++)
	{
		
		elements += '<tr>'
		elements += '<td>'+ (index + 1) +'</td>'
		elements += '<td>'+ data[index][0].who_was_warn.username +'</td>'
		elements += '<td>'+ data[index][0].who_was_warn.email +	'</td>'
		elements += '<td>'+ data[index].length +'</td>'
		elements += '<td style="text-align:center;"><button type="button" onclick = "Detail_user_warning('+index+')" class="btn btn-default">Detail</button></td>'
		elements += '<td style="text-align:center;"><button type="button" class="btn btn-primary">Find</button></td>'
		elements += '<input type = "hidden" value = '+JSON.stringify(data[index])+'>'//an du lieu dang json. bo value = /""/ de giu nguyen dang json
		
		elements += '</tr>'
	}
	
	tbody_table[0].innerHTML += elements
}

//tao ham request tra ve danh sách nguoi dung tren server
function Del_users(email, name)
{
	location.href = "?delete=" + email;
	$.ajax({
		type: "DELETE",
		url: "./admin/manageuser",
		data:{email: email, name: name},
		success: function(data)
		{
			if(data.length < 10)
				alert("Xảy ra lỗi.")
			else
				alert("Đã xóa thành công.")
		}
	})

}

//tao ham request tra ve danh sách nguoi dung tren server
function Request_users(admin_id, code, num)
{
	
	$.ajax({
		type: "GET",
		url: "./admin/manageuser",
		data:{who_request_users: admin_id, code_request: code, num_request: num},
		success: function(data)
		{
			data = JSON.parse(data)
			
			var table = document.getElementById("Manage_users_id").getElementsByTagName("table")
			var table_tbody = table[0].getElementsByTagName("tbody")
			//tinh toan do dai cua mang du lieu
			var Total_count = document.getElementById("Manage_users_id").getElementsByClassName("label label-info")
			Total_count[0].innerHTML = data.length
			
			Create_table_show_users(data, table_tbody)
		}
	})

}

//tao ham request tra ve danh sách nguoi dung bi canh bao tren server
function Request_warning(admin_id, code)
{
	
	$.ajax({
		type: "GET",
		url: "./admin/warninguser",
		data:{who_request_warning_users: admin_id, code_request: code},
		success: function(data)
		{
			data = JSON.parse(data)
			var table = document.getElementById("Warning_id").getElementsByTagName("table")
			var tbody_table = table[0].getElementsByTagName("tbody")
			//tinh toan do dai cua mang du lieu
			var Total_count = document.getElementById("Warning_id").getElementsByClassName("label label-info")
			Total_count[0].innerHTML = data.length
			Create_table_warning_users(data, tbody_table)//du lieu data duoi dang object
		}
	})
	
}

//ham chuyen doi vi tri cac chuc nang trong trang admin sang chuc nang string
function Convert_pos_to_string(pos)
{
	var Str;
	switch(pos)
	{
		case 0:
			Str = "dashboard";//tuong ung voi khi kick vao Dashboard
			document.getElementById("Dashboard_id").style.display = "block";
			document.getElementById("Manage_users_id").style.display = "none";
			document.getElementById("Warning_id").style.display = "none";
			break
			
		case 1:
			Str = "manageuser";
			document.getElementById("Manage_users_id").style.display = "block";
			document.getElementById("Dashboard_id").style.display = "none";
			document.getElementById("Warning_id").style.display = "none";
			break
			
		case 2:
			Str = "warninguser";
			document.getElementById("Warning_id").style.display = "block";
			document.getElementById("Dashboard_id").style.display = "none";
			document.getElementById("Manage_users_id").style.display = "none";
			break
			
		case 4:
			Str = "imageadmin";
			document.getElementById("Warning_id").style.display = "none";
			document.getElementById("Dashboard_id").style.display = "none";
			document.getElementById("Manage_users_id").style.display = "none";
			break
			
		case 5:
			Str = "inforadmin";
			document.getElementById("Warning_id").style.display = "none";
			document.getElementById("Dashboard_id").style.display = "none";
			document.getElementById("Manage_users_id").style.display = "none";
			break
			
		case 6:
			Str = "createnotify";
			document.getElementById("Warning_id").style.display = "none";
			document.getElementById("Dashboard_id").style.display = "none";
			document.getElementById("Manage_users_id").style.display = "none";
			break
			
		case 7:
			Str = "calendar";
			document.getElementById("Warning_id").style.display = "none";
			document.getElementById("Dashboard_id").style.display = "none";
			document.getElementById("Manage_users_id").style.display = "none";
			break
			
		case 8:
			Str = "logistics";
			document.getElementById("Warning_id").style.display = "none";
			document.getElementById("Dashboard_id").style.display = "none";
			document.getElementById("Manage_users_id").style.display = "none";
			break
		
		default: 
			Str = ""
			break;
	}
	
	return Str;
}

function Show_dashboard()
{
	//dosomething here.... 
	
}


//ham tao request toi server khi admin kick vao tung chuc nang 
function Decode_request_functional(string)
{
	switch(string)
	{
		case 'manageuser':
			var table = document.getElementById("Manage_users_id").getElementsByTagName("table")
			var table_tbody = table[0].getElementsByTagName("tbody")
			if(table_tbody[0].innerHTML == "")
				Request_users(adminid, 0, 30);
			break
			
		case 'warninguser':
			var table = document.getElementById("Warning_id").getElementsByTagName("table")
			var table_tbody = table[0].getElementsByTagName("tbody")
			if(table_tbody[0].innerHTML.length < 18)
				//console.log(table_tbody[0].innerHTML.length)
				Request_warning(adminid, 0);
			break
		
		case 'dashboard':
			Show_dashboard()
			break
		
	}
}

//tạo các biến để xử lí các vùng trong ui admin
var Dashboard_event = document.getElementsByClassName("side-menu-container")
//bắt sự kiện khi click vào thanh navbar bên trái 
var Dashboard_event_ul_tag = Dashboard_event[0].getElementsByTagName("ul")
//các thẻ li hiển thị các chức năng trong trang admin
var Dashboard_event_ul_tag_li = Dashboard_event_ul_tag[0].getElementsByTagName("li")
var Dashboard_event_ul_tag_li_a;//the a la con cua the li (phia tren)
//khai bao cac bien chay 
var index = 0, pos = 0, position = 0, ind = 0, i = 0, j = 0, k = 0;

//khoi tao cac vi tri khi click vao cac nut trong thanh chuc nang admin
for(index = 0; index < Dashboard_event_ul_tag_li.length; index++){
	Dashboard_event_ul_tag_li_a = Dashboard_event_ul_tag_li[index].getElementsByTagName("a")
	Dashboard_event_ul_tag_li_a[0].alt = index;//luu lai cac vi tri
}

//dat mac dinh khi hien thi trang admin thi nut Manage users duoc auto kick 
Dashboard_event_ul_tag_li[1].style.backgroundColor = "#95e295"
Request_users(adminid, 0, 20)//tu dong load tu server ve nguoi dung


//bat su kien click
for(ind = 0; ind < Dashboard_event_ul_tag_li.length; ind++)
{
	Dashboard_event_ul_tag_li_a = Dashboard_event_ul_tag_li[ind].getElementsByTagName("a")
	Dashboard_event_ul_tag_li_a[0].addEventListener("click", function(){
		if(this === document.activeElement)
		{
			Dashboard_event_ul_tag_li[parseInt(this.alt)].style.backgroundColor = "#95e295";
			Decode_request_functional(Convert_pos_to_string(this.alt))
			
			for(index = 0; index < Dashboard_event_ul_tag_li.length; index++)
			{
				if(index == this.alt) continue;
				Dashboard_event_ul_tag_li[parseInt(index)].style.backgroundColor = ""
			}
		}
	})
}

//bat su kien click vao phan trang trong chuc nang manage user
var Pagination_in_manage_user = document.getElementById("Manage_users_id").getElementsByClassName("col-md-6")
//the ul
var Pagination_in_manage_user_ul = Pagination_in_manage_user[1].getElementsByTagName("ul")
//lay the li
var Pagination_in_manage_user_ul_li = Pagination_in_manage_user_ul[0].getElementsByTagName("li")
var Pagination_in_manage_user_ul_li_a;

for(ind = 0; ind < Pagination_in_manage_user_ul_li.length; ind++)
{
	Pagination_in_manage_user_ul_li_a = Pagination_in_manage_user_ul_li[ind].getElementsByTagName("a")
	Pagination_in_manage_user_ul_li_a[0].alt = ind;
}

//bat su kien click vao tung trang
var count_next_page_panigation = 0;
for(ind = 0; ind < Pagination_in_manage_user_ul_li.length; ind++)
{
	Pagination_in_manage_user_ul_li_a = Pagination_in_manage_user_ul_li[ind].getElementsByTagName("a")
	Pagination_in_manage_user_ul_li_a[0].addEventListener("click", function(){
		if(this === document.activeElement)
		{
			if(this.alt == 0)//quay tro lai trang cu
			{
				if(count_next_page_panigation > 0)  count_next_page_panigation--;
				if(count_next_page_panigation == 0){
					var att3 = document.createAttribute("class");
					att3.value = "disabled";
					Pagination_in_manage_user_ul_li[0].setAttributeNode(att3);
				}
				
				if(count_next_page_panigation >= 0){
					for(index = 1; index < 6; index++){
						Pagination_in_manage_user_ul_li_a = Pagination_in_manage_user_ul_li[index].getElementsByTagName("a")
						Pagination_in_manage_user_ul_li_a[0].innerHTML = (count_next_page_panigation)*5 + index;
					}
				}
				
				var att = document.createAttribute("class");
				att.value = "active";
				Pagination_in_manage_user_ul_li[1].setAttributeNode(att);
			 
				for(index = 2; index < 6; index++)
				{
					var att1 = document.createAttribute("class");
					att1.value = "";
					Pagination_in_manage_user_ul_li[index].setAttributeNode(att1);
				}
				
			}else if(this.alt == Pagination_in_manage_user_ul_li.length-1)//next tiep
			{
				//bat su kien doi mau trang khi trang duoc load
				count_next_page_panigation++;
				if(count_next_page_panigation == 1){
					var att2 = document.createAttribute("class");
					att2.value = "";
					Pagination_in_manage_user_ul_li[0].setAttributeNode(att2);
				}
				
				for(index = 1; index < 6; index++){
					Pagination_in_manage_user_ul_li_a = Pagination_in_manage_user_ul_li[index].getElementsByTagName("a")
					Pagination_in_manage_user_ul_li_a[0].innerHTML = count_next_page_panigation*5 + index;
				}
				
				var att = document.createAttribute("class");
				att.value = "active";
				Pagination_in_manage_user_ul_li[1].setAttributeNode(att);
			 
				for(index = 2; index < 6; index++)
				{
					var att1 = document.createAttribute("class");
					att1.value = "";
					Pagination_in_manage_user_ul_li[index].setAttributeNode(att1);
				}
				
			}else
			{
				//bat su kien doi mau trang khi trang duoc load
				var att = document.createAttribute("class");
			 
				att.value = "active";
				Pagination_in_manage_user_ul_li[this.alt].setAttributeNode(att);
			 
				for(index = 1; index < 6; index++)
				{
					if(index == this.alt) continue;
					var att1 = document.createAttribute("class");
					att1.value = "";
					Pagination_in_manage_user_ul_li[index].setAttributeNode(att1);
				}
			 
				//load du lieu tu server
			} 
		}
	})
}

