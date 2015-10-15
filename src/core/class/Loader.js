// @tag class
/**
 * This class provides dynamic loading support for JavaScript classes. Application code
 * does not typically need to call `Tk.Loader` except perhaps to configure path mappings
 * when not using [Sencha Cmd](http://www.sencha.com/products/sencha-cmd/).
 *
 *      Tk.Loader.setPath('MyApp', 'app');
 *
 * When using Sencha Cmd, this is handled by the "bootstrap" provided by the application
 * build script and such configuration is not necessary.
 *
 * # Typical Usage
 *
 * The `Tk.Loader` is most often used behind the scenes to satisfy class references in
 * class declarations. Like so:
 *
 *      Tk.define('MyApp.view.Main', {
 *          extend: 'Tk.panel.Panel',
 *
 *          mixins: [
 *              'MyApp.util.Mixin'
 *          ],
 *
 *          requires: [
 *              'Tk.grid.Panel'
 *          ],
 *
 *          uses: [
 *              'MyApp.util.Stuff'
 *          ]
 *      });
 *
 * In all of these cases, `Tk.Loader` is used internally to resolve these class names
 * and ensure that the necessary class files are loaded.
 *
 * During development, these files are loaded individually for optimal debugging. For a
 * production use, [Sencha Cmd](http://www.sencha.com/products/sencha-cmd/) will replace
 * all of these strings with the actual resolved class references because it ensures that
 * the classes are all contained in the build in the correct order. In development, these
 * files will not be loaded until the `MyApp.view.Main` class indicates they are needed
 * as shown above.
 *
 * # Loading Classes
 *
 * You can also use `Tk.Loader` directly to load classes or files. The simplest form of
 * use is `{@link Tk#require}`.
 *
 * For example:
 *
 *      Tk.require('MyApp.view.Main', function () {
 *          // On callback, the MyApp.view.Main class is now loaded
 *
 *          var view = new MyApp.view.Main();
 *      });
 *
 * You can alternatively require classes by alias or wildcard.
 *
 *     Tk.require('widget.window');
 *
 *     Tk.require(['widget.window', 'layout.border', 'Tk.data.Connection']);
 *
 *     Tk.require(['widget.*', 'layout.*', 'Tk.data.*']);
 *
 * The callback function is optional.
 *
 * **Note** Using `Tk.require` at global scope will cause `{@link Tk#onReady}` and
 * `{@link Tk.app.Application#launch}` methods to be deferred until the required classes
 * are loaded. It is these cases where the callback function is most often unnecessary.
 *
 * ## Using Excludes
 *
 * Alternatively, you can exclude what you don't need:
 *
 *     // Include everything except Tk.tree.*
 *     Tk.exclude('Tk.tree.*').require('*');
 *
 *     // Include all widgets except widget.checkbox* (this will exclude
 *     // widget.checkbox, widget.checkboxfield, widget.checkboxgroup, etc.)
 *     Tk.exclude('widget.checkbox*').require('widget.*');
 *
 * # Dynamic Instantiation
 *
 * Another feature enabled by `Tk.Loader` is instantiation using class names or aliases.
 *
 * For example:
 *
 *      var win = Tk.create({
 *          xtype: 'window',
 *
 *          // or
 *          // xclass: 'Tk.window.Window'
 *
 *          title: 'Hello'
 *      });
 *
 * This form of creation can be useful if the type to create (`window` in the above) is
 * not known statically. Internally, `{@link Tk#create}` may need to *synchronously*
 * load the desired class and its requirements. Doing this will generate a warning in
 * the console:
 * 
 *      [Tk.Loader] Synchronously loading 'Tk.window.Window'...
 *
 * If you see these in your debug console, you should add the indicated class(es) to the
 * appropriate `requires` array (as above) or make an `{@link Tk#require}` call.
 * 
 * 
 * **Note** Using `{@link Tk#create}` has some performance overhead and is best reserved
 * for cases where the target class is not known until run-time.
 * 
 * @class Tk.Loader
 * @singleton
 */
