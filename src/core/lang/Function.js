/**
 * @class Tk.Function
 *
 * 一堆好用的静态方法，用于加工函数，或者返回一些高效的回调方法
 * @singleton
 */
Tk.Function = (function() {

    var ret = {
        /**
         * 把支持两个参数的方法包装成支持 键值 对象作为参数
         *
         * 例如:
         * 
         *     var oldSetValue = function (name) {
         *         this[name] = value;
         *     };
         *     var setValue = Tk.Function.flexSetter(oldSetValue);
         *
         *     // 保证原来用法没问题
         *     setValue('name1', 'value1');
         *
         *     // 支持 键值对象
         *     setValue({
         *         name1: 'value1',
         *         name2: 'value2'
         *     });
         *     //等同于 oldSetValue('name1', 'value1');oldSetValue('name2', 'value2')
         *
         * @param {Function} setter The single value setter method.
         * @param {String} setter.name The name of the value being set.
         * @param {Object} setter.value The value being set.
         * @return {Function}
         */
        flexSetter: function(setter) {
            return function(name, value) {
                var k, i;

                if (name !== null) {
                    if (typeof name !== 'string') {
                        for (k in name) {
                            if (name.hasOwnProperty(k)) {
                                setter.call(this, k, name[k]);
                            }
                        }

                        if (Tk.enumerables) {
                            for (i = Tk.enumerables.length; i--;) {
                                k = Tk.enumerables[i];
                                if (name.hasOwnProperty(k)) {
                                    setter.call(this, k, name[k]);
                                }
                            }
                        }
                    } else {
                        setter.call(this, name, value);
                    }
                }

                return this;
            };
        },

        /**
         * 对 `object` 的 `methodName` 方法创建一个别名方法 .
         * 注意：返回的方法的执行时 this 会指向 `object` 本身.
         *
         * @param {Object/Function} object
         * @param {String} methodName
         * @return {Function} aliasFn
         */
        alias: function(object, methodName) {
            return function() {
                return object[methodName].apply(object, arguments);
            };
        },

        /**
         * 对一个方法创建一个副本. 返回的新方法在调用时会把所有参数传递给原方法执行。
         * 新方法和原方法调用效果一样，更多是为了创建一个方法避免原方法被污染。
         *
         * @param {Function} method
         * @return {Function} cloneFn
         */
        clone: function(method) {
            return function() {
                return method.apply(this, arguments);
            };
        }
    };

    return ret;
})();