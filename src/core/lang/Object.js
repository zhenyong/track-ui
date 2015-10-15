/**
 * @class Tk.Object
 *
 * 一堆处理对象的静态方法
 *
 * @singleton
 */
'use strict';

var TemplateClass = function() {},
	TkObject = Tk.Object = {

		/**
		 * @method
		 * 返回一个新对象，把参数对象 `object` 作为新对象的原型链对象。
		 *
		 * 场景：
		 *
		 * - 需要拷贝一个对象，以后修改这个新对象的属性的时候不会污染到原对象的同名属性
		 * 
		 * @param {Object} object 新对象的原型链指向该对象
		 */
		chain: Object.create || function(object) {
			TemplateClass.prototype = object;
			var result = new TemplateClass();
			TemplateClass.prototype = null;
			return result;
		},

		/**
		 * 返回对象当前自身所有（`hasOwnProperty` 为 true）的属性，作为数组返回
		 *
		 *     var values = Ext.Object.getKeys({
		 *         name: 'Jacky',
		 *         loves: 'food'
		 *     }); // ['name', 'loves']
		 *
		 * @param {Object} object
		 * @return {String[]} 数组的属性值组成的数组
		 * @method
		 */
		getKeys: (typeof Object.keys == 'function') ? function(object) {
			if (!object) {
				return [];
			}
			return Object.keys(object);
		} : function(object) {
			var keys = [],
				property;

			for (property in object) {
				if (object.hasOwnProperty(property)) {
					keys.push(property);
				}
			}

			return keys;
		}
	};