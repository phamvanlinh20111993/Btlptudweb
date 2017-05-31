    
    //tat hop thoai chat
	function TurnOfChat()
	{
		confirm("Ban chac chan muon tat chat voi nguoi nay ???")
	}

    //thuc hien cai dat hien thi tin nhan....tren trang chu
	//DOM thay doi, bat su kien cho thay doi thong tin nguoi dung
	var Change_your_profile = document.getElementById('myModal')

	//DOM thay doi, bat su kien viec canh bao nguoi dung khac
	var Warnning_someone = document.getElementById('myModal1')

	//DOM thay doi, bat su kien viec thay doi cai dat
	var Setting_your_app = document.getElementById('myModal2')

	//thay doi main body tren thay doi cai dat
	var Setting_your_app_body = Setting_your_app.getElementsByClassName("modal-body")

	//thay doi main body tren thay doi thong tin nguoi dung
	var Change_your_profile_body = Change_your_profile.getElementsByClassName("modal-body")

	//lay cac gia tri input bao gom tuoi, ten, so thich nguoi dung
	var Change_your_profile_body_input = Change_your_profile_body[0].getElementsByTagName("input")

	//thay doi main body tren thay doi cac checkbox
	var Warnning_someone_body = Warnning_someone.getElementsByClassName("modal-body")

	//lay cac gia tri checkbox kiem tra chi cho check vao 1 o
	var Warnning_someone_body_checkbox = Warnning_someone_body[0].getElementsByClassName("checkbox")

	//lay gia tri cua o textbox tuong ung
	var Warnning_someone_body_checkbox_input = Warnning_someone_body[0].getElementsByTagName("input")
	var position_checkbox = 0, jj, indd;

	//xac dinh vi tri cua cac the checkbox
	for(var i = 0; i <  Warnning_someone_body_checkbox.length; i++)
      Warnning_someone_body_checkbox_input[i].alt = i;

   //bat su kien checkbox
	for(indd = 0; indd < Warnning_someone_body_checkbox.length; indd++)
	{
		Warnning_someone_body_checkbox_input[indd].addEventListener("click", function()
		{
			if(this === document.activeElement){
            position_checkbox = parseInt(this.alt);
         }

			for(jj = 0; jj < Warnning_someone_body_checkbox.length; jj++){
				Warnning_someone_body_checkbox_input = Warnning_someone_body_checkbox[jj].getElementsByTagName("input")
				Warnning_someone_body_checkbox_input[0].checked == false;
			}

			//kiem tra chi cho nguoi dung check 1 vi tri
			for(jj = 0; jj < Warnning_someone_body_checkbox.length; jj++){
				Warnning_someone_body_checkbox_input = Warnning_someone_body_checkbox[jj].getElementsByTagName("input")
				if(position_checkbox == jj){
					Warnning_someone_body_checkbox_input[0].checked == true
					continue;
				}else{
					Warnning_someone_body_checkbox_input[0].checked = false;
				}
			}

		})
	}


	//xac dinh vi tri cua cac the input trong su kien thay doi thong tin nguoi dung
	for(var i = 0; i < Change_your_profile_body_input.length; i++)
     Change_your_profile_body_input[i].alt = i;

	//bat su kien khi nguoi dung thay doi thong tin
	for(indd = 0; indd < Change_your_profile_body_input.length; indd++)
	{
		Change_your_profile_body_input[indd].addEventListener("click", function(){
			if(this === document.activeElement){
           
         }
		})
	}






