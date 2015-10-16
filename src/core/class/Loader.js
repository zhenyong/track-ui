// @tag class
/**
 *
 * 模块加载器，目前作用只是把字符串的模块名转化为具体的类函数。
 * 保留该模块，可能作异步依赖加载有用
 * 
 * @class Tk.Loader
 * @singleton
 */
Tk.Loader = (new function() {  // jshint ignore:line
// @define Tk.Loader
// @require Tk.Class
// @require Tk.ClassMgr

    var Loader = this,
        Manager = Tk.ClassMgr, // this is an instance of Tk.Inventory
        Class = Tk.Class,
        dependencyProperties = ['extend', 'mixins'/*, 'requires'*/];

//<feature classSystem.loader>
    /**
     * @cfg {String[]} requires
     * @member Tk.Class
     * List of classes that have to be loaded before instantiating this class.
     * For example:
     *
     *     Tk.define('Mother', {
     *         requires: ['Child'],
     *         giveBirth: function() {
     *             // we can be sure that child class is available.
     *             return new Child();
     *         }
     *     });
     */
    Class.registerPreprocessor('loader', function(cls, data, hooks, continueFn) {
        
        var me = this,
            className = Manager.getName(cls),
            i, j, ln, subLn, value, propertyName, propertyValue;

        /*
        Loop through the dependencyProperties, look for string class names and push
        them into a stack, regardless of whether the property's value is a string, array or object. For example:
        {
              extend: 'Tk.MyClass',
              requires: ['Tk.some.OtherClass'],
              mixins: {
                  thing: 'Foo.bar.Thing';
              }
        }
        which will later be transformed into:
        {
              extend: Tk.MyClass,
              requires: [Tk.some.OtherClass],
              mixins: {
                  thing: Foo.bar.Thing;
              }
        }
        */
       //TODO warning no defined class (mixins, extend) found
        for (i = 0,ln = dependencyProperties.length; i < ln; i++) {
            propertyName = dependencyProperties[i];

            if (data.hasOwnProperty(propertyName)) {
                propertyValue = data[propertyName];

                if (typeof propertyValue === 'string') {
                    data[propertyName] = Manager.get(propertyValue);
                }
                else if (propertyValue instanceof Array) {
                    for (j = 0, subLn = propertyValue.length; j < subLn; j++) {
                        value = propertyValue[j];

                        if (typeof value === 'string') {
                            data[propertyName][j] = Manager.get(value);
                        }
                    }
                }
                else if (typeof propertyValue !== 'function') {
                    for (var k in propertyValue) {
                        if (propertyValue.hasOwnProperty(k)) {
                            value = propertyValue[k];

                            if (typeof value === 'string') {
                                data[propertyName][k] = Manager.get(value);
                            }
                        }
                    }
                }
            }
        }

        continueFn.call(me, cls, data, hooks);

        return false;
    }, true, 'after', 'className');

}());
