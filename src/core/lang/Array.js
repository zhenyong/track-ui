/**
 * @class Tk.Array
 * @singleton
 *
 * 一堆处理数组的静态方法，针对一些老的浏览器提供一些 ES5 的数组功能
 */
Tk.Array = (function() {

	var ret = {
		/**
         * 把非数组的值转化为数组，返回情况：
         *
         * - 对 `undefined` or `null` 返回 空数组
         * - 对 数组 返回 本身
         * - 对于像数组的（如：arguments, NodeList）则返回一个副本
         * - 对 其他单值，则把该值作为数组唯一元素，返回一个新数组
         *
         * @param {Object} value 
         * @param {Boolean} [newReference] `true` 如果原来已经是个数组，这里可以强制要求返回一个新的数组
         * @return {Array} array
         */
        from: function(value, newReference) {
            if (value === undefined || value === null) {
                return [];
            }

            if (Tk.isArray(value)) {
                return (newReference) ? slice.call(value) : value;
            }

            var type = typeof value;

            //处理那些像数组的情况，排除字符串和函数
            // strings and functions 都有 length 属性
            if (value && value.length !== undefined && type !== 'string' && (type !== 'function' || !value.apply)) {
                return ExtArray.toArray(value);
            }

            return [value];
        },

	};


	return ret;

}());
