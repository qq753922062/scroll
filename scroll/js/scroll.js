/**
 * 滚动条插件
 * @author    │謎│╃→遊<753922062@qq.com>
 * @copyright │謎│╃→遊<753922062@qq.com>
 */
$.fn.extend({
	'scroll' 	: function(options){
		var self 				= this,
			warp 				= '',
			scrollBg 			= '',	// 滚动条背景
			scrollHeight 		= 0,
			scrollBlock			= '',   // 滑块
			scrollBlockHeight 	= 0,
			but 				= '',   // 滚动条按钮
			butHeight 			= 0,
			scrollMain 			= '', 	//实际内容
			scrollMainHeight 	= 0,
			isFirefox 			= navigator.userAgent.toLocaleLowerCase().indexOf('firefox') != -1,
			settings 			= {
				'spend'			: 50,      // 滚动速度
				'time'			: 200,	   // 长按按钮滚动时间
				'showBut' 		: true,    // 是否显示按钮
				'showScroll'	: false,   // 是否显示滚动条
				'butStyle'		: {        // 按钮样式
					'width'		: '100%',
					'height'	: '10px',
				},
			};

		settings 	= $.extend(settings, options || {});
		// 创建滚动条
		function createScroll(){
			self.wrapAll('<div class="scrollWarp"></div>');
			warp 		= self.parent();
			self.html( '<div class="scrollMain">'+self.html()+'</div>' );
			scrollMain 			= $('.scrollMain', warp),
			scrollMainHeight	= scrollMain.height();

			if( scrollMainHeight < self.height() && ! settings.showScroll ){ return false;}

			var html 	= '<div class="scrollBg"><div class="scrollBlock"></div></div>';
			warp.append( html );

			scrollBg 	= $('.scrollBg', warp),
			scrollBlock = $('.scrollBlock', warp),
			but 		= '',
			butHeight	= 0;
			// 是否显示滚动条按钮
			if(settings.showBut){
				var butT = '<div class="but butT"></div>', 
					butB = '<div class="but butB"></div>';
				scrollBg.append( butB ).prepend( butT );

				but = $('.but', warp);
				but.css( settings.butStyle );
				butHeight = but.outerHeight() ;
			}

			// 计算滑块高度
			scrollBgHeight 		= scrollBg.height() - butHeight * 2;
			scrollBlockHeight 	= warp.height() * scrollBgHeight / scrollMainHeight;
			scrollBlock.height( scrollBlockHeight > scrollMainHeight ? 0 : scrollBlockHeight ).css('margin-top', butHeight+'px');
			
			return true
		}


		// 事件绑定
		function addEvent(obj,ev,fn){
			if(typeof obj.addEventListener != 'undefined'){
				obj.addEventListener(ev, function(e){
					fn(e) || e.preventDefault();
				},false);
			}else{
				obj.attachEvent('on'+ev, function(e){
					fn(e) || (window.event.returnValue = false);
				});
			}
		}

		// 计算滑块位置
		function blockPost(){
			return self.scrollTop() * scrollBgHeight / scrollMainHeight;
		}

		// 检测滑块位置
		function checkPost(post){
			var maxPost = scrollBgHeight - scrollBlockHeight;
			post = post < 0 ? 0 : post;
			post = post > maxPost ? maxPost : post;
			return post;
		}

		// 滚动函数
		function scroll(direction){
			var post = direction;
			if( isNaN( direction + '' ) ){
				var post 	= self.scrollTop();
				if( direction ){
					post += settings.spend;
				}else{
					post -= settings.spend;
				}
			}
			self.scrollTop( post );
			scrollBlock.css('top', blockPost());
		}

		(function run(){
			if( ! createScroll() ){
				return false;
			}
			// 滚动事件
			var ev = isFirefox ? 'DOMMouseScroll' : 'mousewheel';
			addEvent(warp[0], ev, function(e){
				var e 			= e || window.event,
					direction 	= isFirefox ? ~e.detail : e.wheelDelta;
				scroll( direction < 0 );
				return false;
			});

			// 滚动条背景点击事件
			scrollBg.on('click', function(e){
				if(e.target != this){ return false; }
				var _this 	= $(this),
					clickY 	= e.pageY - _this.offset().top - parseInt( scrollBlock.css('margin-top') ),
					post  	= (checkPost(clickY - scrollBlockHeight / 2)) * scrollMainHeight / scrollBgHeight;
					scroll( post );
				return false;
			});

			// 滑块拖拽
			var startY = 0, move = false, positionY = 0;
			scrollBlock.on('mousedown', function(e){
				startY 		= e.pageY;
				move 		= true;
				positionY 	= parseInt(scrollBlock.css('top'));
				return false;
			});

			$(document).on('mousemove', function(e){
				if( move ){
					var moveY = e.pageY - startY + positionY,
						postY = checkPost( moveY ) * scrollMainHeight / scrollBgHeight;
					scroll( postY );
				}
			}).on('mouseup', function(){
				move = false;
				return false;
			})

			// 按钮绑定事件
			var i = '', start = true;
			if(settings.showBut){
				but.on('click', function(){
					var flag = $(this).hasClass('butB');
					scroll( flag );
				}).on('mousedown', function(){
					var flag = $(this).hasClass('butB');
					if( start ){
						i = setInterval(function(){
							scroll( flag );
							start = false;
						},settings.time)
					}
					return false;
				}).on('mouseout mouseup', function(){
					clearInterval(i);
					start = true;
					return false;
				})
			}
		})()

		return self;
	}
})