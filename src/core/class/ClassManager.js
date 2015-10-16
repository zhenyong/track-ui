// @tag class
/**
 * @class Tk.ClassManager
 *
 * Tk.ClassManager 管理所有的类以及类名到类（构造函数）的映射
 * 
 * 通常都不会直接调用 Tk.ClassManager,而是用下面这些方便的调用：
 *
 * - {@link Tk#define Tk.define}
 * - {@link Tk#create Tk.create}
 * - {@link Tk#getClass Tk.getClass}
 * - {@link Tk#getClassName Tk.getClassName}
 *
 * # 基本语法:
 *
 *     Tk.define(className, properties);
 *
 *  `properties` 是一个字面量对象，会应用到类上。
 * {@link Tk.ClassManager#create} 有更详细的介绍
 *
 *     Tk.define('Person', {
 *          name: 'Unknown',
 *
 *          constructor: function(name) {
 *              if (name) {
 *                  this.name = name;
 *              }
 *          },
 *
 *          eat: function(foodType) {
 *              alert("I'm eating: " + foodType);
 *
 *              return this;
 *          }
 *     });
 *
 *     var aaron = new Person("Aaron");
 *     aaron.eat("Sandwich"); // alert("I'm eating: Sandwich");
 *
 * Tk.Class 有一组强大的可扩展的 {@link Tk.Class#registerPreprocessor pre-processors} 跟类创建相关的预处理器，
 * 默认包括 inheritance, mixins, statics 等等，你可以自定义预处理器，让所有类都获得你要的效果
 *
 * # extend 继承 预处理器:
 *
 *     Tk.define('Developer', {
 *          extend: 'Person',
 *
 *          constructor: function(name, isGeek) {
 *              this.isGeek = isGeek;
 *
 *              // 调用父类的' 原型方法
 *              this.callParent([name]);
 *          },
 *
 *          code: function(language) {
 *              alert("I'm coding in: " + language);
 *
 *              this.eat("Bugs");
 *
 *              return this;
 *          }
 *     });
 *
 *     var jacky = new Developer("Jacky", true);
 *     jacky.code("JavaScript"); // alert("I'm coding in: JavaScript");
 *                               // alert("I'm eating: Bugs");
 *
 *  {@link Tk.Base#callParent} 包含更多调用父类方法的介绍
 *
 * # mixins 混合 预处理器:
 *
 *     Tk.define('CanPlayGuitar', {
 *          playGuitar: function() {
 *             alert("F#...G...D...A");
 *          }
 *     });
 *
 *     Tk.define('CanComposeSongs', {
 *          composeSongs: function() { ... }
 *     });
 *
 *     Tk.define('CanSing', {
 *          sing: function() {
 *              alert("For he's a jolly good fellow...")
 *          }
 *     });
 *
 *     Tk.define('Musician', {
 *          extend: 'Person',
 *
 *          mixins: {
 *              canPlayGuitar: 'CanPlayGuitar',
 *              canComposeSongs: 'CanComposeSongs',
 *              canSing: 'CanSing'
 *          }
 *     })
 *
 *     Tk.define('CoolPerson', {
 *          extend: 'Person',
 *
 *          mixins: {
 *              canPlayGuitar: 'CanPlayGuitar',
 *              canSing: 'CanSing'
 *          },
 *
 *          sing: function() {
 *              alert("Ahem....");
 *
 *              this.mixins.canSing.sing.call(this);
 *
 *              alert("[Playing guitar at the same time...]");
 *
 *              this.playGuitar();
 *          }
 *     });
 *
 *     var me = new CoolPerson("Jacky");
 *
 *     me.sing(); // alert("Ahem...");
 *                // alert("For he's a jolly good fellow...");
 *                // alert("[Playing guitar at the same time...]");
 *                // alert("F#...G...D...A");
 *
 * 查看 {@link Tk.Base#statics} 和 {@link Tk.Base#self} 了解关于获取静态属性和静态方法
 *
 * @singleton
 */
