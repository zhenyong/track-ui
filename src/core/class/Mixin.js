/**
 * 作为混合 mixins 用法的基础部分
 *
 * 可以让被混合的类，在主体类调用某个方法的前后可以拦截做一些事情，例如在主体类的 destroy 
 * 方法调用后，混合类能自动清理自身资源
 *
 * 例如，你设计一个基类：
 * 
 *      Tk.define('Foo.bar.Base', {
 *          destroy: function () {
 *              console.log('B');
 *              // cleanup
 *          }
 *      });
 *
 * 子类:
 *
 *      Tk.define('Foo.bar.Derived', {
 *          extend: 'Foo.bar.Base',
 *
 *          destroy: function () {
 *              console.log('D');
 *              // more cleanup
 *
 *              this.callParent(); // 子类销毁后，也要调用父类的销毁
 *          }
 *      });
 *
 * 如果混合一个别的类，那么当前类销毁时，怎么让被混合的资源也一起销毁呢
 * 你可能会这样：
 * 
 *      Tk.define('Foo.bar.Util', {
 *          destroy: function () {
 *              console.log('U');
 *          }
 *      });
 * 
 *      Tk.define('Foo.bar.Derived', {
 *          extend: 'Foo.bar.Base',
 *
 *          mixins: {
 *              util: 'Foo.bar.Util'
 *          },
 *
 *          destroy: function () {
 *              console.log('D');
 *              // 清理父类和混合的资源
 *
 *              this.mixins.util.destroy.call(this);//手动调用混合类的销毁
 *
 *              this.callParent(); // 让父类清理资源
 *          }
 *      });
 *
 *      var obj = new Foo.bar.Derived();
 *
 *      obj.destroy();
 *      //打印 D -> U -> B
 *
 * Mixin 这个类就是为了解决这种手动清理混合资源而生
 *
 * ## mixinConfig
 * 
 * 被混合的类配置 `mixinConfig` 提供 "before" 和 "after" 钩子函数.
 * 
 *      Tk.define('Foo.bar.Util', {
 *          extend: 'Tk.Mixin',
 *
 *          mixinConfig: {
 *              after: {
 *                  destroy: 'destroyUtil'
 *              }
 *          },
 *          
 *          destroyUtil: function () {
 *              console.log('U');
 *          }
 *      });
 * 
 *      Tk.define('Foo.bar.Class', {
 *          mixins: {
 *              util: 'Foo.bar.Util'
 *          },
 *
 *          destroy: function () {
 *              console.log('D');
 *          }
 *      });
 *
 *      var obj = new Foo.bar.Derived();
 *
 *      obj.destroy();
 *      // 打印 D -> U
 * 
 *  使用 `before`:
 * 
 *      Tk.define('Foo.bar.Util', {
 *          extend: 'Tk.Mixin',
 *
 *          mixinConfig: {
 *              before: {
 *                  destroy: 'destroyUtil'
 *              }
 *          },
 *          
 *          destroyUtil: function () {
 *              console.log('U');
 *          }
 *      });
 * 
 *      Tk.define('Foo.bar.Class', {
 *          mixins: {
 *              util: 'Foo.bar.Util'
 *          },
 *
 *          destroy: function () {
 *              console.log('D');
 *          }
 *      });
 *
 *      var obj = new Foo.bar.Derived();
 *
 *      obj.destroy();
 *      // 打印 U -> D
 *
 * ### Chaining
 *
 * 如果你让mixin的类的方法能像父类一样，通过 `callParent` 就能一并清理，那么可以用
 *  `on` 声明. 对应的方法会挂到 `callParent` 的执行链中（在父类的方法前）
 *
 *      Tk.define('Foo.bar.Util', {
 *          extend: 'Tk.Mixin',
 *
 *          mixinConfig: {
 *              on: {
 *                  destroy: function () {
 *                      console.log('M');
 *                  }
 *              }
 *          }
 *      });
 *
 *      Tk.define('Foo.bar.Base', {
 *          destroy: function () {
 *              console.log('B');
 *          }
 *      });
 *
 *      Tk.define('Foo.bar.Derived', {
 *          extend: 'Foo.bar.Base',
 *
 *          mixins: {
 *              util: 'Foo.bar.Util'
 *          },
 *
 *          destroy: function () {
 *              this.callParent();
 *              console.log('D');
 *          }
 *      });
 *
 *      var obj = new Foo.bar.Derived();
 *
 *      obj.destroy();
 *      // 打印 M -> B -> D
 *
 * `before`  `after` `on` 可以用自身方法名表示
 *
 *      Tk.define('Foo.bar.Util', {
 *          extend: 'Tk.Mixin',
 *
 *          mixinConfig: {
 *              on: {
 *                  destroy: 'onDestroy'
 *              }
 *          }
 *
 *          onDestroy: function () {
 *              console.log('M');
 *          }
 *      });
 *
 * Because this technique leverages `callParent`, the derived class controls the time and
 * parameters for the call to all of its bases (be they `extend` or `mixin` flavor).
 *
 * ### Derivations
 *
 * 有时候，混合类需要在宿主类被继承的时候做一些事情：
 * 
 *      Tk.define('Foo.bar.Util', {
 *          extend: 'Tk.Mixin',
 *
 *          mixinConfig: {
 *              extended: function (baseClass, derivedClass, classBody) {
 *                  // 如果某个父类混合了 Foo.bar.Util,那么当父类被继承的时候，这个方法就会执行
 *              }
 *          }
 *      });
 *
 * @protected
 */
