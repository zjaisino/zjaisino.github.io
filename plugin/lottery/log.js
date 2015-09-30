var LOG = {
	list:[{
		ver:'v2.2',
		date:'2015-08-26',
		desc:[
			'1.增加getParam方法，ajax交互时可传递参数'
		]
	}, {
		ver:'v2.1',
		date:'2015-08-24',
		desc:[
			'1.增加转盘模式，仅支持移动端'
		]
	}]
}

$(function(){
	$('#updatelog').html(template('updatelog-tpl', LOG));
});