Tk.ClassManager = (function(Class, alias, arraySlice, arrayFrom, global) {
    // @define Tk.ClassManager
    // @require Tk.Class
    // @require Tk.Function
    // @require Tk.Array

    var makeCtor = Tk.Class.makeCtor,
        //<if nonBrowser>
        isNonBrowser = typeof window === 'undefined',
        //</if>
        nameLookupStack = [],
        namespaceCache = {
            Tk: {
                name: 'Tk',
                value: Tk // specially added for sandbox (Tk === global.Tk6)
            }
        },

        Manager = Tk.apply({}, {
            /**
             * @property {Object} classes
             * 存放所有定义的类映射<string类名：Class类（构造函数）>
             * @private
             */
            classes: {},

            classState: {
                /*
                 * 'Tk.foo.Bar': <state enum>
                 *
                 *  10 = Tk.define called
                 *  20 = Tk.define/override called
                 *  30 = Manager.existCache[<name>] == true for define
                 *  40 = Manager.existCache[<name>] == true for define/override
                 *  50 = Manager.isCreated(<name>) == true for define
                 *  60 = Manager.isCreated(<name>) == true for define/override
                 *
                 */
            },

            /**
             * @private
             */
            existCache: {},

            /** @private */
            instantiators: [],

            /**
             * 检测一个类是否已经定义
             *
             * @param {String} className
             * @return {Boolean} exist
             */
            isCreated: function(className) {
                if (Manager.classes[className] || Manager.existCache[className]) {
                    return true;
                }

                if (!Manager.lookupName(className, false)) {
                    return false;
                }

                Manager.triggerCreated(className);
                return true;
            },

            /**
             * @private
             */
            createdListeners: [],

            /**
             * @private
             */
            nameCreatedListeners: {},

            /**
             * @private
             */
            existsListeners: [],

            /**
             * @private
             */
            nameExistsListeners: {},

            /**
             * @private
             */
            overrideMap: {},

            /**
             * @private
             */
            triggerCreated: function(className, state) {
                Manager.existCache[className] = state || 1;
                Manager.classState[className] += 40;
                Manager.notify(className, Manager.createdListeners, Manager.nameCreatedListeners);
            },

            /**
             * @private
             */
            onCreated: function(fn, scope, className) {
                Manager.addListener(fn, scope, className, Manager.createdListeners, Manager.nameCreatedListeners);
            },

            /**
             * @private
             */
            notify: function (className, listeners, nameListeners) {
                var /*alternateNames = Manager.getAlternatesByName(className),
                    */names = [className],
                    i, ln, j, subLn, listener, name;

                for (i = 0,ln = listeners.length; i < ln; i++) {
                    listener = listeners[i];
                    listener.fn.call(listener.scope, className);
                }

                // while (names) {
                    for (i = 0,ln = names.length; i < ln; i++) {
                        name = names[i];
                        listeners = nameListeners[name];

                        if (listeners) {
                            for (j = 0,subLn = listeners.length; j < subLn; j++) {
                                listener = listeners[j];
                                listener.fn.call(listener.scope, name);
                            }
                            delete nameListeners[name];
                        }
                    }

                //     names = alternateNames; // for 2nd pass (if needed)
                //     alternateNames = null; // no 3rd pass
                // }
            },

            /**
             * @private
             */
            addListener: function(fn, scope, className, listeners, nameListeners) {
                if (Tk.isArray(className)) {
                    fn = Tk.Function.createBarrier(className.length, fn, scope);
                    for (i = 0; i < className.length; i++) {
                        this.addListener(fn, null, className[i], listeners, nameListeners);
                    }
                    return;
                }
                var i,
                    listener = {
                        fn: fn,
                        scope: scope
                    };

                if (className) {
                    if (this.isCreated(className)) {
                        fn.call(scope, className);
                        return;
                    }

                    if (!nameListeners[className]) {
                        nameListeners[className] = [];
                    }

                    nameListeners[className].push(listener);
                } else {
                    listeners.push(listener);
                }
            },

            /**
             * Supports namespace rewriting.
             * @private
             */
            $namespaceCache: namespaceCache,

            /**
             * Return the namespace cache entry for the given a class name or namespace (e.g.,
             * "Tk.grid.Panel").
             *
             * @param {String} namespace The namespace or class name to lookup.
             * @return {Object} The cache entry.
             * @return {String} return.name The leaf name ("Panel" for "Tk.grid.Panel").
             * @return {Object} return.parent The entry of the parent namespace (i.e., "Tk.grid").
             * @return {Object} return.value The namespace object. This is only set for
             * top-level namespace entries to support renaming them for sandboxing ("Tk6" vs
             * "Tk").
             * @since 6.0.0
             * @private
             */
            getNamespaceEntry: function(namespace) {
                if (typeof namespace !== 'string') {
                    return namespace; // assume we've been given an entry object
                }

                var entry = namespaceCache[namespace],
                    i;

                if (!entry) {
                    i = namespace.lastIndexOf('.');

                    if (i < 0) {
                        entry = {
                            name: namespace
                        };
                    } else {
                        entry = {
                            name: namespace.substring(i + 1),
                            parent: Manager.getNamespaceEntry(namespace.substring(0, i))
                        };
                    }

                    namespaceCache[namespace] = entry;
                }

                return entry;
            },

            /**
             * Return the value of the given "dot path" name. This supports remapping (for use
             * in sandbox builds) as well as auto-creating of namespaces.
             *
             * @param {String} namespace The name of the namespace or class.
             * @param {Boolean} [autoCreate] Pass `true` to create objects for undefined names.
             * @return {Object} The object that is the namespace or class name.
             * @since 6.0.0
             * @private
             */
            lookupName: function(namespace, autoCreate) {
                var entry = Manager.getNamespaceEntry(namespace),
                    scope = Tk.global,
                    i = 0,
                    e, parent;

                // Put entries on the stack in reverse order: [ 'Panel', 'grid', 'Tk' ]
                for (e = entry; e; e = e.parent) {
                    // since we process only what we add to the array, and that always
                    // starts at index=0, we don't need to clean up the array (that would
                    // just encourage the GC to do something pointless).
                    nameLookupStack[i++] = e;
                }

                while (scope && i-- > 0) {
                    // We'll process entries in top-down order ('Tk', 'grid' then 'Panel').
                    e = nameLookupStack[i];
                    parent = scope;

                    scope = e.value || scope[e.name];

                    if (!scope && autoCreate) {
                        parent[e.name] = scope = {};
                    }
                }

                return scope;
            },

            /**
             * 创建一个命名空间，设置值
             *
             *     Tk.ClassManager.setNamespace('MyCompany.pkg.Example', someObject);
             *
             *     alert(MyCompany.pkg.Example === someObject); // alerts true
             *
             * @param {String} name
             * @param {Object} value
             */
            setNamespace: function(namespace, value) {
                var entry = Manager.getNamespaceEntry(namespace),
                    scope = Tk.global;

                if (entry.parent) {
                    scope = Manager.lookupName(entry.parent, true);
                }

                scope[entry.name] = value;

                return value;
            },

            /**
             * 设置一个字符串类名（命名空间）映射到一个类
             *
             * @param {String} name
             * @param {Object} value
             * @return {Tk.ClassManager} this
             */
            set: function(name, value) {
                var targetName = Manager.getName(value);

                Manager.classes[name] = Manager.setNamespace(name, value);

                return Manager;
            },

            /**
             * 通过字符串类名获得类
             *
             * @param {String} name
             * @return {Tk.Class} class
             */
            get: function(name) {
                return Manager.classes[name] || Manager.lookupName(name, false);
            },

            /**
             * 通过类或者示例获得字符串类名
             * 通常这么用 {@link Tk#getClassName}.
             *
             *     Tk.ClassManager.getName(Tk.Action); // returns "Tk.Action"
             *
             * @param {Tk.Class/Object} object
             * @return {String} className
             */
            getName: function(object) {
                return object && object.$className || '';
            },

            /**
             * 通过示例获得类，如果不是一个 Tk 管理的类示例则返回 null
             * 通常这么用 {@link Tk#getClass}.
             *
             *     var component = new Tk.Component();
             *
             *     Tk.getClass(component); // returns Tk.Component
             *
             * @param {Object} object
             * @return {Tk.Class} class
             */
            getClass: function(object) {
                return object && object.self || null;
            },

            /**
             * 定义一个类
             * @deprecated Use {@link Tk#define} instead, as that also supports creating overrides.
             * @private
             */
            create: function(className, data, createdFn) {
                //<debug>
                //警告 classname 不合法
                //</debug>

                var ctor = makeCtor(className);
                if (typeof data === 'function') {
                    data = data(ctor);
                }

                //<debug>
                //TODO 警告重复
                //</debug>

                data.$className = className;

                return new Class(ctor, data, function() {
                    var postprocessorStack = data.postprocessors || Manager.defaultPostprocessors,
                        registeredPostprocessors = Manager.postprocessors,
                        postprocessors = [],
                        postprocessor, i, ln, j, subLn, postprocessorProperties, postprocessorProperty;

                    delete data.postprocessors;

                    for (i = 0, ln = postprocessorStack.length; i < ln; i++) {
                        postprocessor = postprocessorStack[i];

                        if (typeof postprocessor === 'string') {
                            postprocessor = registeredPostprocessors[postprocessor];
                            postprocessorProperties = postprocessor.properties;

                            if (postprocessorProperties === true) {
                                postprocessors.push(postprocessor.fn);
                            } else if (postprocessorProperties) {
                                for (j = 0, subLn = postprocessorProperties.length; j < subLn; j++) {
                                    postprocessorProperty = postprocessorProperties[j];

                                    if (data.hasOwnProperty(postprocessorProperty)) {
                                        postprocessors.push(postprocessor.fn);
                                        break;
                                    }
                                }
                            }
                        } else {
                            postprocessors.push(postprocessor);
                        }
                    }

                    data.postprocessors = postprocessors;
                    data.createdFn = createdFn;
                    Manager.processCreate(className, this, data);
                });
            },

            processCreate: function(className, cls, clsData) {
                var me = this,
                    postprocessor = clsData.postprocessors.shift(),
                    createdFn = clsData.createdFn;

                if (!postprocessor) {
                    if (className) {
                        me.set(className, cls);
                    }

                    delete cls._classHooks;

                    if (createdFn) {
                        createdFn.call(cls, cls);
                    }

                    if (className) {
                        me.triggerCreated(className);
                    }
                    return;
                }

                if (postprocessor.call(me, className, cls, clsData, me.processCreate) !== false) {
                    me.processCreate(className, cls, clsData);
                }
            },

            createOverride: function(className, data, createdFn) {
                var me = this,
                    overriddenClassName = data.override,
                    uses = data.uses,
                    mixins = data.mixins,
                    mixinsIsArray,
                    compat = 1, // default if 'compatibility' is not specified
                    depedenciesLoaded,
                    classReady = function() {
                        var cls, i, key, temp;

                        // transform mixin class names into class references, This
                        // loop can handle both the array and object forms of
                        // mixin definitions
                        if (mixinsIsArray) {
                            for (i = 0, temp = mixins.length; i < temp; ++i) {
                                if (Tk.isString(cls = mixins[i])) {
                                    mixins[i] = Tk.ClassManager.get(cls);
                                }
                            }
                        } else if (mixins) {
                            for (key in mixins) {
                                if (Tk.isString(cls = mixins[key])) {
                                    mixins[key] = Tk.ClassManager.get(cls);
                                }
                            }
                        }

                        // The target class and the required classes for this override are
                        // ready, so we can apply the override now:
                        cls = me.get(overriddenClassName);

                        // We don't want to apply these:
                        delete data.override;
                        delete data.compatibility;
                        delete data.uses;

                        Tk.override(cls, data);

                        if (createdFn) {
                            createdFn.call(cls, cls); // last but not least!
                        }
                    };

                Manager.overrideMap[className] = true;

                // If specified, parse strings as versions, but otherwise treat as a
                // boolean (maybe "compatibility: Tk.isIE8" or something).
                //
                if ('compatibility' in data && Tk.isString(compat = data.compatibility)) {
                    compat = Tk.checkVersion(compat);
                }

                if (compat) {
                    // Override the target class right after it's created
                    me.onCreated(classReady, me, overriddenClassName);
                }

                me.triggerCreated(className, 2);
                return me;
            },


            /**
             * @private
             * @param length
             */
            getInstantiator: function(length) {
                var instantiators = this.instantiators,
                    instantiator,
                    i,
                    args;

                instantiator = instantiators[length];

                if (!instantiator) {
                    i = length;
                    args = [];

                    for (i = 0; i < length; i++) {
                        args.push('a[' + i + ']');
                    }

                    instantiator = instantiators[length] = new Function('c', 'a', 'return new c(' + args.join(',') + ')');
                    //<debug>
                    instantiator.name = "Tk.create" + length;
                    //</debug>
                }

                return instantiator;
            },

            /**
             * @private
             */
            postprocessors: {},

            /**
             * @private
             */
            defaultPostprocessors: [],

            /**
             * 注册类定义的“后处理器”
             *
             * @private
             * @param {String} name
             * @param {Function} postprocessor
             */
            registerPostprocessor: function(name, fn, properties, position, relativeTo) {
                if (!position) {
                    position = 'last';
                }

                if (!properties) {
                    properties = [name];
                }

                this.postprocessors[name] = {
                    name: name,
                    properties: properties || false,
                    fn: fn
                };

                this.setDefaultPostprocessorPosition(name, position, relativeTo);

                return this;
            },

            /**
             * 用于调整“后处理器”的执行顺序
             *
             * @private
             * @param {String} name “后处理器”的名字，针对通过
             * {@link Tk.ClassManager#registerPostprocessor} 注册的处理器
             * @param {String} offset 执行位置，四种值
             * 'first', 'last', or: 'before', 'after' (位置相对于第三个参数)
             * @param {String} relativeName
             * @return {Tk.ClassManager} this
             */
            setDefaultPostprocessorPosition: function(name, offset, relativeName) {
                var defaultPostprocessors = this.defaultPostprocessors,
                    index;

                if (typeof offset === 'string') {
                    if (offset === 'first') {
                        defaultPostprocessors.unshift(name);

                        return this;
                    } else if (offset === 'last') {
                        defaultPostprocessors.push(name);

                        return this;
                    }

                    offset = (offset === 'after') ? 1 : -1;
                }

                index = Tk.Array.indexOf(defaultPostprocessors, relativeName);

                if (index !== -1) {
                    Tk.Array.splice(defaultPostprocessors, Math.max(0, index + offset), 0, name);
                }

                return this;
            }
        });


    /**
     * @cfg {String} override
     * @member Tk.Class
     * 覆盖某个类的成员
     * 
     * **NOTE:** 目标类必须是通过 {@link Tk#define Tk.define} 定义的类
     *
     * 覆盖后的方法并不会自动调用被覆盖的方法，你要调用"父亲的"方法则要在方法体内，调用
     * {@link Tk.Base#callParent callParent}
     * 如果要跳过被覆盖的方法，而直接调用目标类的父类的方法，则使用 
     * {@link Tk.Base#callSuper callSuper}.
     *
     * 更多例子请查看 {@link Tk#define Tk.define}
     */

    //<feature classSystem.singleton>
    /**
     * @cfg {Boolean} singleton
     * @member Tk.Class
     * 如果为 true，则会创建一个类的单例，例如：
     *
     *     Tk.define('Logger', {
     *         singleton: true,
     *         log: function(msg) {
     *             console.log(msg);
     *         }
     *     });
     *
     *     Logger.log('Hello');
     */
    Manager.registerPostprocessor('singleton', function(name, cls, data, fn) {
        if (data.singleton) {
            fn.call(this, name, new cls(), data);
        } else {
            return true;
        }
        return false;
    });
    //</feature>

    Tk.apply(Tk, {
        /**
         * 通过类名创建一个实例:
         *
         *      var window = Tk.create('Tk.window.Window', {
         *          width: 600,
         *          height: 800,
         *          ...
         *      });
         *
         *
         * @param {String} [name] 类名
         * @param {Object...} [args] 作为类构造函数的参数
         * @return {Object} instance
         * @member Tk
         * @method create
         */
        create: function() {
            var name = arguments[0],
                nameType = typeof name,
                args = arraySlice.call(arguments, 1),
                cls;

            if (nameType === 'function') {
                cls = name;
            } else {
                if (nameType !== 'string' && args.length === 0) {
                    args = [name];
                    if (!(name = name.xclass)) {
                        name = args[0].xtype;
                        if (name) {
                            name = 'widget.' + name;
                        }
                    }
                }

                // name = Manager.resolveName(name);
                cls = Manager.get(name);
            }

            // Still not existing at this point, try to load it via synchronous mode as the last resort
            if (!cls) {
                //TODO 如果创建没有定义的要提醒
            }

            return Manager.getInstantiator(args.length)(cls, args);
        },


        /**
         * 定义或者覆盖类. 这么用:
         *
         *      Tk.define('My.awesome.Class', {
         *          someProperty: 'something',
         *
         *          someMethod: function(s) {
         *              alert(s + this.someProperty);
         *          }
         *
         *          ...
         *      });
         *
         *      var obj = new My.awesome.Class();
         *
         *      obj.someMethod('Say '); // alerts 'Say something'
         *
         * 创建匿名类的话，把类名设置为 `null`
         *
         *      Tk.define(null, {
         *          constructor: function () {
         *              // ...
         *          }
         *      });
         *
         * 有时候，你创建的类有些私有信息，你不希望外部访问到。通常这么做
         *
         *      Tk.define('MyApp.foo.Bar', function () {
         *          var id = 0;//外部访问不了 id 了
         *
         *          return {
         *              nextId: function () {
         *                  return ++id;
         *              }
         *          };
         *      });
         *
         * 当使用 override 的时候，上面的语法不太合适，因为传递的方法需要先执行，然后根据返回的结果
         * 去判断这次是要定义一个新类，还是覆盖。因此，最好让函数立刻执行，返回成员对象
         * 
         *      Tk.define('MyApp.override.BaseOverride', function () {
         *          var counter = 0;
         *
         *          return {
         *              override: 'Tk.Component',
         *              logId: function () {
         *                  console.log(++counter, this.id);
         *              }
         *          };
         *      }());
         * 
         *
         * 像下面这样用 `Tk.define`, 你就可以方便获得类本身的静态成员
         *
         *      Tk.define('MyApp.foo.Bar', function (Bar) {
         *          return {
         *              statics: {
         *                  staticMethod: function () {
         *                      // ...
         *                  }
         *              },
         *
         *              method: function () {
         *                  return Bar.staticMethod();
         *              }
         *          };
         *      });
         *
         * 使用 `override` 覆盖一个类并不会产生一个新的类，只是原来的类被改造了。
         *
         * @param {String} className 类名，建议用点分开, 例如:
         * 'My.very.awesome.Class'
         *  - 根部和类名用驼峰命名，其他部分用小写
         *  传  `null` 则匿名类
         * @param {Object} data 键-值 对象表示类的成员. 下面是一些关键字，不能使用:
         *  
         *  - {@link Tk.Class#cfg-extend extend}
         *  - {@link Tk.Class#cfg-inheritableStatics inheritableStatics}
         *  - {@link Tk.Class#cfg-mixins mixins}
         *  - {@link Tk.Class#cfg-override override}
         *  - `self`
         *  - {@link Tk.Class#cfg-singleton singleton}
         *  - {@link Tk.Class#cfg-statics statics}
         *
         * @param {Function} [createdFn] 类创建完之后的回调，`this` 指向新创建的类
         * @return {Tk.Base}
         * @member Tk
         */
        define: function(className, data, createdFn) {
            if (data.override) {
                Manager.classState[className] = 20;
                return Manager.createOverride.apply(Manager, arguments);
            }

            Manager.classState[className] = 10;
            return Manager.create.apply(Manager, arguments);
        },

        /**
         * @inheritdoc Tk.ClassManager#getName
         * @member Tk
         * @method getClassName
         */
        getClassName: alias(Manager, 'getName'),

        /**
         * 返回类或者示例的名称，便于调试
         * @param {Object} object
         * @return {String}
         */
        getDisplayName: function(object) {
            if (object) {
                if (object.displayName) {
                    return object.displayName;
                }

                if (object.$name && object.$class) {
                    return Tk.getClassName(object.$class) + '#' + object.$name;
                }

                if (object.$className) {
                    return object.$className;
                }
            }

            return 'Anonymous';
        },

        /**
         * @inheritdoc Tk.ClassManager#getClass
         * @member Tk
         * @method getClass
         */
        getClass: alias(Manager, 'getClass'),

        /**
         * 创建命名空间，用法:
         *
         *     Tk.namespace('root', 'root.a');
         *
         *     // 等同于
         *     Tk.namespace('root.a');
         *     Tk.ns('root.a');
         *
         *     如果 window.root.a 原来有值，那么啥事都没发生，否则 window.root.a 初始化为 {}
         *
         *     Company.data.CustomStore = function(config) { ... };
         *
         * @param {String...} namespaces
         * @return {Object} 命名空间最后一级对应的对象
         * @member Tk
         * @method namespace
         */
        namespace: function() {
            var root = global,
                i;

            for (i = arguments.length; i-- > 0;) {
                root = Manager.lookupName(arguments[i], true);
            }

            return root;
        }
    });

    /**
     * 相当于 {@link Tk#namespace Tk.namespace}.
     * @inheritdoc Tk#namespace
     * @member Tk
     * @method ns
     */
    Tk.ns = Tk.namespace;

    Class.registerPreprocessor('className', function(cls, data) {
        if ('$className' in data) {
            cls.$className = data.$className;
        }
    }, true, 'first');

    return Manager;
}(Tk.Class, Tk.Function.alias, Array.prototype.slice, Tk.Array.from, Tk.global));