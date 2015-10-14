// @tag core
/**
 * @class Tk
 *
 * Tk 全局命名空间，封装了所有的类、单例、工具方法。
 * 
 * @singleton
 */
var Tk = Tk || {}; // jshint ignore:line
// @define Tk

(function() {
    var global = this,
        objectPrototype = Object.prototype,
        toString = objectPrototype.toString,
        enumerables = ['valueOf', 'toLocaleString', 'toString', 'constructor'],
        privateFn = function () {},
        // This is the "$previous" method of a hook function on an instance. When called, it
        // calls through the class prototype by the name of the called method.
        callOverrideParent = function () {
            var method = callOverrideParent.caller.caller; // skip callParent (our caller)
            return method.$owner.prototype[method.$name].apply(this, arguments);
        },
        i,
        iterableRe = /\[object\s*(?:Array|Arguments|\w*Collection|\w*List|HTML\s+document\.all\s+class)\]/;

    Tk.global = global;

    // Mark these special fn's for easy identification:
    privateFn.$nullFn = true;
    privateFn.$privacy = 'framework';

    for (i in { toString: 1 }) {
        enumerables = null;
    }

    /**
     * 存放老的浏览器无法遍历的属性名
     * @property {String[]}
     */
    Tk.enumerables = enumerables;

    /**
     * Copies all the properties of `config` to the specified `object`. There are two levels
     * of defaulting supported:
     * 
     *      Tk.apply(obj, { a: 1 }, { a: 2 });
     *      //obj.a === 1
     * 
     *      Tk.apply(obj, {  }, { a: 2 });
     *      //obj.a === 2
     * 
     * Note that if recursive merging and cloning without referencing the original objects
     * or arrays is needed, use {@link Tk.Object#merge} instead.
     * 
     * @param {Object} object The receiver of the properties.
     * @param {Object} config The primary source of the properties.
     * @param {Object} [defaults] An object that will also be applied for default values.
     * @return {Object} returns `object`.
     */
    Tk.apply = function(object, config, defaults) {
        if (defaults) {
            Tk.apply(object, defaults);
        }

        if (object && config && typeof config === 'object') {
            var i, j, k;

            for (i in config) {
                object[i] = config[i];
            }

            if (enumerables) {
                for (j = enumerables.length; j--;) {
                    k = enumerables[j];
                    if (config.hasOwnProperty(k)) {
                        object[k] = config[k];
                    }
                }
            }
        }

        return object;
    };

    // Used by Tk.override
    function addInstanceOverrides(target, owner, overrides) {
        var name, value;

        for (name in overrides) {
            if (overrides.hasOwnProperty(name)) {
                value = overrides[name];

                if (typeof value === 'function') {

                    value.$name = name;
                    value.$owner = owner;

                    value.$previous = target.hasOwnProperty(name) ?
                        target[name] // already hooked, so call previous hook
                        : callOverrideParent; // calls by name on prototype
                }

                target[name] = value;
            }
        }
    }

    Tk.buildSettings = Tk.apply({
        baseCSSPrefix: 'x-'
    }, Tk.buildSettings || {});

    Tk.apply(Tk, {
        /**
         * @private
         */
        idSeed: 0,

        /**
         * @private
         */
        idPrefix: 'tk-',

        /**
         * `true` to automatically uncache orphaned Tk.Elements periodically. If set to
         * `false`, the application will be required to clean up orphaned Tk.Elements and
         * it's listeners as to not cause memory leakage.
         */
        enableGarbageCollector: false,

        /**
         * @property {Function}
         * A reusable empty function for use as `privates` members.
         *
         *      Tk.define('MyClass', {
         *          nothing: Tk.emptyFn,
         *
         *          privates: {
         *              privateNothing: Tk.privateFn
         *          }
         *      });
         *
         */
        privateFn: privateFn,
        

        /**
        * Generates unique ids. If the object/element is passes and it already has an `id`, it is unchanged.
        * @param {Object} [o] The object to generate an id for.
        * @param {String} [prefix=tk-gen] (optional) The `id` prefix.
        * @return {String} The generated `id`.
        */
        id: function(o, prefix) {
            if (o && o.id) {
                return o.id;
            }

            var id = (prefix || Tk.idPrefix) + (++Tk.idSeed);
            
            if (o) {
                o.id = id;
            }

            return id;
        },

        /**
         * @property {String} [baseCSSPrefix='x-']
         * 样式前缀会应用到所有组件中 `Tk` 组件. 你可以在渲染之前配置其他值
         *
         *     Tk.buildSettings = {
         *         baseCSSPrefix : 'abc-'
         *     };
         *
         * 便于定义皮肤
         */
        baseCSSPrefix: Tk.buildSettings.baseCSSPrefix,

        /**
         * Copies all the properties of config to object if they don't already exist.
         * @param {Object} object The receiver of the properties
         * @param {Object} config The source of the properties
         * @return {Object} returns obj
         */
        applyIf: function(object, config) {
            var property;

            if (object) {
                for (property in config) {
                    if (object[property] === undefined) {
                        object[property] = config[property];
                    }
                }
            }

            return object;
        },

        /**
         * Overrides members of the specified `target` with the given values.
         *
         * If the `target` is a class declared using {@link Tk#define Tk.define}, the
         * `override` method of that class is called (see {@link Tk.Base#override}) given
         * the `overrides`.
         *
         * If the `target` is a function, it is assumed to be a constructor and the contents
         * of `overrides` are applied to its `prototype` using {@link Tk#apply Tk.apply}.
         *
         * If the `target` is an instance of a class declared using {@link Tk#define Tk.define},
         * the `overrides` are applied to only that instance. In this case, methods are
         * specially processed to allow them to use {@link Tk.Base#callParent}.
         *
         *      var panel = new Tk.Panel({ ... });
         *
         *      Tk.override(panel, {
         *          initComponent: function () {
         *              // extra processing...
         *
         *              this.callParent();
         *          }
         *      });
         *
         * If the `target` is none of these, the `overrides` are applied to the `target`
         * using {@link Tk#apply Tk.apply}.
         *
         * Please refer to {@link Tk#define Tk.define} and {@link Tk.Base#override} for
         * further details.
         *
         * @param {Object} target The target to override.
         * @param {Object} overrides The properties to add or replace on `target`.
         * @method override
         */
        override: function (target, overrides) {
            if (target.$isClass) {
                target.override(overrides);
            } else if (typeof target === 'function') {
                Tk.apply(target.prototype, overrides);
            } else {
                var owner = target.self,
                    privates;

                if (owner && owner.$isClass) { // if (instance of Tk.define'd class)
                    privates = overrides.privates;
                    if (privates) {
                        overrides = Tk.apply({}, overrides);
                        delete overrides.privates;
                        addInstanceOverrides(target, owner, privates);
                    }

                    addInstanceOverrides(target, owner, overrides);
                } else {
                    Tk.apply(target, overrides);
                }
            }

            return target;
        },

        /**
         * 如果 `value` 为 “空” 则返回 true，下列情况都属于“空”
         *
         * - `null`
         * - `undefined`
         * - 空数组
         * - 空字符串 (除非 `allowEmptyString` 参数 为 `true`)
         *
         * @param {Object} value 需要检测的值
         * @param {Boolean} [allowEmptyString=false] `true` 允许空字符串表示“有值”
         * @return {Boolean}
         */
        isEmpty: function(value, allowEmptyString) {
            return (value == null) || (!allowEmptyString ? value === '' : false) || (Tk.isArray(value) && value.length === 0);
        },

        /**
         * 如果参数是一个 JS 数组 对象则返回 `true`,否则 `false`
         *
         * @param {Object} target 需要检测的目标
         * @return {Boolean}
         * @method
         */
        isArray: ('isArray' in Array) ? Array.isArray : function(value) {
            return toString.call(value) === '[object Array]';
        },

        /**
         * 如果参数是一个 JS Date 对象则返回 `true`,否则 `false`
         * @param {Object} object 需要检测的对象
         * @return {Boolean}
         */
        isDate: function(value) {
            return toString.call(value) === '[object Date]';
        },

        /**
         * 如果参数是一个 JS Object 对象则返回 `true`,否则 `false`
         * 
         * @param {Object} value 需要检测的值
         * @return {Boolean}
         * @method
         */
        isObject: (toString.call(null) === '[object Object]') ?
        function(value) {
            // 检查 ownerDocument 以便排除 DOM 节点
            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } :
        function(value) {
            return toString.call(value) === '[object Object]';
        },

        /**
         * @private
         */
        isSimpleObject: function(value) {
            return value instanceof Object && value.constructor === Object;
        },

        /**
         * 如果参数是一个 JS '字面量' (string/number/boolean)，则返回 `true`，否则返回 `false`
         * @param {Object} value 需要检测的值
         * @return {Boolean}
         */
        isPrimitive: function(value) {
            var type = typeof value;

            return type === 'string' || type === 'number' || type === 'boolean';
        },

        /**
         * 如果参数是一个 JS 函数，则返回 `true`，否则返回 `false`
         * 
         * @param {Object} value 需要检测的值
         * @return {Boolean}
         * @method
         */
        isFunction:
        // typeof <NodeList> 在 Safari 3.x, 4.x 返回 'function', 此时需要使用
        // Object.prototype.toString (慢一点)
        (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ? function(value) {
            return !!value && toString.call(value) === '[object Function]';
        } : function(value) {
            return !!value && typeof value === 'function';
        },

        /**
         * 如果参数是一个有限数字，那么返回 `true`，非数字或者无限数字都返回 `false`
         * @param {Object} value 需要检测的值
         * @return {Boolean}
         */
        isNumber: function(value) {
            return typeof value === 'number' && isFinite(value);
        },

        /**
         * 检测是一个值是否长得像数字
         * @param {Object} value 例如: 1, '1', '2.34'
         * @return {Boolean} 像则返回 True
         */
        isNumeric: function(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        /**
         * 如果参数是个字符串，那么返回 `true`
         * @param {Object} value 需要检测的值
         * @return {Boolean}
         */
        isString: function(value) {
            return typeof value === 'string';
        },

        /**
         * 如果参数是个布尔值，那么返回 `true`
         *
         * @param {Object} value 需要检测的值
         * @return {Boolean}
         */
        isBoolean: function(value) {
            return typeof value === 'boolean';
        },

        /**
         * Returns `true` if the passed value is an HTMLElement
         * @param {Object} value 需要检测的值
         * @return {Boolean}
         */
        isElement: function(value) {
            return value ? value.nodeType === 1 : false;
        },

        /**
         * Returns `true` if the passed value is a TextNode
         * @param {Object} value 需要检测的值
         * @return {Boolean}
         */
        isTextNode: function(value) {
            return value ? value.nodeName === "#text" : false;
        },

        /**
         * Returns `true` if the passed value is defined.
         * @param {Object} value 需要检测的值
         * @return {Boolean}
         */
        isDefined: function(value) {
            return typeof value !== 'undefined';
        }
    }); // Tk.apply(Tk

}());
