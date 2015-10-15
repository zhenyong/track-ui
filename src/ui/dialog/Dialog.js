/**
 * @class Tk.ui.Dialog
 *
 * simple usage
 *
 *     @example
 *
 * 
 * 
 */
(function () {

	var systemDic = Dic.getCategory('ResGSystem');

	Tk.define('Tk.ui.Dialog', {
		statics: {
			/**
			 * info 信息框
			 *
			 * @param  {Object}   options 配置
			 * @param  {String}   [options.title=_("信息")]
			 * @param  {String/Dom}   options.content 信息内容
			 *
			 */
			alertInfo: function (options) {
				//暂时依赖第三方
				layer.open({
				    type: 0, 
				    title: options.title || systemDic.get('__gDialog_info'),
				    content: options.content
				});

			}
		}
	});

})();