/**
 * 滚动条插件
 * @author    │謎│╃→遊<753922062@qq.com>
 * @copyright │謎│╃→遊<753922062@qq.com>
 */
$.fn.extend({
	'scroll' 	: function(options){
		var self 				= this,
			warp 				= '',
			scrollBgY 			= '',	// 竖向滚动条背景
			scrollBgX 			= '',	// 横向滚动条背景
			scrollHeight 		= 0,
			scrollWidth 		= 0,
			scrollBlockY		= '',   // 竖向滑块
			scrollBlockX		= '',   // 横向滑块
			scrollBlockHeight 	= 0,
			scrollBlockWidth 	= 0,
			butY 				= '',   // 竖向滚动条按钮
			butHeight 			= 0,
			butX 				= '',   // 横向滚动条按钮
			butWidth 			= 0,
			scrollMain 			= '', 	//实际内容
			scrollMainHeight 	= 0,
			scrollMainWidth 	= 0,
			isFirefox 			= navigator.userAgent.toLocaleLowerCase().indexOf('firefox') != -1,
			scrollY 			= false,
			scrollX 			= false,
			settings 			= {
				'scroll'		: true,
				'spend'			: 50,      // 滚动速度
				'time'			: 200,	   // 长按按钮滚动时间
				'showBut' 		: true,    // 是否显示按钮
				'showScroll'	: false,   // 是否显示滚动条
				'butStyleY'		: {        // 按钮样式
					'width'		: '100%',
					'height'	: '10px',
				},
				'butStyleX'		: {        // 按钮样式
					'width'		: '10px',
					'height'	: '100%',
				},
			};

		settings 	= $.extend(settings, options || {});

		var isScrollY 	= (settings.scroll == 'y' || settings.scroll === true),
			isScrollX 	= (settings.scroll == 'x' || settings.scroll === true);
		// 创建滚动条
		function createScroll(){
			self.wrapAll('<div class="scrollWarp"></div>');
			warp 		= self.parent();
			self.html( '<div class="scrollMain">'+self.html()+'</div>' );
			scrollMain 			= $('.scrollMain', warp);

			var html 	= '';
			if( isScrollY ){
				scrollMainHeight	= scrollMain.height();
				if( !(scrollMainHeight < self.height() && ! settings.showScroll) ){
					html = '<div class="scrollBg scrollBg-y"><div class="scrollBlock"></div></div>';
					warp.append( html );
					scrollBgY 	= $('.scrollBg-y', warp),
					scrollBlockY= $('.scrollBlock', scrollBgY),
					butY 		= '',
					butHeight	= 0;
					// 是否显示滚动条按钮
					if( settings.showBut ){
						var butT = '<div class="but butT"></div>', 
							butB = '<div class="but butB"></div>';
						scrollBgY.append( butB ).prepend( butT );
						butY = $('.but', scrollBgY);
						butY.css( settings.butStyleY );
						butHeight = butY.outerHeight();
					}
					scrollY = true;
				}		
			}
			if( isScrollX ){
				scrollMainWidth	= scrollMain.width();
				if( !(scrollMainWidth < self.width() && ! settings.showScroll) ){
					html = '<div class="scrollBg scrollBg-x"><div class="scrollBlock"></div></div>';
					warp.append( html );
					scrollBgX 	= $('.scrollBg-x', warp),
					scrollBlockX= $('.scrollBlock', scrollBgX),
					butX 		= '',
					butWidth	= 0;
					// 是否显示滚动条按钮
					if(settings.showBut){
						var butL = '<div class="but butL"></div>', 
							butR = '<div class="but butR"></div>';
						scrollBgX.append( butL ).prepend( butR );
						butX = $('.but', scrollBgX);
						butX.css( settings.butStyleX );
						butWidth = butX.outerWidth();
					}
					scrollX = true;
				}
			}
			initScrollBlock();
			return true
		}

		// 初始化滑块
		function initScrollBlock(){
			if( scrollY ){
				// 计算滑块高度
				scrollBgHeight 		= scrollBgY.height() - butHeight * 2;
				if( scrollX ){ 
					scrollBgHeight -= butHeight; 
					scrollBgY.height(scrollBgY.height() - butHeight); 
				}
				scrollBlockHeight 	= warp.height() * scrollBgHeight / scrollMainHeight;
				scrollBlockY.height( scrollBlockHeight > scrollMainHeight ? 0 : scrollBlockHeight ).css('margin-top', butHeight+'px');
			}

			if( scrollX ){
				// 计算滑块宽度度
				scrollBgWidth 		= scrollBgX.width() - butWidth * 2;
				if( scrollY ){ 
					scrollBgWidth -= butWidth;
					scrollBgX.width(scrollBgX.width() - butWidth); 
				}
				scrollBlockWidth 	= warp.width() * scrollBgWidth / scrollMainWidth;
				scrollBlockX.width( scrollBlockWidth > scrollMainWidth ? 0 : scrollBlockWidth ).css('margin-left', butHeight+'px');
			}
					
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
		function blockPost(xy){
			return xy == 'Y' ? (self.scrollTop() * scrollBgHeight / scrollMainHeight) : (self.scrollLeft() * scrollBgWidth / scrollMainWidth);
		}

		// 检测滑块位置
		function checkPost(post, xy){
			var maxPost = xy == 'Y' ? (scrollBgHeight - scrollBlockHeight) : (scrollBgWidth - scrollBlockWidth);
			post = post < 0 ? 0 : post;
			post = post > maxPost ? maxPost : post;
			return post;
		}

		// 滚动函数
		function scroll(direction, xy){
			var post = direction;
			if( isNaN( direction + '' ) ){
				var post 	= xy == 'Y' ? self.scrollTop() : self.scrollLeft();
				if( direction ){
					post += settings.spend;
				}else{
					post -= settings.spend;
				}
			}
			if(xy == 'Y'){
				self.scrollTop( post );
				scrollBlockY.css('top', blockPost('Y'));
			}else{
				self.scrollLeft( post );
				scrollBlockX.css('left', blockPost('X'));
			}
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
				scroll( direction < 0 , 'Y');
				return false;
			});

			if( scrollY ){
				// 滚动条背景点击事件
				scrollBgY.on('click', function(e){
					if(e.target != this){ return false; }
					var _this 	= $(this),
						clickY 	= e.pageY - _this.offset().top - parseInt( scrollBlockY.css('margin-top') ),
						post  	= (checkPost(clickY - scrollBlockHeight / 2)) * scrollMainHeight / scrollBgHeight;
						scroll( post, 'Y' );
					return false;
				});
				// 滑块拖拽
				var startY = 0, moveY = false, positionY = 0;
				scrollBlockY.on('mousedown', function(e){
					startY 		= e.pageY;
					moveY 		= true;
					positionY 	= parseInt(scrollBlockY.css('top'));
						console.log(moveY);
					return false;
				});
			}

			if( scrollX ){
				scrollBgX.on('click', function(e){
					if(e.target != this){ return false; }
					var _this 	= $(this),
						clickX 	= e.pageX - _this.offset().left - parseInt( scrollBlockX.css('margin-left') ),
						post  	= (checkPost(clickX - scrollBlockWidth / 2)) * scrollMainWidth / scrollBgWidth;
						scroll( post, 'X' );
					return false;
				});
				var startX = 0, moveX = false, positionX = 0;
				scrollBlockX.on('mousedown', function(e){
					startX 		= e.pageX;
					moveX 		= true;
					positionX 	= parseInt(scrollBlockX.css('left'));
					return false;
				});
			}

			if( scrollY || scrollX ){
				$(document).on('mousemove', function(e){
					if( moveY ){
						var Y 		= e.pageY - startY + positionY,
							postY 	= checkPost( Y, 'Y' ) * scrollMainHeight / scrollBgHeight;
						scroll( postY, 'Y' );
					}
					if( moveX ){
						var X 		= e.pageX - startX + positionX,
							postX 	= checkPost( X, 'X' ) * scrollMainWidth / scrollBgWidth;
						scroll( postX, 'X' );
					}
					// return false;
				}).on('mouseup', function(){
					moveX = false;
					moveY = false;
					return false;
				});
			}

			// 按钮绑定事件
			var i = '', start = true;
			if(settings.showBut){
				$('.but', warp).on('click', function(){
					var _this 	= $(this);
						data 	= getBut(_this);
					scroll( data['flag'] , data['xy'] );
				}).on('mousedown', function(){
					var _this 	= $(this);
						data 	= getBut(_this);
					if( start ){
						i = setInterval(function(){
							scroll( data['flag'] , data['xy'] );
							start = false;
						},settings.time)
					}
					return false;
				}).on('mouseout mouseup', function(){
					clearInterval(i);
					start = true;
					return false;
				});

				function getBut(_this){
					xy 		= _this.parents('.scrollBg-y').length > 0 ? 'Y' : 'X',
					flag 	= (_this.hasClass('butB') || _this.hasClass('butR')) ? true : false;
					return {'xy':xy,'flag':flag};
				}
			}
		})()

		return self;
	}
})