Tk.define('Tk.Mixin', function (Mixin) { return {

    statics: {
        addHook: function (hookFn, targetClass, methodName, mixinClassPrototype) {
            var isFunc = Tk.isFunction(hookFn),
                hook = function () {
                    var a = arguments,
                        fn = isFunc ? hookFn : mixinClassPrototype[hookFn],
                        result = this.callParent(a);
                    fn.apply(this, a);
                    return result;
                },
                existingFn = targetClass.hasOwnProperty(methodName) &&
                             targetClass[methodName];

            if (isFunc) {
                hookFn.$previous = Tk.emptyFn; // no callParent for these guys
            }

            hook.$name = methodName;
            hook.$owner = targetClass.self;

            if (existingFn) {
                hook.$previous = existingFn.$previous;
                existingFn.$previous = hook;
            } else {
                targetClass[methodName] = hook;
            }
        }
    },

    onClassTkended: function(cls, data) {
        var mixinConfig = data.mixinConfig,
            hooks = data.xhooks,
            superclass = cls.superclass,
            onClassMixedIn = data.onClassMixedIn,
            parentMixinConfig,
            befores, afters, extended;

        if (hooks) {
            // Legacy way
            delete data.xhooks;
            (mixinConfig || (data.mixinConfig = mixinConfig = {})).on = hooks;
        }

        if (mixinConfig) {
            parentMixinConfig = superclass.mixinConfig;

            if (parentMixinConfig) {
                data.mixinConfig = mixinConfig = Tk.merge({}, parentMixinConfig, mixinConfig);
            }

            data.mixinId = mixinConfig.id;

            befores = mixinConfig.before;
            afters = mixinConfig.after;
            hooks = mixinConfig.on;
            extended = mixinConfig.extended;
        }

        if (befores || afters || hooks || extended) {
            // Note: tests are with Tk.Class
            data.onClassMixedIn = function (targetClass) {
                var mixin = this.prototype,
                    targetProto = targetClass.prototype,
                    key;

                if (befores) {
                    Tk.Object.each(befores, function (key, value) {
                        targetClass.addMember(key, function () {
                            if (mixin[value].apply(this, arguments) !== false) {
                                return this.callParent(arguments);
                            }
                        });
                    });
                }

                if (afters) {
                    Tk.Object.each(afters, function (key, value) {
                        targetClass.addMember(key, function () {
                            var ret = this.callParent(arguments);
                            mixin[value].apply(this, arguments);
                            return ret;
                        });
                    });
                }

                if (hooks) {
                    for (key in hooks) {
                        Mixin.addHook(hooks[key], targetProto, key, mixin);
                    }
                }

                if (extended) {
                    targetClass.onTkended(function () {
                        var args = Tk.Array.slice(arguments, 0);
                        args.unshift(targetClass);
                        return extended.apply(this, args);
                    }, this);
                }

                if (onClassMixedIn) {
                    onClassMixedIn.apply(this, arguments);
                }
            };
        }
    }
};});
