/**
 * @fileName page.js
 * @author Aniu[date:2015-09-21 14:19]
 * @update Aniu[date:2015-09-21 14:19]
 * @version v1.1
 * @description none
 */
 
$(function(){
	$('.j-active').each(function(){
		var me = $(this);
		this.addEventListener('touchstart', function(e){
			me.addClass('s-crt');
		});
		this.addEventListener('touchend', function(e){
			me.removeClass('s-crt');
		});
	});
});