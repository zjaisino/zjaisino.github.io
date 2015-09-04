/**
 * Copyright(C), 2013-2014 ZheJiang Aisino Spaceflight Technology Co., Ltd.
 * FileName: jquery.parabola.js
 * Author: Aniu[date:2014-07-16 11:22]
 * Update: Aniu[date:2014-07-16 13:07]
 * Version: v1.1 beta
 */
 
$.fn.parabola = function(o){
	o = $.extend({
		speed:300,
		curvature:0.001,
		target:{
			left:0,
			top:0
		},
		moveElement:$.noop,
		complete:$.noop
	}, o||{});
	return this.each(function(){
		var that = $(this), speed = o.speed, a = o.curvature, b = c = 0, isTrue = true, timer = null;
		that.on('click', function(){
			if(!isTrue) return;
			var origin = {
				x:that.offset().left,
				y:that.offset().top
			}
			var target = {
				x:o.target.left - origin.x,
				y:o.target.top - origin.y
			}
			//初始位置(0, 0)
			var x = y = 0, 
			 	//正向or反向
				dir = target.x > 0 ? 1: -1, 
				s, move, 
				ele = o.moveElement(that).css({left:origin.x, top:origin.y});
			
			/*
			 * y1 = ax1*x1 + bx1 + c
			 * y2 = ax2*x2 + bx2 + c   
			 * 已知a,c,x1,x2,y1,y2求解b
			 */
			b = target.y/target.x - a*target.x;
			move = function(){
				//切线斜率
				s = 2*a*x + b;
				/* s = y/x
				 * y = x*s
				 * x*x + y*y = speed
				 * x*x + (x*t)^2 = speed
				 * x = Math.sqrt(speed / (s*s + 1));
				 */
				x += dir * Math.sqrt(speed / (s * s + 1));
				if((dir == 1 && x > target.x) || (dir == -1 && x < target.x)){
					x = target.x;
				}
				y = a * Math.pow(x, 2) + b * x;
				ele.css({left:origin.x+x, top:origin.y+y});
				if(x !== target.x){
					timer = setTimeout(function(){
						move();
					}, 15);
				}
				else{
					clearTimeout(timer);
					ele.hide();
					o.complete(that, ele);
					isTrue = true;
				}
			}
			move();
			isTrue = false;
		});
	});
}