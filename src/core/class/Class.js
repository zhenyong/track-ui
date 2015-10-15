/**
 * @class Tk.Class
 *
 * 底层类工厂，不要直接使用。创建类可以通过 {@link Tk#define Tk.define} 。
 * 
 */
(function() {
// @tag class
// @define Tk.Class
    var ExtClass,
        Base = Tk.Base,
        baseStaticMembers = Base.$staticMembers;

    // 创建一个干净构造函数
    function makeCtor () {
        function constructor () {
            // Opera has some problems returning from a constructor when Dragonfly isn't running. The || null seems to
            // be sufficient to stop it misbehaving. Known to be required against 10.53, 11.51 and 11.61.
            return this.constructor.apply(this, arguments) || null;
        }
        return constructor;
    }

    /**
     * @method constructor
     * 创建一个匿名类
     *
     * @param {Object} data 表示这个类的一组成员对象
     * @param {Function} [onCreated] 类创建完执行回掉
     *
     * @return {Tk.Base} 新创建的类
     */
    Tk.Class = ExtClass = function(Class, data, onCreated) {
        if (typeof Class != 'function') {
            onCreated = data;
            data = Class;
            Class = null;
        }

        if (!data) {
            data = {};
        }

        Class = ExtClass.create(Class, data);

        ExtClass.process(Class, data, onCreated);

        return Class;
    };

    Tk.apply(ExtClass, {
        
        makeCtor: makeCtor,
        
        /**
         * @private
         */
        onBeforeCreated: function(Class, data, hooks) {
            Class.addMembers(data);

            hooks.onCreated.call(Class, Class);
        },

        /**
         * @private
         */
        create: function (Class, data) {
            var i = baseStaticMembers.length,
                name;

            if (!Class) {
                Class = makeCtor();
            }

            while (i--) {
                name = baseStaticMembers[i];
                Class[name] = Base[name];
            }

            return Class;
        },

        /**
         * @private
         */
        process: function(Class, data, onCreated) {
            var preprocessorStack = data.preprocessors || ExtClass.defaultPreprocessors,
                registeredPreprocessors = this.preprocessors,
                hooks = {
                    onBeforeCreated: this.onBeforeCreated
                },
                preprocessors = [],
                preprocessor, preprocessorsProperties,
                i, ln, j, subLn, preprocessorProperty;

            delete data.preprocessors;
            Class._classHooks = hooks;

            for (i = 0,ln = preprocessorStack.length; i < ln; i++) {
                preprocessor = preprocessorStack[i];

                if (typeof preprocessor == 'string') {
                    preprocessor = registeredPreprocessors[preprocessor];
                    preprocessorsProperties = preprocessor.properties;

                    if (preprocessorsProperties === true) {
                        preprocessors.push(preprocessor.fn);
                    }
                    else if (preprocessorsProperties) {
                        for (j = 0,subLn = preprocessorsProperties.length; j < subLn; j++) {
                            preprocessorProperty = preprocessorsProperties[j];

                            if (data.hasOwnProperty(preprocessorProperty)) {
                                preprocessors.push(preprocessor.fn);
                                break;
                            }
                        }
                    }
                }
                else {
                    preprocessors.push(preprocessor);
                }
            }

            hooks.onCreated = onCreated ? onCreated : Tk.emptyFn;
            hooks.preprocessors = preprocessors;

            this.doProcess(Class, data, hooks);
        },
        
        doProcess: function(Class, data, hooks) {
            var me = this,
                preprocessors = hooks.preprocessors,
                preprocessor = preprocessors.shift(),
                doProcess = me.doProcess;

            for ( ; preprocessor ; preprocessor = preprocessors.shift()) {
                // Returning false signifies an asynchronous preprocessor - it will call doProcess when we can continue
                if (preprocessor.call(me, Class, data, hooks, doProcess) === false) {
                    return;
                }
            }
            hooks.onBeforeCreated.apply(me, arguments);
        },

        /**
         * @private
         * */
        preprocessors: {},

        /**
         * 注册一个 “预处理器”
         *
         * @param {String} name 处理器名称
         * @param {Function} fn 处理器执行的方法. 格式:
         *
         *     function(cls, data, innerFn) {
         *         // 你的代码
         *
         *         // 当处理器处理完后一定要执行这个方法
         *         if (innerFn) {
         *             innerFn.call(this, cls, data);
         *         }
         *     });
         *
         * @param {Function} fn.cls 创建的类
         * @param {Object} fn.data 传进 {@link Tk.Class} 构造函数的键值对
         * @param {Function} fn.innerFn  当这个预处理器处理完后 **一定** 要执行的回调，无论处理器是同步还是异步
         * @return {Tk.Class} this
         * @private
         * @static
         */
        registerPreprocessor: function(name, fn, properties, position, relativeTo) {
            if (!position) {
                position = 'last';
            }

            if (!properties) {
                properties = [name];
            }

            this.preprocessors[name] = {
                name: name,
                properties: properties || false,
                fn: fn
            };

            this.setDefaultPreprocessorPosition(name, position, relativeTo);

            return this;
        },

        /**
         * 获取处理器的处理方法
         *
         * @param {String} name
         * @return {Function} preprocessor
         * @private
         * @static
         */
        getPreprocessor: function(name) {
            return this.preprocessors[name];
        },

        /**
         * @private
         */
        getPreprocessors: function() {
            return this.preprocessors;
        },

        /**
         * @private
         */
        defaultPreprocessors: [],

        /**
         * 获取默认预处理器
         * @return {Function[]} defaultPreprocessors
         * @private
         * @static
         */
        getDefaultPreprocessors: function() {
            return this.defaultPreprocessors;
        },

        /**
         * Set the default array stack of default pre-processors
         *
         * @private
         * @param {Array} preprocessors
         * @return {Tk.Class} this
         * @static
         */
        setDefaultPreprocessors: function(preprocessors) {
            this.defaultPreprocessors = Tk.Array.from(preprocessors);

            return this;
        },

        /**
         * Insert this pre-processor at a specific position in the stack, optionally relative to
         * any existing pre-processor. For example:
         *
         *     Tk.Class.registerPreprocessor('debug', function(cls, data, fn) {
         *         // Your code here
         *
         *         if (fn) {
         *             fn.call(this, cls, data);
         *         }
         *     }).setDefaultPreprocessorPosition('debug', 'last');
         *
         * @private
         * @param {String} name The pre-processor name. Note that it needs to be registered with
         * {@link Tk.Class#registerPreprocessor registerPreprocessor} before this
         * @param {String} offset The insertion position. Four possible values are:
         * 'first', 'last', or: 'before', 'after' (relative to the name provided in the third argument)
         * @param {String} relativeName
         * @return {Tk.Class} this
         * @static
         */
        setDefaultPreprocessorPosition: function(name, offset, relativeName) {
            var defaultPreprocessors = this.defaultPreprocessors,
                index;

            if (typeof offset == 'string') {
                if (offset === 'first') {
                    defaultPreprocessors.unshift(name);

                    return this;
                }
                else if (offset === 'last') {
                    defaultPreprocessors.push(name);

                    return this;
                }

                offset = (offset === 'after') ? 1 : -1;
            }

            index = Tk.Array.indexOf(defaultPreprocessors, relativeName);

            if (index !== -1) {
                Tk.Array.splice(defaultPreprocessors, Math.max(0, index + offset), 0, name);
            }

            return this;
        }
    });

    /**
     * @cfg {String} extend
     * The parent class that this class extends. For example:
     *
     *     Tk.define('Person', {
     *         say: function(text) { alert(text); }
     *     });
     *
     *     Tk.define('Developer', {
     *         extend: 'Person',
     *         say: function(text) { this.callParent(["print "+text]); }
     *     });
     */
    ExtClass.registerPreprocessor('extend', function(Class, data, hooks) {
        
        var Base = Tk.Base,
            basePrototype = Base.prototype,
            extend = data.extend,
            Parent, parentPrototype, i;

        delete data.extend;

        if (extend && extend !== Object) {
            Parent = extend;
        }
        else {
            Parent = Base;
        }

        parentPrototype = Parent.prototype;

        if (!Parent.$isClass) {
            for (i in basePrototype) {
                if (!parentPrototype[i]) {
                    parentPrototype[i] = basePrototype[i];
                }
            }
        }

        Class.extend(Parent);

        Class.triggerExtended.apply(Class, arguments);

        if (data.onClassExtended) {
            Class.onExtended(data.onClassExtended, Class);
            delete data.onClassExtended;
        }

    }, true); // true to always run this preprocessor even w/o "extend" keyword


    //<feature classSystem.statics>
    /**
     * @cfg {Object} statics
     * 静态方法. For example:
     *
     *     Tk.define('Computer', {
     *          statics: {
     *              factory: function(brand) {
     *                  // 'this' in static methods refer to the class itself
     *                  return new this(brand);
     *              }
     *          },
     *
     *          constructor: function() { ... }
     *     });
     *
     *     var dellComputer = Computer.factory('Dell');
     */
    ExtClass.registerPreprocessor('statics', function(Class, data) {
        
        Class.addStatics(data.statics);

        delete data.statics;
    });
    //</feature>

    //<feature classSystem.inheritableStatics>
    /**
     * @cfg {Object} inheritableStatics
     * 会被子类继承的静态方法
     */
    ExtClass.registerPreprocessor('inheritableStatics', function(Class, data) {
        
        Class.addInheritableStatics(data.inheritableStatics);

        delete data.inheritableStatics;
    });
    //</feature>

    Tk.createRuleFn = function (code) {
        return new Function('$c', 'with($c) { return (' + code + '); }');
    };

    //<feature classSystem.mixins>
    /**
     * @cfg {String[]/Object} mixins
     * 一组用于混合的类. 例如:
     *
     *     Tk.define('CanSing', {
     *          sing: function() {
     *              alert("For he's a jolly good fellow...")
     *          }
     *     });
     *
     *     Tk.define('Musician', {
     *          mixins: ['CanSing']
     *     })
     *
     * 此时，Musician 通过混合 CanSing 获得 `sing` 方法
     *
     * 如果 Musician 已经有 `sing` 方法? 或者你要混入两个类的
     *  `sing` 方法? 那么最好把 mixins 定义成对象:
     *
     *     Tk.define('Musician', {
     *          mixins: {
     *              canSing: 'CanSing'
     *          },
     * 
     *          sing: function() {
     *              // delegate singing operation to mixin
     *              this.mixins.canSing.sing.call(this);
     *          }
     *     })
     *
     * 原来有一个自动混入的 `sing` 方法，此时 Musician 的`sing` 方法 覆盖了混入的
     * `sing` 方法，不过你还是可以通过 `mixins` 属性去访问.
     */
    ExtClass.registerPreprocessor('mixins', function(Class, data, hooks) {
        //<debug>
        Tk.classSystemMonitor && Tk.classSystemMonitor(Class, 'Tk.Class#mixinsPreprocessor', arguments);
        //</debug>
        
        var mixins = data.mixins,
            onCreated = hooks.onCreated;

        delete data.mixins;

        hooks.onCreated = function() {

            // Put back the original onCreated before processing mixins. This allows a
            // mixin to hook onCreated by access Class._classHooks.
            hooks.onCreated = onCreated;

            Class.mixin(mixins);

            // We must go back to hooks.onCreated here because it may have changed during
            // calls to onClassMixedIn.
            return hooks.onCreated.apply(this, arguments);
        };
    });
    //</feature>


    //<feature classSystem.backwardsCompatible>
    // Backwards compatible
    Tk.extend = function(Class, Parent, members) {
            
        if (arguments.length === 2 && Tk.isObject(Parent)) {
            members = Parent;
            Parent = Class;
            Class = null;
        }

        var cls;

        if (!Parent) {
            throw new Error("[Tk.extend] Attempting to extend from a class which has not been loaded on the page.");
        }

        members.extend = Parent;
        members.preprocessors = [
            'extend'
            //<feature classSystem.statics>
            ,'statics'
            //</feature>
            //<feature classSystem.inheritableStatics>
            ,'inheritableStatics'
            //</feature>
            //<feature classSystem.mixins>
            ,'mixins'
            //</feature>
            //<feature classSystem.platformConfig>
            ,'platformConfig'
            //</feature>
            //<feature classSystem.config>
            ,'config'
            //</feature>
        ];

        if (Class) {
            cls = new ExtClass(Class, members);
            // The 'constructor' is given as 'Class' but also needs to be on prototype
            cls.prototype.constructor = Class;
        } else {
            cls = new ExtClass(members);
        }

        cls.prototype.override = function(o) {
            for (var m in o) {
                if (o.hasOwnProperty(m)) {
                    this[m] = o[m];
                }
            }
        };

        return cls;
    };
    //</feature>

}());
