// @tag class
/**
 * @class Tk.Base
 *
 * 所有类的祖先 {@link Tk#define}.
 *
 * Tk 管理的所有类都继承自 Tk.Base。
 * Tk.Base 的所有原型或静态成员都会被其他类继承
 */
Tk.Base = (function(flexSetter) {
    // @define Tk.Base
    // @require Tk.Util
    // @require Tk.Version
    // @require Tk.Configurator
    // @uses Tk.ClassManager
    var noArgs = [],
        baseStaticMember,
        baseStaticMembers = [],
        makeAliasFn = function(name) {
            return function() {
                return this[name].apply(this, arguments);
            };
        },
        Version = Tk.Version,
        leadingDigitRe = /^\d/,
        oneMember = {},
        aliasOneMember = {},
        Base = function() {},
        BasePrototype = Base.prototype;

    // These static properties will be copied to every newly created class with {@link Tk#define}
    Tk.apply(Base, {
        $className: 'Tk.Base',

        $isClass: true,

        /**
         * 创建一个当前类的实例
         * Create a new instance of this Class.
         *
         *     Tk.define('My.cool.Class', {
         *         ...
         *     });
         *
         * 所有参数会被传递到类的构造函数
         *
         * @return {Object} 新创建的实例
         * @static
         * @inheritable
         */
        create: function() {
            return Tk.create.apply(Tk, [this].concat(Array.prototype.slice.call(arguments, 0)));
        },

        /**
         * @private
         * @static
         * @inheritable
         * @param config
         */
        extend: function(parent) {
            var me = this,
                parentPrototype = parent.prototype,
                prototype, i, ln, name, statics;

            prototype = me.prototype = Tk.Object.chain(parentPrototype);
            prototype.self = me;

            me.superclass = prototype.superclass = parentPrototype;

            if (!parent.$isClass) {
                for (i in BasePrototype) {
                    if (i in prototype) {
                        prototype[i] = BasePrototype[i];
                    }
                }
            }

            //<feature classSystem.inheritableStatics>
            // Statics inheritance
            statics = parentPrototype.$inheritableStatics;

            if (statics) {
                for (i = 0, ln = statics.length; i < ln; i++) {
                    name = statics[i];

                    if (!me.hasOwnProperty(name)) {
                        me[name] = parent[name];
                    }
                }
            }
            //</feature>

            if (parent.$onExtended) {
                me.$onExtended = parent.$onExtended.slice();
            }
        },

        /**
         * @private
         * @static
         * @inheritable
         */
        $onExtended: [],

        /**
         * @private
         * @static
         * @inheritable
         */
        triggerExtended: function() {
            var callbacks = this.$onExtended,
                ln = callbacks.length,
                i, callback;

            if (ln > 0) {
                for (i = 0; i < ln; i++) {
                    callback = callbacks[i];
                    callback.fn.apply(callback.scope || this, arguments);
                }
            }
        },

        /**
         * @private
         * @static
         * @inheritable
         */
        onExtended: function(fn, scope) {
            this.$onExtended.push({
                fn: fn,
                scope: scope
            });

            return this;
        },

        /**
         * 添加 或者 重载 这个类的静态成员
         *
         *     Tk.define('My.cool.Class', {
         *         ...
         *     });
         *
         *     My.cool.Class.addStatics({
         *         someProperty: 'someValue',      // My.cool.Class.someProperty = 'someValue'
         *         method1: function() { ... },    // My.cool.Class.method1 = function() { ... };
         *         method2: function() { ... }     // My.cool.Class.method2 = function() { ... };
         *     });
         *
         * @param {Object} members
         * @return {Tk.Base} this
         * @static
         * @inheritable
         */
        addStatics: function(members) {
            this.addMembers(members, true);
            return this;
        },

        /**
         * @private
         * @static
         * @inheritable
         * @param {Object} members
         */
        addInheritableStatics: function(members) {
            var inheritableStatics,
                hasInheritableStatics,
                prototype = this.prototype,
                name, member;

            inheritableStatics = prototype.$inheritableStatics;
            hasInheritableStatics = prototype.$hasInheritableStatics;

            if (!inheritableStatics) {
                inheritableStatics = prototype.$inheritableStatics = [];
                hasInheritableStatics = prototype.$hasInheritableStatics = {};
            }

            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];
                    this[name] = member;

                    if (!hasInheritableStatics[name]) {
                        hasInheritableStatics[name] = true;
                        inheritableStatics.push(name);
                    }
                }
            }

            return this;
        },

        /**
         * 对类的原型添加方法或者属性
         *
         *     Tk.define('My.awesome.Cat', {
         *         constructor: function() {
         *             ...
         *         }
         *     });
         *
         *      My.awesome.Cat.addMembers({
         *          meow: function() {
         *             alert('Meowww...');
         *          }
         *      });
         *
         *      var kitty = new My.awesome.Cat();
         *      kitty.meow();
         *
         * @param {Object} members 添加到这个类的成员对象
         * @param {Boolean} [isStatic=false] 当 `true` 表示成员是静态的
         * @param {Boolean} [privacy=false] `true` 表示成员是私有的，调试模式下针对成员方法使用
         * @static
         * @inheritable
         */
        addMembers: function(members, isStatic, privacy) {
            var me = this, // 这个类
                cloneFunction = Tk.Function.clone,
                target = isStatic ? me : me.prototype,
                defaultConfig = !isStatic && target.defaultConfig,
                enumerables = Tk.enumerables,
                privates = members.privates,
                configs, i, ln, member, name, subPrivacy, privateStatics;

            if (privates) {
                // This won't run for normal class private members but will pick up all
                // others (statics, overrides, etc).
                delete members.privates;
                if (!isStatic) {
                    privateStatics = privates.statics;
                    delete privates.statics;
                }

                me.addMembers(privates, isStatic, subPrivacy);
                if (privateStatics) {
                    me.addMembers(privateStatics, true, subPrivacy);
                }
            }

            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];

                    if (typeof member === 'function' && !member.$isClass && !member.$nullFn) {
                        if (member.$owner) {
                            member = cloneFunction(member);
                        }

                        if (target.hasOwnProperty(name)) {
                            member.$previous = target[name];
                        }

                        // This information is needed by callParent() and callSuper() as
                        // well as statics() and even Tk.fly().
                        member.$owner = me;
                        member.$name = name;

                        // The last part of the check here resolves a conflict if we have the same property
                        // declared as both a config and a member on the class so that the config wins.
                    }

                    target[name] = member;
                }
            }

            if (enumerables) {
                for (i = 0, ln = enumerables.length; i < ln; ++i) {
                    if (members.hasOwnProperty(name = enumerables[i])) {
                        member = members[name];

                        // The enumerables are all functions...
                        if (member && !member.$nullFn) {
                            if (member.$owner) {
                                member = cloneFunction(member);
                            }

                            member.$owner = me;
                            member.$name = name;

                            if (target.hasOwnProperty(name)) {
                                member.$previous = target[name];
                            }
                        }

                        target[name] = member;
                    }
                }
            }

            return this;
        },

        /**
         * @private
         * @static
         * @inheritable
         * @param name
         * @param member
         */
        addMember: function(name, member) {
            oneMember[name] = member;
            this.addMembers(oneMember);
            delete oneMember[name];
            return this;
        },

        /**
         * Override members of this class. Overridden methods can be invoked via
         * {@link Tk.Base#callParent}.
         *
         *     Tk.define('My.Cat', {
         *         constructor: function() {
         *             alert("I'm a cat!");
         *         }
         *     });
         *
         *     My.Cat.override({
         *         constructor: function() {
         *             alert("I'm going to be a cat!");
         *
         *             this.callParent(arguments);
         *
         *             alert("Meeeeoooowwww");
         *         }
         *     });
         *
         *     var kitty = new My.Cat(); // alerts "I'm going to be a cat!"
         *                               // alerts "I'm a cat!"
         *                               // alerts "Meeeeoooowwww"
         *
         * Direct use of this method should be rare. Use {@link Tk#define Tk.define}
         * instead:
         *
         *     Tk.define('My.CatOverride', {
         *         override: 'My.Cat',
         *         constructor: function() {
         *             alert("I'm going to be a cat!");
         *
         *             this.callParent(arguments);
         *
         *             alert("Meeeeoooowwww");
         *         }
         *     });
         *
         * The above accomplishes the same result but can be managed by the {@link Tk.Loader}
         * which can properly order the override and its target class and the build process
         * can determine whether the override is needed based on the required state of the
         * target class (My.Cat).
         *
         * @param {Object} members The properties to add to this class. This should be
         * specified as an object literal containing one or more properties.
         * @return {Tk.Base} this class
         * @static
         * @inheritable
         */
        override: function(members) {
            var me = this,
                statics = members.statics,
                inheritableStatics = members.inheritableStatics,
                config = members.config,
                mixins = members.mixins,
                cachedConfig = members.cachedConfig;

            if (statics || inheritableStatics || config) {
                members = Tk.apply({}, members);
            }

            if (statics) {
                me.addMembers(statics, true);
                delete members.statics;
            }

            if (inheritableStatics) {
                me.addInheritableStatics(inheritableStatics);
                delete members.inheritableStatics;
            }
            delete members.mixins;

            me.addMembers(members);
            if (mixins) {
                me.mixin(mixins);
            }
            return me;
        },

        /**
         * @protected
         * @static
         * @inheritable
         */
        callParent: function(args) {
            var method;

            return (method = this.callParent.caller) && (method.$previous ||
                ((method = method.$owner ? method : method.caller) &&
                    method.$owner.superclass.self[method.$name])).apply(this, args || noArgs);
        },

        /**
         * @protected
         * @static
         * @inheritable
         */
        callSuper: function(args) {
            var method;

            return (method = this.callSuper.caller) &&
                ((method = method.$owner ? method : method.caller) &&
                    method.$owner.superclass.self[method.$name]).apply(this, args || noArgs);
        },

        //<feature classSystem.mixins>
        /**
         * Used internally by the mixins pre-processor
         * @private
         * @static
         * @inheritable
         */
        mixin: function(name, mixinClass) {
            var me = this,
                mixin, prototype, key, statics, i, ln, staticName, mixinValue, mixins;

            if (typeof name !== 'string') {
                mixins = name;
                if (mixins instanceof Array) {
                    for (i = 0, ln = mixins.length; i < ln; i++) {
                        mixin = mixins[i];
                        me.mixin(mixin.prototype.mixinId || mixin.$className, mixin);
                    }
                } else {
                    // mixins 是一个对象
                    // mixins: {
                    //     foo: ...
                    // }
                    for (var mixinName in mixins) {
                        me.mixin(mixinName, mixins[mixinName]);
                    }
                }
                return;
            }

            mixin = mixinClass.prototype;
            prototype = me.prototype;

            if (mixin.onClassMixedIn) {
                mixin.onClassMixedIn.call(mixinClass, me);
            }

            if (!prototype.hasOwnProperty('mixins')) {
                if ('mixins' in prototype) {
                    prototype.mixins = Tk.Object.chain(prototype.mixins);
                } else {
                    prototype.mixins = {};
                }
            }

            for (key in mixin) {
                mixinValue = mixin[key];
                if (key === 'mixins') {
                    // 如果两个父类使用了同一个 mixin，那么以第一个为主，后面的不考虑
                    Tk.applyIf(prototype.mixins, mixinValue);
                } else if (!(key === 'mixinId' || key === 'config') && (prototype[key] === undefined)) {
                    prototype[key] = mixinValue;
                }
            }

            //<feature classSystem.inheritableStatics>
            // 混合 静态方法
            statics = mixin.$inheritableStatics;

            if (statics) {
                for (i = 0, ln = statics.length; i < ln; i++) {
                    staticName = statics[i];

                    if (!me.hasOwnProperty(staticName)) {
                        me[staticName] = mixinClass[staticName];
                    }
                }
            }
            //</feature>

            prototype.mixins[name] = mixin;

            if (mixin.afterClassMixedIn) {
                mixin.afterClassMixedIn.call(mixinClass, me);
            }

            return me;
        },
        //</feature>

        /**
         * 获取当前类的字符串类名
         *
         *     Tk.define('My.cool.Class', {
         *         constructor: function() {
         *             alert(this.self.getName()); // alerts 'My.cool.Class'
         *         }
         *     });
         *
         *     My.cool.Class.getName(); // 'My.cool.Class'
         *
         * @return {String} className
         * @static
         * @inheritable
         */
        getName: function() {
            return Tk.getClassName(this);
        }
    });

    // Capture the set of static members on Tk.Base that we want to copy to all
    // derived classes. This array is used by Tk.Class as well as the optimizer.
    for (baseStaticMember in Base) {
        if (Base.hasOwnProperty(baseStaticMember)) {
            baseStaticMembers.push(baseStaticMember);
        }
    }

    Base.$staticMembers = baseStaticMembers;

    Base.addMembers({
        /** @private */
        $className: 'Tk.Base',

        /**
         * @property {Boolean} isInstance
         * 用来区分字面量对象和类实例对象
         * @protected
         * @readonly
         */
        isInstance: true,

        /**
         * @property {Boolean} destroyed
         * `destroy` 方法调用后设置为 `true` 
         * @protected
         */
        destroyed: false,

        /**
         * 如果在某个类的方法内调用 `this.statics()` 返回该个类的静态成员，与作用于无关，无论 `this` 指向谁
         * 如果不是在方法内调用 `this.statics()`，那么实例 this 对应的
         * 
         *     Tk.define('My.Cat', {
         *         statics: {
         *             totalCreated: 0,
         *             speciesName: 'Cat' // My.Cat.speciesName = 'Cat'
         *         },
         *
         *         constructor: function() {
         *             var statics = this.statics();
         *
         *             alert(statics.speciesName);     // always equals to 'Cat' no matter what 'this' refers to
         *                                             // equivalent to: My.Cat.speciesName
         *
         *             alert(this.self.speciesName);   // dependent on 'this'
         *
         *             statics.totalCreated++;
         *         },
         *
         *         clone: function() {
         *             var cloned = new this.self();   // dependent on 'this'
         *
         *             cloned.groupName = this.statics().speciesName;   // equivalent to: My.Cat.speciesName
         *
         *             return cloned;
         *         }
         *     });
         *
         *
         *     Tk.define('My.SnowLeopard', {
         *         extend: 'My.Cat',
         *
         *         statics: {
         *             speciesName: 'Snow Leopard'     // My.SnowLeopard.speciesName = 'Snow Leopard'
         *         },
         *
         *         constructor: function() {
         *             this.callParent();
         *         }
         *     });
         *
         *     var cat = new My.Cat();                 // alerts 'Cat', then alerts 'Cat'
         *
         *     var snowLeopard = new My.SnowLeopard(); // alerts 'Cat', then alerts 'Snow Leopard'
         *
         *     var clone = snowLeopard.clone();
         *     alert(Tk.getClassName(clone));         // alerts 'My.SnowLeopard'
         *     alert(clone.groupName);                 // alerts 'Cat'
         *
         *     alert(My.Cat.totalCreated);             // alerts 3
         *
         * @protected
         * @return {Tk.Class}
         */
        statics: function() {
            var method = this.statics.caller,
                self = this.self;

            if (!method) {
                return self;
            }

            return method.$owner;
        },

        /**
         * Call the "parent" method of the current method. That is the method previously
         * overridden by derivation or by an override (see {@link Tk#define}).
         *
         *      Tk.define('My.Base', {
         *          constructor: function (x) {
         *              this.x = x;
         *          },
         *
         *          statics: {
         *              method: function (x) {
         *                  return x;
         *              }
         *          }
         *      });
         *
         *      Tk.define('My.Derived', {
         *          extend: 'My.Base',
         *
         *          constructor: function () {
         *              this.callParent([21]);
         *          }
         *      });
         *
         *      var obj = new My.Derived();
         *
         *      alert(obj.x);  // alerts 21
         *
         * This can be used with an override as follows:
         *
         *      Tk.define('My.DerivedOverride', {
         *          override: 'My.Derived',
         *
         *          constructor: function (x) {
         *              this.callParent([x*2]); // calls original My.Derived constructor
         *          }
         *      });
         *
         *      var obj = new My.Derived();
         *
         *      alert(obj.x);  // now alerts 42
         *
         * This also works with static and private methods.
         *
         *      Tk.define('My.Derived2', {
         *          extend: 'My.Base',
         *
         *          // privates: {
         *          statics: {
         *              method: function (x) {
         *                  return this.callParent([x*2]); // calls My.Base.method
         *              }
         *          }
         *      });
         *
         *      alert(My.Base.method(10));     // alerts 10
         *      alert(My.Derived2.method(10)); // alerts 20
         *
         * Lastly, it also works with overridden static methods.
         *
         *      Tk.define('My.Derived2Override', {
         *          override: 'My.Derived2',
         *
         *          // privates: {
         *          statics: {
         *              method: function (x) {
         *                  return this.callParent([x*2]); // calls My.Derived2.method
         *              }
         *          }
         *      });
         *
         *      alert(My.Derived2.method(10); // now alerts 40
         *
         * To override a method and replace it and also call the superclass method, use
         * {@link #method-callSuper}. This is often done to patch a method to fix a bug.
         *
         * @protected
         * @param {Array/Arguments} args The arguments, either an array or the `arguments` object
         * from the current method, for example: `this.callParent(arguments)`
         * @return {Object} Returns the result of calling the parent method
         */
        callParent: function(args) {
            // NOTE: this code is deliberately as few expressions (and no function calls)
            // as possible so that a debugger can skip over this noise with the minimum number
            // of steps. Basically, just hit Step Into until you are where you really wanted
            // to be.
            var method,
                superMethod = (method = this.callParent.caller) && (method.$previous ||
                    ((method = method.$owner ? method : method.caller) &&
                        method.$owner.superclass[method.$name]));

            return superMethod.apply(this, args || noArgs);
        },

        /**
         * This method is used by an **override** to call the superclass method but 
         * bypass any overridden method. This is often done to "patch" a method that 
         * contains a bug but for whatever reason cannot be fixed directly.
         * 
         * Consider:
         * 
         *      Tk.define('Tk.some.Class', {
         *          method: function () {
         *              console.log('Good');
         *          }
         *      });
         * 
         *      Tk.define('Tk.some.DerivedClass', {
         *          extend: 'Tk.some.Class',
         *          
         *          method: function () {
         *              console.log('Bad');
         * 
         *              // ... logic but with a bug ...
         *              
         *              this.callParent();
         *          }
         *      });
         * 
         * To patch the bug in `Tk.some.DerivedClass.method`, the typical solution is to create an
         * override:
         * 
         *      Tk.define('App.patches.DerivedClass', {
         *          override: 'Tk.some.DerivedClass',
         *          
         *          method: function () {
         *              console.log('Fixed');
         * 
         *              // ... logic but with bug fixed ...
         *
         *              this.callSuper();
         *          }
         *      });
         * 
         * The patch method cannot use {@link #method-callParent} to call the superclass 
         * `method` since that would call the overridden method containing the bug. In 
         * other words, the above patch would only produce "Fixed" then "Good" in the 
         * console log, whereas, using `callParent` would produce "Fixed" then "Bad" 
         * then "Good".
         *
         * @protected
         * @param {Array/Arguments} args The arguments, either an array or the `arguments` object
         * from the current method, for example: `this.callSuper(arguments)`
         * @return {Object} Returns the result of calling the superclass method
         */
        callSuper: function(args) {
            // NOTE: this code is deliberately as few expressions (and no function calls)
            // as possible so that a debugger can skip over this noise with the minimum number
            // of steps. Basically, just hit Step Into until you are where you really wanted
            // to be.
            var method,
                superMethod = (method = this.callSuper.caller) &&
                ((method = method.$owner ? method : method.caller) &&
                    method.$owner.superclass[method.$name]);

            //<debug>
            if (!superMethod) {
                method = this.callSuper.caller;
                var parentClass, methodName;

                if (!method.$owner) {
                    if (!method.caller) {
                        throw new Error("Attempting to call a protected method from the public scope, which is not allowed");
                    }

                    method = method.caller;
                }

                parentClass = method.$owner.superclass;
                methodName = method.$name;

                if (!(methodName in parentClass)) {
                    throw new Error("this.callSuper() was called but there's no such method (" + methodName +
                        ") found in the parent class (" + (Tk.getClassName(parentClass) || 'Object') + ")");
                }
            }
            //</debug>

            return superMethod.apply(this, args || noArgs);
        },

        /**
         * @property {Tk.Class} self
         *
         * Get the reference to the current class from which this object was instantiated. Unlike {@link Tk.Base#statics},
         * `this.self` is scope-dependent and it's meant to be used for dynamic inheritance. See {@link Tk.Base#statics}
         * for a detailed comparison
         *
         *     Tk.define('My.Cat', {
         *         statics: {
         *             speciesName: 'Cat' // My.Cat.speciesName = 'Cat'
         *         },
         *
         *         constructor: function() {
         *             alert(this.self.speciesName); // dependent on 'this'
         *         },
         *
         *         clone: function() {
         *             return new this.self();
         *         }
         *     });
         *
         *
         *     Tk.define('My.SnowLeopard', {
         *         extend: 'My.Cat',
         *         statics: {
         *             speciesName: 'Snow Leopard'         // My.SnowLeopard.speciesName = 'Snow Leopard'
         *         }
         *     });
         *
         *     var cat = new My.Cat();                     // alerts 'Cat'
         *     var snowLeopard = new My.SnowLeopard();     // alerts 'Snow Leopard'
         *
         *     var clone = snowLeopard.clone();
         *     alert(Tk.getClassName(clone));             // alerts 'My.SnowLeopard'
         *
         * @protected
         */
        self: Base,

        // Default constructor, simply returns `this`
        constructor: function() {
            return this;
        },

        $links: null,

        /**
         * 关联 "可销毁" 对象，这些关联的对象会在实例销毁时一并销毁 (通过 `{@link #destroy}`).
         * @param {String} name
         * @param {Object} value
         * @return {Object} 参数 `value`
         * @private
         */
        link: function(name, value) {
            var me = this,
                links = me.$links || (me.$links = {});

            links[name] = true;
            me[name] = value;

            return value;
        },

        /**
         * 销毁通过 `{@link #link linked}` 关联的对象
         * 实例销毁时会自动调用该方法，除非你要在实例销毁前销毁关联资源，否则不需要手动调用该方法
         * @param {String[]} names 关联的资源名称数组
         * @return {Tk.Base} this
         * @private
         */
        unlink: function(names) {
            var me = this,
                i, ln, link, value;

            for (i = 0, ln = names.length; i < ln; i++) {
                link = names[i];
                value = me[link];

                if (value) {
                    if (value.isInstance && !value.destroyed) {
                        value.destroy();
                    } else if (value.parentNode && 'nodeType' in value) {
                        value.parentNode.removeChild(value);
                    }
                }

                me[link] = null;
            }

            return me;
        },

        /**
         * 该方法用来清理对象和相关资源，该方法调用后，不能再使用该实例
         */
        destroy: function() {
            var me = this,
                links = me.$links;

            me.initialConfig = me.config = null;

            me.destroy = Tk.emptyFn;
            // isDestroyed added for compat reasons
            me.isDestroyed = me.destroyed = true;

            if (links) {
                me.$links = null;
                me.unlink(Tk.Object.getKeys(links));
            }
        }
    });

    BasePrototype.callOverridden = BasePrototype.callParent;

    return Base;

}(Tk.Function.flexSetter));