Tk.Loader = (new function() {  // jshint ignore:line
// @define Tk.Loader
// @require Tk.Base
// @require Tk.Class
// @require Tk.ClassManager
// @require Tk.Function
// @require Tk.Array
// @require Tk.env.Ready

    var Loader = this,
        Manager = Tk.ClassManager, // this is an instance of Tk.Inventory
        Boot = Tk.Boot,
        Class = Tk.Class,
        Ready = Tk.env.Ready,
        alias = Tk.Function.alias,
        dependencyProperties = ['extend', 'mixins', 'requires'],
        isInHistory = {},
        history = [],
        readyListeners = [],
        usedClasses = [],
        _requiresMap = {},
        _missingQueue = {},
        _config = {
            /**
             * @cfg {Boolean} [enabled=true]
             * Whether or not to enable the dynamic dependency loading feature.
             */
            enabled: true,

            /**
             * @cfg {Boolean} [scriptChainDelay=false]
             * millisecond delay between asynchronous script injection (prevents stack
             * overflow on some user agents) 'false' disables delay but potentially
             * increases stack load.
             */
            scriptChainDelay: false,

            /**
             * @cfg {Boolean} [disableCaching=true]
             * Appends current timestamp to script files to prevent caching.
             */
            disableCaching: true,

            /**
             * @cfg {String} [disableCachingParam="_dc"]
             * The get parameter name for the cache buster's timestamp.
             */
            disableCachingParam: '_dc',

            /**
             * @cfg {Object} paths
             * The mapping from namespaces to file paths
             *
             *     {
             *         'Tk': '.', // This is set by default, Tk.layout.container.Container will be
             *                     // loaded from ./layout/Container.js
             *
             *         'My': './src/my_own_folder' // My.layout.Container will be loaded from
             *                                     // ./src/my_own_folder/layout/Container.js
             *     }
             *
             * Note that all relative paths are relative to the current HTML document.
             * If not being specified, for example, `Other.awesome.Class` will simply be
             * loaded from `"./Other/awesome/Class.js"`.
             */
            paths: Manager.paths,

            /**
             * @cfg {Boolean} preserveScripts
             * `false` to remove asynchronously loaded scripts, `true` to retain script
             * element for browser debugger compatibility and improved load performance.
             */
            preserveScripts: true,

            /**
             * @cfg {String} scriptCharset
             * Optional charset to specify encoding of dynamic script content.
             */
            scriptCharset: undefined
        },
        // These configs are delegated to Tk.Script and may need different names:
        delegatedConfigs = {
            disableCaching: true,
            disableCachingParam: true,
            preserveScripts: true,
            scriptChainDelay: 'loadDelay'
        };

    Tk.apply(Loader, {
        /**
         * @private
         */
        isInHistory: isInHistory,

        /**
         * Flag indicating whether there are still files being loaded
         * @private
         */
        isLoading: false,

        /**
         * An array of class names to keep track of the dependency loading order.
         * This is not guaranteed to be the same everytime due to the asynchronous
         * nature of the Loader.
         *
         * @property {Array} history
         */
        history: history,

        /**
         * Configuration
         * @private
         */
        config: _config,

        /**
         * Maintain the list of listeners to execute when all required scripts are fully loaded
         * @private
         */
        readyListeners: readyListeners,

        /**
         * Contains classes referenced in `uses` properties.
         * @private
         */
        optionalRequires: usedClasses,

        /**
         * Map of fully qualified class names to an array of dependent classes.
         * @private
         */
        requiresMap: _requiresMap,

        /** @private */
        hasFileLoadError: false,

        /**
         * The number of scripts loading via loadScript.
         * @private
         */
        scriptsLoading: 0,

        //<debug>
        /**
         * @private
         */
        classesLoading: [],
        //</debug>

        /**
         * @private
         */
        syncModeEnabled: false,

        
        /**
         * @private
         */
        missingQueue: _missingQueue,
        
        init: function () {
            // initalize the default path of the framework
            var scripts = document.getElementsByTagName('script'),
                src = scripts[scripts.length - 1].src,
                path = src.substring(0, src.lastIndexOf('/') + 1),
                meta = Tk._classPathMetadata,
                microloader = Tk.Microloader,
                manifest = Tk.manifest,
                loadOrder, baseUrl, loadlen, l, loadItem;

            //<debug>
            if (src.indexOf("packages/core/src/") !== -1) {
                path = path + "../../";
            } else if (src.indexOf("/core/src/class/") !== -1) {
                path = path + "../../../";
            }
            //</debug>

            
            if(!Manager.getPath("Tk")) {
                Manager.setPath('Tk', path + 'src');
            }

            // Pull in Cmd generated metadata if available.
            if (meta) {
                Tk._classPathMetadata = null;
                Loader.addClassPathMappings(meta);
            }
            
            if(manifest) {
                loadOrder = manifest.loadOrder;
                // if the manifest paths were calculated as relative to the 
                // bootstrap file, then we need to prepend Boot.baseUrl to the
                // paths before processing
                baseUrl = Tk.Boot.baseUrl;
                if(loadOrder && manifest.bootRelative) {
                    for(loadlen = loadOrder.length, l = 0; l < loadlen; l++) {
                        loadItem = loadOrder[l];
                        loadItem.path = baseUrl + loadItem.path;
                    }                    
                }
            }
            
            if(microloader) {
                Ready.block();
                microloader.onMicroloaderReady(function(){
                    Ready.unblock();
                });
            }
        },

        /**
         * Set the configuration for the loader. This should be called right after ext-(debug).js
         * is included in the page, and before Tk.onReady. i.e:
         *
         *     <script type="text/javascript" src="ext-core-debug.js"></script>
         *     <script type="text/javascript">
         *         Tk.Loader.setConfig({
         *           enabled: true,
         *           paths: {
         *               'My': 'my_own_path'
         *           }
         *         });
         *     </script>
         *     <script type="text/javascript">
         *         Tk.require(...);
         *
         *         Tk.onReady(function() {
         *           // application code here
         *         });
         *     </script>
         *
         * Refer to config options of {@link Tk.Loader} for the list of possible properties
         *
         * @param {Object} config The config object to override the default values
         * @return {Tk.Loader} this
         */
        setConfig: Tk.Function.flexSetter(function (name, value) {
            if (name === 'paths') {
                Loader.setPath(value);
            } else {
                _config[name] = value;

                var delegated = delegatedConfigs[name];
                if (delegated) {
                    Boot.setConfig((delegated === true) ? name : delegated, value);
                }
            }

            return Loader;
        }),

        /**
         * Get the config value corresponding to the specified name. If no name is given, will return the config object
         * @param {String} name The config property name
         * @return {Object}
         */
        getConfig: function(name) {
            return name ? _config[name] : _config;
        },

        /**
         * Sets the path of a namespace.
         * For Example:
         *
         *     Tk.Loader.setPath('Tk', '.');
         *
         * @param {String/Object} name See {@link Tk.Function#flexSetter flexSetter}
         * @param {String} [path] See {@link Tk.Function#flexSetter flexSetter}
         * @return {Tk.Loader} this
         * @method
         */
        setPath: function () {
            // Paths are an Tk.Inventory thing and ClassManager is an instance of that:
            Manager.setPath.apply(Manager, arguments);
            return Loader;
        },

        /**
         * Sets a batch of path entries
         *
         * @param {Object } paths a set of className: path mappings
         * @return {Tk.Loader} this
         */
        addClassPathMappings: function(paths) {
            // Paths are an Tk.Inventory thing and ClassManager is an instance of that:
            Manager.setPath(paths);
            return Loader;
        },

        /**
         * fixes up loader path configs by prepending Tk.Boot#baseUrl to the beginning
         * of the path, then delegates to Tk.Loader#addClassPathMappings
         * @param pathConfig
         */

        addBaseUrlClassPathMappings: function(pathConfig) {
            for(var name in pathConfig) {
                pathConfig[name] = Boot.baseUrl + pathConfig[name];
            }
            Tk.Loader.addClassPathMappings(pathConfig);
        },


        /**
         * Translates a className to a file path by adding the
         * the proper prefix and converting the .'s to /'s. For example:
         *
         *     Tk.Loader.setPath('My', '/path/to/My');
         *
         *     alert(Tk.Loader.getPath('My.awesome.Class')); // alerts '/path/to/My/awesome/Class.js'
         *
         * Note that the deeper namespace levels, if explicitly set, are always resolved first. For example:
         *
         *     Tk.Loader.setPath({
         *         'My': '/path/to/lib',
         *         'My.awesome': '/other/path/for/awesome/stuff',
         *         'My.awesome.more': '/more/awesome/path'
         *     });
         *
         *     alert(Tk.Loader.getPath('My.awesome.Class')); // alerts '/other/path/for/awesome/stuff/Class.js'
         *
         *     alert(Tk.Loader.getPath('My.awesome.more.Class')); // alerts '/more/awesome/path/Class.js'
         *
         *     alert(Tk.Loader.getPath('My.cool.Class')); // alerts '/path/to/lib/cool/Class.js'
         *
         *     alert(Tk.Loader.getPath('Unknown.strange.Stuff')); // alerts 'Unknown/strange/Stuff.js'
         *
         * @param {String} className
         * @return {String} path
         */
        getPath: function(className) {
            // Paths are an Tk.Inventory thing and ClassManager is an instance of that:
            return Manager.getPath(className);
        },

        require: function (expressions, fn, scope, excludes) {
            if (excludes) {
                return Loader.exclude(excludes).require(expressions, fn, scope);
            }

            var classNames = Manager.getNamesByExpression(expressions);

            return Loader.load(classNames, fn, scope);
        },

        syncRequire: function () {
            var wasEnabled = Loader.syncModeEnabled;

            Loader.syncModeEnabled = true;

            var ret = Loader.require.apply(Loader, arguments);

            Loader.syncModeEnabled = wasEnabled;

            return ret;
        },

        exclude: function (excludes) {
            var selector = Manager.select({
                    require: function (classNames, fn, scope) {
                        return Loader.load(classNames, fn, scope);
                    },

                    syncRequire: function (classNames, fn, scope) {
                        var wasEnabled = Loader.syncModeEnabled;

                        Loader.syncModeEnabled = true;

                        var ret = Loader.load(classNames, fn, scope);

                        Loader.syncModeEnabled = wasEnabled;

                        return ret;
                    }
                });

            selector.exclude(excludes);
            return selector;
        },

        load: function (classNames, callback, scope) {
            if (callback) {
                if (callback.length) {
                    // If callback expects arguments, shim it with a function that will map
                    // the requires class(es) from the names we are given.
                    callback = Loader.makeLoadCallback(classNames, callback);
                }
                callback = callback.bind(scope || Tk.global);
            }

            var missingClassNames = [],
                numClasses = classNames.length,
                className, i, numMissing, urls = [],
                state = Manager.classState;
            
            for (i = 0; i < numClasses; ++i) {
                className = Manager.resolveName(classNames[i]);
                if (!Manager.isCreated(className)) {
                    missingClassNames.push(className);
                    _missingQueue[className] = Loader.getPath(className);
                    if(!state[className]) {
                        urls.push(_missingQueue[className]);
                    }
                }
            }

            // If the dynamic dependency feature is not being used, throw an error
            // if the dependencies are not defined
            numMissing = missingClassNames.length;
            if (numMissing) {
                Loader.missingCount += numMissing;
                //<debug>
                Tk.Array.push(Loader.classesLoading, missingClassNames);
                //</debug>

                Manager.onCreated(function () {
                    //<debug>
                    Tk.Array.remove(Loader.classesLoading, missingClassNames);
                    Tk.each(missingClassNames, function(name){
                        Tk.Array.remove(Loader.classesLoading, name);
                    });
                    //</debug>
                    if (callback) {
                        Tk.callback(callback, scope, arguments);
                    }
                    Loader.checkReady();
                }, Loader, missingClassNames);

                if (!_config.enabled) {
                    Tk.raise("Tk.Loader is not enabled, so dependencies cannot be resolved dynamically. " +
                             "Missing required class" + ((missingClassNames.length > 1) ? "es" : "") + 
                             ": " + missingClassNames.join(', '));
                }

                if(urls.length) {
                    Loader.loadScripts({
                        url: urls,
                        // scope: this options object so we can pass these along:
                        _classNames: missingClassNames
                    });
                } else {
                    // need to call checkReady here, as the _missingCoun
                    // may have transitioned from 0 to > 0, meaning we
                    // need to block ready
                    Loader.checkReady();
                }
            } else {
                if (callback) {
                    callback.call(scope);
                }
                // need to call checkReady here, as the _missingCoun
                // may have transitioned from 0 to > 0, meaning we
                // need to block ready
                Loader.checkReady();
            }
            
            if (Loader.syncModeEnabled) {
                // Class may have been just loaded or was already loaded
                if (numClasses === 1) {
                    return Manager.get(classNames[0]);
                }
            }

            return Loader;
        },

        makeLoadCallback: function (classNames, callback) {
            return function () {
                var classes = [],
                    i = classNames.length;

                while (i-- > 0) {
                    classes[i] = Manager.get(classNames[i]);
                }

                return callback.apply(this, classes);
            };
        },
        
        onLoadFailure: function () {
            var options = this,
                onError = options.onError;

            Loader.hasFileLoadError = true;
            --Loader.scriptsLoading;

            if (onError) {
                //TODO: need an adapter to convert to v4 onError signatures
                onError.call(options.userScope, options);
            }
            //<debug>
            else {
                Tk.log.error("[Tk.Loader] Some requested files failed to load.");
            }
            //</debug>

            Loader.checkReady();
        },

        onLoadSuccess: function () {
            var options = this,
                onLoad = options.onLoad;

            --Loader.scriptsLoading;
            if (onLoad) {
                //TODO: need an adapter to convert to v4 onLoad signatures
                onLoad.call(options.userScope, options);
                // onLoad can cause more loads to start, so it must run first
            }

            Loader.checkReady();
        },

// TODO: this timing of this needs to be deferred until all classes have had a chance to be created
        //<debug>
        reportMissingClasses: function () {
            if (!Loader.syncModeEnabled && !Loader.scriptsLoading && Loader.isLoading &&
                    !Loader.hasFileLoadError) {
                var missingClasses = [],
                    missingPaths = [];

                for (var missingClassName in _missingQueue) {
                    missingClasses.push(missingClassName);
                    missingPaths.push(_missingQueue[missingClassName]);
                }

                if (missingClasses.length) {
                    throw new Error("The following classes are not declared even if their files have been " +
                        "loaded: '" + missingClasses.join("', '") + "'. Please check the source code of their " +
                        "corresponding files for possible typos: '" + missingPaths.join("', '"));
                }
            }
        },
        //</debug>

        /**
         * Add a new listener to be executed when all required scripts are fully loaded
         *
         * @param {Function} fn The function callback to be executed
         * @param {Object} scope The execution scope (`this`) of the callback function.
         * @param {Boolean} [withDomReady=true] Pass `false` to not also wait for document
         * dom ready.
         * @param {Object} [options] Additional callback options.
         * @param {Number} [options.delay=0] A number of milliseconds to delay.
         * @param {Number} [options.priority=0] Relative priority of this callback. Negative
         * numbers are reserved.
         */
        onReady: function(fn, scope, withDomReady, options) {
            if (withDomReady) {
                Ready.on(fn, scope, options);
            } else {
                var listener = Ready.makeListener(fn, scope, options);

                if (Loader.isLoading) {
                    readyListeners.push(listener);
                } else {
                    Ready.invoke(listener);
                }
            }
        },

        /**
         * @private
         * Ensure that any classes referenced in the `uses` property are loaded.
         */
        addUsedClasses: function (classes) {
            var cls, i, ln;

            if (classes) {
                classes = (typeof classes === 'string') ? [classes] : classes;
                for (i = 0, ln = classes.length; i < ln; i++) {
                    cls = classes[i];
                    if (typeof cls === 'string' && !Tk.Array.contains(usedClasses, cls)) {
                        usedClasses.push(cls);
                    }
                }
            }

            return Loader;
        },

        /**
         * @private
         */
        triggerReady: function() {
            var listener,
                refClasses = usedClasses;

            if (Loader.isLoading && refClasses.length) {
                // Empty the array to eliminate potential recursive loop issue
                usedClasses = [];

                // this may immediately call us back if all 'uses' classes
                // have been loaded
                Loader.require(refClasses);
            } else {
                // Must clear this before calling callbacks. This will cause any new loads
                // to call Ready.block() again. See below for more on this.
                Loader.isLoading = false;

                // These listeners are just those attached directly to Loader to wait for
                // class loading only.
                readyListeners.sort(Ready.sortFn);

                // this method can be called with Loader.isLoading either true or false
                // (can be called with false when all 'uses' classes are already loaded)
                // this may bypass the above if condition
                while (readyListeners.length && !Loader.isLoading) {
                    // we may re-enter triggerReady so we cannot necessarily iterate the
                    // readyListeners array
                    listener = readyListeners.pop();
                    Ready.invoke(listener);
                }

                // If the DOM is also ready, this will fire the normal onReady listeners.
                // An astute observer would note that we may now be back to isLoading and
                // so ask "Why you call unblock?". The reason is that we must match the
                // calls to block and since we transitioned from isLoading to !isLoading
                // here we must call unblock. If we have transitioned back to isLoading in
                // the above loop it will have called block again so the counter will be
                // increased and this call will not reduce the block count to 0. This is
                // done by loadScripts.
                Ready.unblock();
            }
        },

        /**
         * @private
         * @param {String} className
         */
        historyPush: function(className) {
            if (className && !isInHistory[className] && !Manager.overrideMap[className]) {
                isInHistory[className] = true;
                history.push(className);
            }
            return Loader;
        },

        /**
         * This is an internal method that delegate content loading to the 
         * bootstrap layer.
         * @private
         * @param params
         */
        loadScripts: function(params) {
            var manifest = Tk.manifest,
                loadOrder = manifest && manifest.loadOrder,
                loadOrderMap = manifest && manifest.loadOrderMap,
                options;
            
            ++Loader.scriptsLoading;
            
            // if the load order map hasn't been created, create it now 
            // and cache on the manifest
            if (loadOrder && !loadOrderMap) {
                manifest.loadOrderMap = loadOrderMap = Boot.createLoadOrderMap(loadOrder);
            }

            // verify the loading state, as this may have transitioned us from
            // not loading to loading
            Loader.checkReady();

            options = Tk.apply({
                loadOrder: loadOrder,
                loadOrderMap: loadOrderMap,
                charset: _config.scriptCharset,
                success: Loader.onLoadSuccess,
                failure: Loader.onLoadFailure,
                sync: Loader.syncModeEnabled,
                _classNames: []
            }, params);

            options.userScope = options.scope;
            options.scope = options;

            Boot.load(options);
        },

        /**
         * This method is provide for use by the bootstrap layer.
         * @private
         * @param {String[]} urls
         */
        loadScriptsSync: function(urls) {
            var syncwas = Loader.syncModeEnabled;
            Loader.syncModeEnabled = true;
            Loader.loadScripts({url: urls});
            Loader.syncModeEnabled = syncwas;
        },

        /**
         * This method is provide for use by the bootstrap layer.
         * @private
         * @param {String[]} urls
         */
        loadScriptsSyncBasePrefix: function(urls) {
            var syncwas = Loader.syncModeEnabled;
            Loader.syncModeEnabled = true;
            Loader.loadScripts({url: urls, prependBaseUrl: true});
            Loader.syncModeEnabled = syncwas;
        },
        
        /**
         * Loads the specified script URL and calls the supplied callbacks. If this method
         * is called before {@link Tk#isReady}, the script's load will delay the transition
         * to ready. This can be used to load arbitrary scripts that may contain further
         * {@link Tk#require Tk.require} calls.
         *
         * @param {Object/String/String[]} options The options object or simply the URL(s) to load.
         * @param {String} options.url The URL from which to load the script.
         * @param {Function} [options.onLoad] The callback to call on successful load.
         * @param {Function} [options.onError] The callback to call on failure to load.
         * @param {Object} [options.scope] The scope (`this`) for the supplied callbacks.
         */
        loadScript: function(options) {
            var isString = typeof options === 'string',
                isArray = options instanceof Array,
                isObject = !isArray && !isString,
                url = isObject ? options.url : options,
                onError = isObject && options.onError,
                onLoad = isObject && options.onLoad,
                scope = isObject && options.scope,
                request = {
                    url: url,
                    scope: scope,
                    onLoad: onLoad,
                    onError: onError,
                    _classNames: []
                };

            Loader.loadScripts(request);
        },

        /**
         * @private
         */
        flushMissingQueue: function() {
            var name, val, missingwas = 0, missing = 0;
            
            for(name in _missingQueue) {
                missingwas++;
                val = _missingQueue[name];
                if(Manager.isCreated(name)) {
                    delete _missingQueue[name];
                } else if (Manager.existCache[name] === 2) {
                    delete _missingQueue[name];
                } else {
                    ++missing;
                }
            }
            this.missingCount = missing;
        },

        /**
         * @private
         */
        checkReady: function() {
            var wasLoading = Loader.isLoading,
                isLoading;

            Loader.flushMissingQueue();
            isLoading = Loader.missingCount + Loader.scriptsLoading;
            
            if (isLoading && !wasLoading) {
                Ready.block();
                Loader.isLoading = !!isLoading;
            } else if (!isLoading && wasLoading) {
                Loader.triggerReady();
            }

            //<debug>
            if (!Loader.scriptsLoading && Loader.missingCount) {
                // Things look bad, but since load requests may come later, defer this
                // for a bit then check if things are still stuck.
                Tk.defer(function () {
                    if (!Loader.scriptsLoading && Loader.missingCount) {
                        Tk.log.error('[Loader] The following classes failed to load:');
                        for (var name in Loader.missingQueue) {
                            Tk.log.error('[Loader] ' + name + ' from ' +
                                Loader.missingQueue[name]);
                        }
                    }
                }, 1000);
            }
            //</debug>
        }
    });

    /**
     * Loads all classes by the given names and all their direct dependencies; optionally
     * executes the given callback function when finishes, within the optional scope.
     *
     * @param {String/String[]} expressions The class, classes or wildcards to load.
     * @param {Function} [fn] The callback function.
     * @param {Object} [scope] The execution scope (`this`) of the callback function.
     * @member Tk
     * @method require
     */
    Tk.require = alias(Loader, 'require');

    /**
     * Synchronously loads all classes by the given names and all their direct dependencies; optionally
     * executes the given callback function when finishes, within the optional scope.
     *
     * @param {String/String[]} expressions The class, classes or wildcards to load.
     * @param {Function} [fn] The callback function.
     * @param {Object} [scope] The execution scope (`this`) of the callback function.
     * @member Tk
     * @method syncRequire
     */
    Tk.syncRequire = alias(Loader, 'syncRequire');

    /**
     * Explicitly exclude files from being loaded. Useful when used in conjunction with a
     * broad include expression. Can be chained with more `require` and `exclude` methods,
     * for example:
     *
     *     Tk.exclude('Tk.data.*').require('*');
     *
     *     Tk.exclude('widget.button*').require('widget.*');
     *
     * @param {String/String[]} excludes
     * @return {Object} Contains `exclude`, `require` and `syncRequire` methods for chaining.
     * @member Tk
     * @method exclude
     */
    Tk.exclude = alias(Loader, 'exclude');

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
        //<debug>
        Tk.classSystemMonitor && Tk.classSystemMonitor(cls, 'Tk.Loader#loaderPreprocessor', arguments); // jshint ignore:line
        //</debug>
        
        var me = this,
            dependencies = [],
            dependency,
            className = Manager.getName(cls),
            i, j, ln, subLn, value, propertyName, propertyValue,
            requiredMap;

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

        for (i = 0,ln = dependencyProperties.length; i < ln; i++) {
            propertyName = dependencyProperties[i];

            if (data.hasOwnProperty(propertyName)) {
                propertyValue = data[propertyName];

                if (typeof propertyValue === 'string') {
                    dependencies.push(propertyValue);
                }
                else if (propertyValue instanceof Array) {
                    for (j = 0, subLn = propertyValue.length; j < subLn; j++) {
                        value = propertyValue[j];

                        if (typeof value === 'string') {
                            dependencies.push(value);
                        }
                    }
                }
                else if (typeof propertyValue !== 'function') {
                    for (j in propertyValue) {
                        if (propertyValue.hasOwnProperty(j)) {
                            value = propertyValue[j];

                            if (typeof value === 'string') {
                                dependencies.push(value);
                            }
                        }
                    }
                }
            }
        }

        if (dependencies.length === 0) {
            return;
        }
        if (className) {
            _requiresMap[className] = dependencies;
        }

        //<debug>
        var deadlockPath = [],
            detectDeadlock;

        /*
        Automatically detect deadlocks before-hand,
        will throw an error with detailed path for ease of debugging. Examples of deadlock cases:

        - A extends B, then B extends A
        - A requires B, B requires C, then C requires A

        The detectDeadlock function will recursively transverse till the leaf, hence it can detect deadlocks
        no matter how deep the path is.
        */

        if (className) {
            requiredMap = Loader.requiredByMap || (Loader.requiredByMap = {});

            for (i = 0,ln = dependencies.length; i < ln; i++) {
                dependency = dependencies[i];
                (requiredMap[dependency] || (requiredMap[dependency] = [])).push(className);
            }

            detectDeadlock = function(cls) {
                deadlockPath.push(cls);

                if (_requiresMap[cls]) {
                    if (Tk.Array.contains(_requiresMap[cls], className)) {
                        Tk.raise("Circular requirement detected! '" + className +
                                "' and '" + deadlockPath[1] + "' mutually require each other. Path: " +
                                deadlockPath.join(' -> ') + " -> " + deadlockPath[0]);
                    }

                    for (i = 0,ln = _requiresMap[cls].length; i < ln; i++) {
                        detectDeadlock(_requiresMap[cls][i]);
                    }
                }
            };

            detectDeadlock(className);
        }

        //</debug>

        (className ? Loader.exclude(className) : Loader).require(dependencies, function() {
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
        });

        return false;
    }, true, 'after', 'className');

    /**
     * @cfg {String[]} uses
     * @member Tk.Class
     * List of optional classes to load together with this class. These aren't neccessarily loaded before
     * this class is created, but are guaranteed to be available before Tk.onReady listeners are
     * invoked. For example:
     *
     *     Tk.define('Mother', {
     *         uses: ['Child'],
     *         giveBirth: function() {
     *             // This code might, or might not work:
     *             // return new Child();
     *
     *             // Instead use Tk.create() to load the class at the spot if not loaded already:
     *             return Tk.create('Child');
     *         }
     *     });
     */
    Manager.registerPostprocessor('uses', function(name, cls, data) {
        //<debug>
        Tk.classSystemMonitor && Tk.classSystemMonitor(cls, 'Tk.Loader#usesPostprocessor', arguments); // jshint ignore:line
        //</debug>
        
        var manifest = Tk.manifest,
            loadOrder = manifest && manifest.loadOrder,
            classes = manifest && manifest.classes,
            uses, clazz, item, len, i, indexMap;

        if (loadOrder) {
            clazz = classes[name];
            if (clazz && !isNaN(i = clazz.idx)) {
                item = loadOrder[i];
                uses = item.uses;
                indexMap = {};
                for (len = uses.length, i = 0; i < len; i++) {
                    indexMap[uses[i]] = true;
                }
                uses = Tk.Boot.getPathsFromIndexes(indexMap, loadOrder, true);
                if (uses.length > 0) {
                    Loader.loadScripts({
                        url: uses,
                        sequential: true
                    });
                }
            }
        }

        if (data.uses) {
            uses = data.uses;
            Loader.addUsedClasses(uses);
        }
    });

    Manager.onCreated(Loader.historyPush);
//</feature>

    Loader.init();
    
}());

//-----------------------------------------------------------------------------

// Use performance.now when available to keep timestamps consistent.
Tk._endTime = Tk.ticks();

// This hook is to allow tools like DynaTrace to deterministically detect the availability
// of Tk.onReady. Since Loader takes over Tk.onReady this must be done here and not in
// Tk.env.Ready.
if (Tk._beforereadyhandler){
    Tk._beforereadyhandler();
}