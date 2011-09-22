/**
 * @author pjnovas
 */


now.start = function(){
	
}

$(document).ready(function(){

});

now.updateRooms = function(rs){
	if ($('#rooms').length > 0){
		$('#rooms tr').empty().remove();	
		$("#tr-room").tmpl(rs).appendTo("#rooms");
	}
}

function getRoomStatus(status){
	return lang.home.roomStatus[status];
}
