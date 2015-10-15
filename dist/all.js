var Tk=Tk||{};!function(){function e(e,t,n){var r,s;for(r in n)n.hasOwnProperty(r)&&(s=n[r],"function"==typeof s&&(s.$name=r,s.$owner=t,s.$previous=e.hasOwnProperty(r)?e[r]:o),e[r]=s)}var t,n=this,r=Object.prototype,s=r.toString,i=["valueOf","toLocaleString","toString","constructor"],a=function(){},o=function(){var e=o.caller.caller;return e.$owner.prototype[e.$name].apply(this,arguments)};Tk.global=n,a.$nullFn=!0,a.$privacy="framework";for(t in{toString:1})i=null;Tk.enumerables=i,Tk.apply=function(e,t,n){if(n&&Tk.apply(e,n),e&&t&&"object"==typeof t){var r,s,a;for(r in t)e[r]=t[r];if(i)for(s=i.length;s--;)a=i[s],t.hasOwnProperty(a)&&(e[a]=t[a])}return e},Tk.buildSettings=Tk.apply({baseCSSPrefix:"x-"},Tk.buildSettings||{}),Tk.apply(Tk,{idSeed:0,idPrefix:"tk-",enableGarbageCollector:!1,privateFn:a,id:function(e,t){if(e&&e.id)return e.id;var n=(t||Tk.idPrefix)+ ++Tk.idSeed;return e&&(e.id=n),n},baseCSSPrefix:Tk.buildSettings.baseCSSPrefix,applyIf:function(e,t){var n;if(e)for(n in t)void 0===e[n]&&(e[n]=t[n]);return e},override:function(t,n){if(t.$isClass)t.override(n);else if("function"==typeof t)Tk.apply(t.prototype,n);else{var r,s=t.self;s&&s.$isClass?(r=n.privates,r&&(n=Tk.apply({},n),delete n.privates,e(t,s,r)),e(t,s,n)):Tk.apply(t,n)}return t},isEmpty:function(e,t){return null==e||(t?!1:""===e)||Tk.isArray(e)&&0===e.length},isArray:"isArray"in Array?Array.isArray:function(e){return"[object Array]"===s.call(e)},isDate:function(e){return"[object Date]"===s.call(e)},isObject:"[object Object]"===s.call(null)?function(e){return null!==e&&void 0!==e&&"[object Object]"===s.call(e)&&void 0===e.ownerDocument}:function(e){return"[object Object]"===s.call(e)},isSimpleObject:function(e){return e instanceof Object&&e.constructor===Object},isPrimitive:function(e){var t=typeof e;return"string"===t||"number"===t||"boolean"===t},isFunction:"undefined"!=typeof document&&"function"==typeof document.getElementsByTagName("body")?function(e){return!!e&&"[object Function]"===s.call(e)}:function(e){return!!e&&"function"==typeof e},isNumber:function(e){return"number"==typeof e&&isFinite(e)},isNumeric:function(e){return!isNaN(parseFloat(e))&&isFinite(e)},isString:function(e){return"string"==typeof e},isBoolean:function(e){return"boolean"==typeof e},isElement:function(e){return e?1===e.nodeType:!1},isTextNode:function(e){return e?"#text"===e.nodeName:!1},isDefined:function(e){return"undefined"!=typeof e}})}(),Tk.Base=function(e){var t,n=[],r=[],s=function(e,t){var n,r,s,i=this;return e?(s=r.names.get,n=t&&i.hasOwnProperty(s)?i.config[e]:i[s]()):n=i.getCurrentConfig(),n},i=(Tk.Version,{}),a=function(){},o=a.prototype;Tk.apply(a,{$className:"Tk.Base",$isClass:!0,create:function(){return Tk.create.apply(Tk,[this].concat(Array.prototype.slice.call(arguments,0)))},extend:function(e){var t,n,r,s,i,a=this,l=e.prototype;if(t=a.prototype=Tk.Object.chain(l),t.self=a,a.superclass=t.superclass=l,!e.$isClass)for(n in o)n in t&&(t[n]=o[n]);if(i=l.$inheritableStatics)for(n=0,r=i.length;r>n;n++)s=i[n],a.hasOwnProperty(s)||(a[s]=e[s]);e.$onExtended&&(a.$onExtended=e.$onExtended.slice()),a.getConfigurator()},$onExtended:[],triggerExtended:function(){var e,t,n=this.$onExtended,r=n.length;if(r>0)for(e=0;r>e;e++)t=n[e],t.fn.apply(t.scope||this,arguments)},onExtended:function(e,t){return this.$onExtended.push({fn:e,scope:t}),this},addStatics:function(e){return this.addMembers(e,!0),this},addInheritableStatics:function(e){var t,n,r,s,i=this.prototype;t=i.$inheritableStatics,n=i.$hasInheritableStatics,t||(t=i.$inheritableStatics=[],n=i.$hasInheritableStatics={});for(r in e)e.hasOwnProperty(r)&&(s=e[r],this[r]=s,n[r]||(n[r]=!0,t.push(r)));return this},addMembers:function(e,t,n){var r,s,i,a,o,l,c=this,f=Tk.Function.clone,u=t?c:c.prototype,p=(!t&&u.defaultConfig,Tk.enumerables),g=e.privates;g&&(delete e.privates,t||(l=g.statics,delete g.statics),c.addMembers(g,t,o),l&&c.addMembers(l,!0,o));for(a in e)e.hasOwnProperty(a)&&(i=e[a],"function"!=typeof i||i.$isClass||i.$nullFn||(i.$owner&&(i=f(i)),u.hasOwnProperty(a)&&(i.$previous=u[a]),i.$owner=c,i.$name=a),u[a]=i);if(p)for(r=0,s=p.length;s>r;++r)e.hasOwnProperty(a=p[r])&&(i=e[a],i&&!i.$nullFn&&(i.$owner&&(i=f(i)),i.$owner=c,i.$name=a,u.hasOwnProperty(a)&&(i.$previous=u[a])),u[a]=i);return this},addMember:function(e,t){return i[e]=t,this.addMembers(i),delete i[e],this},override:function(e){var t=this,n=e.statics,r=e.inheritableStatics,s=e.config,i=e.mixins;e.cachedConfig;return(n||r||s)&&(e=Tk.apply({},e)),n&&(t.addMembers(n,!0),delete e.statics),r&&(t.addInheritableStatics(r),delete e.inheritableStatics),delete e.mixins,t.addMembers(e),i&&t.mixin(i),t},callParent:function(e){var t;return(t=this.callParent.caller)&&(t.$previous||(t=t.$owner?t:t.caller)&&t.$owner.superclass.self[t.$name]).apply(this,e||n)},callSuper:function(e){var t;return(t=this.callSuper.caller)&&((t=t.$owner?t:t.caller)&&t.$owner.superclass.self[t.$name]).apply(this,e||n)},mixin:function(e,t){var n,r,s,i,a,o,l,c,f,u=this;{if("string"==typeof e){n=t.prototype,r=u.prototype,n.onClassMixedIn&&n.onClassMixedIn.call(t,u),r.hasOwnProperty("mixins")||("mixins"in r?r.mixins=Tk.Object.chain(r.mixins):r.mixins={});for(s in n)c=n[s],"mixins"===s?Tk.applyIf(r.mixins,c):"mixinId"!==s&&"config"!==s&&void 0===r[s]&&(r[s]=c);if(i=n.$inheritableStatics)for(a=0,o=i.length;o>a;a++)l=i[a],u.hasOwnProperty(l)||(u[l]=t[l]);return"config"in n&&u.addConfig(n.config,t),r.mixins[e]=n,n.afterClassMixedIn&&n.afterClassMixedIn.call(t,u),u}if(f=e,f instanceof Array)for(a=0,o=f.length;o>a;a++)n=f[a],u.mixin(n.prototype.mixinId||n.$className,n);else for(var p in f)u.mixin(p,f[p])}},getName:function(){return Tk.getClassName(this)}});for(t in a)a.hasOwnProperty(t)&&r.push(t);return a.$staticMembers=r,a.addMembers({$className:"Tk.Base",isInstance:!0,destroyed:!1,statics:function(){var e=this.statics.caller,t=this.self;return e?e.$owner:t},callParent:function(e){var t,r=(t=this.callParent.caller)&&(t.$previous||(t=t.$owner?t:t.caller)&&t.$owner.superclass[t.$name]);return r.apply(this,e||n)},callSuper:function(e){var t,r=(t=this.callSuper.caller)&&(t=t.$owner?t:t.caller)&&t.$owner.superclass[t.$name];if(!r){t=this.callSuper.caller;var s,i;if(!t.$owner){if(!t.caller)throw new Error("Attempting to call a protected method from the public scope, which is not allowed");t=t.caller}if(s=t.$owner.superclass,i=t.$name,!(i in s))throw new Error("this.callSuper() was called but there's no such method ("+i+") found in the parent class ("+(Tk.getClassName(s)||"Object")+")")}return r.apply(this,e||n)},self:a,constructor:function(){return this},getConfigurator:function(){return this.$config||this.self.getConfigurator()},initConfig:function(e){var t=this,n=t.getConfigurator();return t.initConfig=Tk.emptyFn,t.initialConfig=e||{},n.configure(t,e),t},beforeInitConfig:Tk.emptyFn,getConfig:s,setConfig:function(e,t,n){var r,s=this;return e&&("string"==typeof e?(r={},r[e]=t):r=e,s.getConfigurator().reconfigure(s,r,n)),s},getCurrentConfig:function(){var e=this.getConfigurator();return e.getCurrentConfig(this)},hasConfig:function(e){return e in this.defaultConfig},getInitialConfig:function(e){var t=this.config;return e?t[e]:t},$links:null,link:function(e,t){var n=this,r=n.$links||(n.$links={});return r[e]=!0,n[e]=t,t},unlink:function(e){var t,n,r,s,i=this;for(t=0,n=e.length;n>t;t++)r=e[t],s=i[r],s&&(s.isInstance&&!s.destroyed?s.destroy():s.parentNode&&"nodeType"in s&&s.parentNode.removeChild(s)),i[r]=null;return i},destroy:function(){var e=this,t=e.$links;e.initialConfig=e.config=null,e.destroy=Tk.emptyFn,e.isDestroyed=e.destroyed=!0,t&&(e.$links=null,e.unlink(Tk.Object.getKeys(t)))}}),o.callOverridden=o.callParent,a}(Tk.Function.flexSetter),function(){function e(){function e(){return this.constructor.apply(this,arguments)||null}return e}var t,n=Tk.Base,r=n.$staticMembers;Tk.Class=t=function(e,n,r){return"function"!=typeof e&&(r=n,n=e,e=null),n||(n={}),e=t.create(e,n),t.process(e,n,r),e},Tk.apply(t,{makeCtor:e,onBeforeCreated:function(e,t,n){e.addMembers(t),n.onCreated.call(e,e)},create:function(t,s){var i,a=r.length;for(t||(t=e());a--;)i=r[a],t[i]=n[i];return t},process:function(e,n,r){var s,i,a,o,l,c,f,u=n.preprocessors||t.defaultPreprocessors,p=this.preprocessors,g={onBeforeCreated:this.onBeforeCreated},d=[];for(delete n.preprocessors,e._classHooks=g,a=0,o=u.length;o>a;a++)if(s=u[a],"string"==typeof s){if(s=p[s],i=s.properties,i===!0)d.push(s.fn);else if(i)for(l=0,c=i.length;c>l;l++)if(f=i[l],n.hasOwnProperty(f)){d.push(s.fn);break}}else d.push(s);g.onCreated=r?r:Tk.emptyFn,g.preprocessors=d,this.doProcess(e,n,g)},doProcess:function(e,t,n){for(var r=this,s=n.preprocessors,i=s.shift(),a=r.doProcess;i;i=s.shift())if(i.call(r,e,t,n,a)===!1)return;n.onBeforeCreated.apply(r,arguments)},preprocessors:{},registerPreprocessor:function(e,t,n,r,s){return r||(r="last"),n||(n=[e]),this.preprocessors[e]={name:e,properties:n||!1,fn:t},this.setDefaultPreprocessorPosition(e,r,s),this},getPreprocessor:function(e){return this.preprocessors[e]},getPreprocessors:function(){return this.preprocessors},defaultPreprocessors:[],getDefaultPreprocessors:function(){return this.defaultPreprocessors},setDefaultPreprocessors:function(e){return this.defaultPreprocessors=Tk.Array.from(e),this},setDefaultPreprocessorPosition:function(e,t,n){var r,s=this.defaultPreprocessors;if("string"==typeof t){if("first"===t)return s.unshift(e),this;if("last"===t)return s.push(e),this;t="after"===t?1:-1}return r=Tk.Array.indexOf(s,n),-1!==r&&Tk.Array.splice(s,Math.max(0,r+t),0,e),this}}),t.registerPreprocessor("extend",function(e,t,n){var r,s,i,a=Tk.Base,o=a.prototype,l=t.extend;if(delete t.extend,r=l&&l!==Object?l:a,s=r.prototype,!r.$isClass)for(i in o)s[i]||(s[i]=o[i]);e.extend(r),e.triggerExtended.apply(e,arguments),t.onClassExtended&&(e.onExtended(t.onClassExtended,e),delete t.onClassExtended)},!0),t.registerPreprocessor("statics",function(e,t){e.addStatics(t.statics),delete t.statics}),t.registerPreprocessor("inheritableStatics",function(e,t){e.addInheritableStatics(t.inheritableStatics),delete t.inheritableStatics}),Tk.createRuleFn=function(e){return new Function("$c","with($c) { return ("+e+"); }")},Tk.expressionCache=new Tk.util.Cache({miss:Tk.createRuleFn}),t.registerPreprocessor("mixins",function(e,t,n){Tk.classSystemMonitor&&Tk.classSystemMonitor(e,"Tk.Class#mixinsPreprocessor",arguments);var r=t.mixins,s=n.onCreated;delete t.mixins,n.onCreated=function(){return n.onCreated=s,e.mixin(r),n.onCreated.apply(this,arguments)}}),Tk.extend=function(e,n,r){2===arguments.length&&Tk.isObject(n)&&(r=n,n=e,e=null);var s;if(!n)throw new Error("[Tk.extend] Attempting to extend from a class which has not been loaded on the page.");return r.extend=n,r.preprocessors=["extend","statics","inheritableStatics","mixins","platformConfig","config"],e?(s=new t(e,r),s.prototype.constructor=e):s=new t(r),s.prototype.override=function(e){for(var t in e)e.hasOwnProperty(t)&&(this[t]=e[t])},s}}(),Tk.ClassManager=function(e,t,n,r,s){var i=Tk.Class.makeCtor,a=("undefined"==typeof window,[]),o={Tk:{name:"Tk",value:Tk}},l=Tk.apply(new Tk.Inventory,{classes:{},classState:{},existCache:{},instantiators:[],isCreated:function(e){if("string"!=typeof e||e.length<1)throw new Error("[Tk.ClassManager] Invalid classname, must be a string and must not be empty");return l.classes[e]||l.existCache[e]?!0:l.lookupName(e,!1)?(l.triggerCreated(e),!0):!1},createdListeners:[],nameCreatedListeners:{},existsListeners:[],nameExistsListeners:{},overrideMap:{},triggerCreated:function(e,t){l.existCache[e]=t||1,l.classState[e]+=40,l.notify(e,l.createdListeners,l.nameCreatedListeners)},onCreated:function(e,t,n){l.addListener(e,t,n,l.createdListeners,l.nameCreatedListeners)},notify:function(e,t,n){var r,s,i,a,o,c,f=l.getAlternatesByName(e),u=[e];for(r=0,s=t.length;s>r;r++)o=t[r],o.fn.call(o.scope,e);for(;u;){for(r=0,s=u.length;s>r;r++)if(c=u[r],t=n[c]){for(i=0,a=t.length;a>i;i++)o=t[i],o.fn.call(o.scope,c);delete n[c]}u=f,f=null}},addListener:function(e,t,n,r,s){if(Tk.isArray(n))for(e=Tk.Function.createBarrier(n.length,e,t),i=0;i<n.length;i++)this.addListener(e,null,n[i],r,s);else{var i,a={fn:e,scope:t};if(n){if(this.isCreated(n))return void e.call(t,n);s[n]||(s[n]=[]),s[n].push(a)}else r.push(a)}},$namespaceCache:o,addRootNamespaces:function(e){for(var t in e)o[t]={name:t,value:e[t]}},clearNamespaceCache:function(){a.length=0;for(var e in o)o[e].value||delete o[e]},getNamespaceEntry:function(e){if("string"!=typeof e)return e;var t,n=o[e];return n||(t=e.lastIndexOf("."),n=0>t?{name:e}:{name:e.substring(t+1),parent:l.getNamespaceEntry(e.substring(0,t))},o[e]=n),n},lookupName:function(e,t){var n,r,s=l.getNamespaceEntry(e),i=Tk.global,o=0;for(n=s;n;n=n.parent)a[o++]=n;for(;i&&o-->0;)n=a[o],r=i,i=n.value||i[n.name],!i&&t&&(r[n.name]=i={});return i},setNamespace:function(e,t){var n=l.getNamespaceEntry(e),r=Tk.global;return n.parent&&(r=l.lookupName(n.parent,!0)),r[n.name]=t,t},set:function(e,t){var n=l.getName(t);return l.classes[e]=l.setNamespace(e,t),n&&n!==e&&l.addAlternate(n,e),l},get:function(e){return l.classes[e]||l.lookupName(e,!1)},addNameAliasMappings:function(e){l.addAlias(e)},addNameAlternateMappings:function(e){l.addAlternate(e)},getByAlias:function(e){return l.get(l.getNameByAlias(e))},getByConfig:function(e,t){var n,r=e.xclass;return r?n=r:(n=e.xtype,n?t="widget.":n=e.type,n=l.getNameByAlias(t+n)),l.get(n)},getName:function(e){return e&&e.$className||""},getClass:function(e){return e&&e.self||null},create:function(t,n,r){if(null!=t&&"string"!=typeof t)throw new Error("[Tk.define] Invalid class name '"+t+"' specified, must be a non-empty string");var s=i(t);return"function"==typeof n&&(n=n(s)),t&&(l.classes[t]&&Tk.log.warn("[Tk.define] Duplicate class name '"+t+"' specified, must be a non-empty string"),s.name=t),n.$className=t,new e(s,n,function(){var e,s,i,a,o,c,f,u=n.postprocessors||l.defaultPostprocessors,p=l.postprocessors,g=[];for(delete n.postprocessors,s=0,i=u.length;i>s;s++)if(e=u[s],"string"==typeof e){if(e=p[e],c=e.properties,c===!0)g.push(e.fn);else if(c)for(a=0,o=c.length;o>a;a++)if(f=c[a],n.hasOwnProperty(f)){g.push(e.fn);break}}else g.push(e);n.postprocessors=g,n.createdFn=r,l.processCreate(t,this,n)})},processCreate:function(e,t,n){var r=this,s=n.postprocessors.shift(),i=n.createdFn;return s?void(s.call(r,e,t,n,r.processCreate)!==!1&&r.processCreate(e,t,n)):(Tk.classSystemMonitor&&Tk.classSystemMonitor(e,"Tk.ClassManager#classCreated",arguments),e&&r.set(e,t),delete t._classHooks,i&&i.call(t,t),void(e&&r.triggerCreated(e)))},createOverride:function(e,t,n){var r,s,i=this,a=t.override,o=t.requires,c=(t.uses,t.mixins),f=1,u=function(){var e,l,f,p,g;if(!s){if(l=o?o.slice(0):[],c)if(r=c instanceof Array)for(f=0,g=c.length;g>f;++f)Tk.isString(e=c[f])&&l.push(e);else for(p in c)Tk.isString(e=c[p])&&l.push(e);if(s=!0,l.length)return void Tk.require(l,u)}if(r)for(f=0,g=c.length;g>f;++f)Tk.isString(e=c[f])&&(c[f]=Tk.ClassManager.get(e));else if(c)for(p in c)Tk.isString(e=c[p])&&(c[p]=Tk.ClassManager.get(e));e=i.get(a),delete t.override,delete t.compatibility,delete t.requires,delete t.uses,Tk.override(e,t),n&&n.call(e,e)};return l.overrideMap[e]=!0,"compatibility"in t&&Tk.isString(f=t.compatibility)&&(f=Tk.checkVersion(f)),f&&i.onCreated(u,i,a),i.triggerCreated(e,2),i},instantiateByAlias:function(){var e=arguments[0],t=n.call(arguments),r=this.getNameByAlias(e);if(!r)throw new Error("[Tk.createByAlias] Unrecognized alias: "+e);return t[0]=r,Tk.create.apply(Tk,t)},instantiate:function(){return Tk.log.warn("Tk.ClassManager.instantiate() is deprecated.  Use Tk.create() instead."),Tk.create.apply(Tk,arguments)},dynInstantiate:function(e,t){return t=r(t,!0),t.unshift(e),Tk.create.apply(Tk,t)},getInstantiator:function(e){var t,n,r,s=this.instantiators;if(t=s[e],!t){for(n=e,r=[],n=0;e>n;n++)r.push("a["+n+"]");t=s[e]=new Function("c","a","return new c("+r.join(",")+")"),t.name="Tk.create"+e}return t},postprocessors:{},defaultPostprocessors:[],registerPostprocessor:function(e,t,n,r,s){return r||(r="last"),n||(n=[e]),this.postprocessors[e]={name:e,properties:n||!1,fn:t},this.setDefaultPostprocessorPosition(e,r,s),this},setDefaultPostprocessors:function(e){return this.defaultPostprocessors=r(e),this},setDefaultPostprocessorPosition:function(e,t,n){var r,s=this.defaultPostprocessors;if("string"==typeof t){if("first"===t)return s.unshift(e),this;if("last"===t)return s.push(e),this;t="after"===t?1:-1}return r=Tk.Array.indexOf(s,n),-1!==r&&Tk.Array.splice(s,Math.max(0,r+t),0,e),this}});if(l.registerPostprocessor("alias",function(e,n,r){Tk.classSystemMonitor&&Tk.classSystemMonitor(e,"Tk.ClassManager#aliasPostProcessor",arguments);var s,i,a=Tk.Array.from(r.alias);for(s=0,i=a.length;i>s;s++)t=a[s],this.addAlias(n,t)},["xtype","alias"]),l.registerPostprocessor("singleton",function(e,t,n,r){return Tk.classSystemMonitor&&Tk.classSystemMonitor(e,"Tk.ClassManager#singletonPostProcessor",arguments),n.singleton?(r.call(this,e,new t,n),!1):!0}),l.registerPostprocessor("alternateClassName",function(e,t,n){Tk.classSystemMonitor&&Tk.classSystemMonitor(e,"Tk.ClassManager#alternateClassNamePostprocessor",arguments);var r,s,i,a=n.alternateClassName;for(a instanceof Array||(a=[a]),r=0,s=a.length;s>r;r++){if(i=a[r],"string"!=typeof i)throw new Error("[Tk.define] Invalid alternate of: '"+i+"' for class: '"+e+"'; must be a valid string");this.set(i,t)}}),l.registerPostprocessor("debugHooks",function(e,t,n){Tk.classSystemMonitor&&Tk.classSystemMonitor(t,"Tk.Class#debugHooks",arguments),Tk.isDebugEnabled(t.$className,n.debugHooks.$enabled)&&(delete n.debugHooks.$enabled,Tk.override(t,n.debugHooks));var r=t.isInstance?t.self:t;delete r.prototype.debugHooks}),l.registerPostprocessor("deprecated",function(e,t,n){Tk.classSystemMonitor&&Tk.classSystemMonitor(t,"Tk.Class#deprecated",arguments);var r=t.isInstance?t.self:t;r.addDeprecations(n.deprecated),delete r.prototype.deprecated}),Tk.apply(Tk,{create:function(){var e,t=arguments[0],r=typeof t,s=n.call(arguments,1);return"function"===r?e=t:("string"!==r&&0===s.length&&(s=[t],(t=t.xclass)||(t=s[0].xtype,t&&(t="widget."+t))),t=l.resolveName(t),e=l.get(t)),l.getInstantiator(s.length)(e,s)},widget:function(e,t){var n,r,s,i=e;return"string"!=typeof i?(t=e,i=t.xtype,r=t.xclass):t=t||{},t.isComponent?t:(r||(n="widget."+i,r=l.getNameByAlias(n)),r&&(s=l.get(r)),s?new s(t):Tk.create(r||n,t))},createByAlias:t(l,"instantiateByAlias"),define:function(e,t,n){return Tk.classSystemMonitor&&Tk.classSystemMonitor(e,"ClassManager#define",arguments),t.override?(l.classState[e]=20,l.createOverride.apply(l,arguments)):(l.classState[e]=10,l.create.apply(l,arguments))},undefine:function(e){Tk.classSystemMonitor&&Tk.classSystemMonitor(e,"Tk.ClassManager#undefine",arguments);var t=l.classes;delete t[e],delete l.existCache[e],delete l.classState[e],l.removeName(e);var n=l.getNamespaceEntry(e),r=n.parent?l.lookupName(n.parent,!1):Tk.global;if(r)try{delete r[n.name]}catch(s){r[n.name]=void 0}},getClassName:t(l,"getName"),getDisplayName:function(e){if(e){if(e.displayName)return e.displayName;if(e.$name&&e.$class)return Tk.getClassName(e.$class)+"#"+e.$name;if(e.$className)return e.$className}return"Anonymous"},getClass:t(l,"getClass"),namespace:function(){var e,t=s;for(e=arguments.length;e-->0;)t=l.lookupName(arguments[e],!0);return t}}),Tk.addRootNamespaces=l.addRootNamespaces,Tk.createWidget=Tk.widget,Tk.ns=Tk.namespace,e.registerPreprocessor("className",function(e,t){"$className"in t&&(e.$className=t.$className,e.displayName=e.$className),Tk.classSystemMonitor&&Tk.classSystemMonitor(e,"Tk.ClassManager#classNamePreprocessor",arguments)},!0,"first"),e.registerPreprocessor("alias",function(e,t){Tk.classSystemMonitor&&Tk.classSystemMonitor(e,"Tk.ClassManager#aliasPreprocessor",arguments);var n,s,i,a,o=e.prototype,l=r(t.xtype),c=r(t.alias),f="widget.",p=f.length,g=Array.prototype.slice.call(o.xtypesChain||[]),d=Tk.merge({},o.xtypesMap||{});for(n=0,s=c.length;s>n;n++){if(i=c[n],"string"!=typeof i||i.length<1)throw new Error("[Tk.define] Invalid alias of: '"+i+"' for class: '"+u+"'; must be a valid string");i.substring(0,p)===f&&(a=i.substring(p),Tk.Array.include(l,a))}for(e.xtype=t.xtype=l[0],t.xtypes=l,n=0,s=l.length;s>n;n++)a=l[n],d[a]||(d[a]=!0,g.push(a));for(t.xtypesChain=g,t.xtypesMap=d,Tk.Function.interceptAfter(t,"onClassCreated",function(){Tk.classSystemMonitor&&Tk.classSystemMonitor(e,"Tk.ClassManager#aliasPreprocessor#afterClassCreated",arguments);var t,r,i=o.mixins;for(t in i)if(i.hasOwnProperty(t)&&(r=i[t],l=r.xtypes))for(n=0,s=l.length;s>n;n++)a=l[n],d[a]||(d[a]=!0,g.push(a))}),n=0,s=l.length;s>n;n++){if(a=l[n],"string"!=typeof a||a.length<1)throw new Error("[Tk.define] Invalid xtype of: '"+a+"' for class: '"+u+"'; must be a valid non-empty string");Tk.Array.include(c,f+a)}t.alias=c},["xtype","alias"]),Tk.manifest){var c,f,u,p,g,d=Tk.manifest,h=d.classes,m=d.paths,y={},k={};if(m){if(d.bootRelative){g=Tk.Boot.baseUrl;for(p in m)m.hasOwnProperty(p)&&(m[p]=g+m[p])}l.setPath(m)}if(h)for(c in h)k[c]=[],y[c]=[],f=h[c],f.alias&&(y[c]=f.alias),f.alternates&&(k[c]=f.alternates);l.addAlias(y),l.addAlternate(k)}return l}(Tk.Class,Tk.Function.alias,Array.prototype.slice,Tk.Array.from,Tk.global),Tk.Config=function(e){var t=this,n=e.charAt(0).toUpperCase()+e.substr(1);t.name=e,t.names={internal:"_"+e,initializing:"is"+n+"Initializing",apply:"apply"+n,update:"update"+n,get:"get"+n,set:"set"+n,initGet:"initGet"+n,changeEvent:e.toLowerCase()+"change"},t.root=t},Tk.Config.map={},Tk.Config.get=function(e){var t=Tk.Config.map,n=t[e]||(t[e]=new Tk.Config(e));return n},Tk.Config.prototype={self:Tk.Config,isConfig:!0,getGetter:function(){return this.getter||(this.root.getter=this.makeGetter())},getInitGetter:function(){return this.initGetter||(this.root.initGetter=this.makeInitGetter())},getSetter:function(){return this.setter||(this.root.setter=this.makeSetter())},getEventedSetter:function(){return this.eventedSetter||(this.root.eventedSetter=this.makeEventedSetter())},getInternalName:function(e){return e.$configPrefixed?this.names.internal:this.name},mergeNew:function(e,t,n,r){var s,i;if(t)if(e){s=Tk.Object.chain(t);for(i in e)r&&i in s||(s[i]=e[i])}else s=t;else s=e;return s},mergeSets:function(e,t,n){var r,s,i=t?Tk.Object.chain(t):{};if(e instanceof Array)for(r=e.length;r--;)s=e[r],n&&s in i||(i[s]=!0);else if(e)if(e.constructor===Object)for(r in e)s=e[r],n&&r in i||(i[r]=s);else n&&e in i||(i[e]=!0);return i},makeGetter:function(){var e=this.name,t=this.names.internal;return function(){var n=this.$configPrefixed?t:e;return this[n]}},makeInitGetter:function(){var e=this.name,t=this.names,n=t.set,r=t.get,s=t.initializing;return function(){var t=this;return t[s]=!0,delete t[r],t[n](t.config[e]),delete t[s],t[r].apply(t,arguments)}},makeSetter:function(){var e,t=this.name,n=this.names,r=n.internal,s=n.get,i=n.apply,a=n.update;return e=function(e){var n=this,o=n.$configPrefixed?r:t,l=n[o];return delete n[s],n[i]&&void 0===(e=n[i](e,l))||e!==(l=n[o])&&(n[o]=e,n[a]&&n[a](e,l)),n},e.$isDefault=!0,e},makeEventedSetter:function(){var e,t=this.name,n=this.names,r=n.internal,s=n.get,i=n.apply,a=n.update,o=n.changeEvent,l=function(e,t,n,r){e[r]=t,e[a]&&e[a](t,n)};return e=function(e){var n=this,c=n.$configPrefixed?r:t,f=n[c];return delete n[s],n[i]&&void 0===(e=n[i](e,f))||e!==(f=n[c])&&(n.isConfiguring?(n[c]=e,n[a]&&n[a](e,f)):n.fireEventedAction(o,[n,e,f],l,n,[n,e,f,c])),n},e.$isDefault=!0,e}},function(){var e=Tk.Config,t=e.map,n=Tk.Object;Tk.Configurator=function(e){var t=this,r=e.prototype,s=e.superclass?e.superclass.self.$config:null;t.cls=e,t.superCfg=s,s?(t.configs=n.chain(s.configs),t.cachedConfigs=n.chain(s.cachedConfigs),t.initMap=n.chain(s.initMap),t.values=n.chain(s.values),t.needsFork=s.needsFork,t.deprecations=n.chain(s.deprecations)):(t.configs={},t.cachedConfigs={},t.initMap={},t.values={},t.deprecations={}),r.config=r.defaultConfig=t.values,e.$config=t},Tk.Configurator.prototype={self:Tk.Configurator,needsFork:!1,initList:null,add:function(t,r){var s,i,a,o,l,c,f,u,p,g,d=this,h=d.cls,m=d.configs,y=d.cachedConfigs,k=d.initMap,T=h.prototype,v=r&&r.$config.configs,C=d.values;for(f in t){if(g=t[f],s=g&&g.constructor===Object,i=s&&"$value"in g?g:null,i&&(a=!!i.cached,g=i.$value,s=g&&g.constructor===Object),o=i&&i.merge,l=m[f]){if(r){if(o=l.merge,!o)continue;i=null}else o=o||l.merge;r||!a||y[f]||Tk.raise("Redefining config as cached: "+f+" in class: "+h.$className),c=C[f],o?g=o.call(l,g,c,h,r):s&&c&&c.constructor===Object&&(g=n.merge({},c,g))}else v?(l=v[f],i=null):l=e.get(f),m[f]=l,(l.cached||a)&&(y[f]=!0),u=l.names,T[p=u.get]||(T[p]=l.getter||l.getGetter()),T[p=u.set]||(T[p]=i&&i.evented?l.eventedSetter||l.getEventedSetter():l.setter||l.getSetter());i&&(l.owner!==h&&(m[f]=l=Tk.Object.chain(l),l.owner=h),Tk.apply(l,i),delete l.$value),!d.needsFork&&g&&(g.constructor===Object||g instanceof Array)&&(d.needsFork=!0),null!==g?k[f]=!0:(T.$configPrefixed?T[m[f].names.internal]=null:T[m[f].name]=null,f in k&&(k[f]=!1)),C[f]=g}},addDeprecations:function(e){var t,n,r,s=this,i=s.deprecations,a=(s.cls.$className||"")+"#";for(r in e)n=e[r],n?(t=n.message)||(t='This config has been renamed to "'+n+'"'):t="This config has been removed.",i[r]=a+r+": "+t},configure:function(e,t){var r,s,i,a,o,l,c,f,u,p,g,d,h,m=this,y=m.configs,k=m.deprecations,T=m.initMap,v=m.initListMap,C=m.initList,b=m.cls.prototype,x=m.values,$=0,w=!C;if(x=m.needsFork?n.fork(x):n.chain(x),e.isConfiguring=!0,w){m.initList=C=[],m.initListMap=v={},e.isFirstInstance=!0;for(u in T)a=T[u],s=y[u],g=s.cached,a?(f=s.names,p=x[u],!b[f.set].$isDefault||b[f.apply]||b[f.update]||"object"==typeof p?(g?(r||(r=[])).push(s):(C.push(s),v[u]=!0),e[f.get]=s.initGetter||s.getInitGetter()):b[s.getInternalName(b)]=p):g&&(b[s.getInternalName(b)]=void 0)}if(c=r&&r.length){for(o=0;c>o;++o)l=r[o].getInternalName(b),e[l]=null;for(o=0;c>o;++o)f=(s=r[o]).names,i=f.get,e.hasOwnProperty(i)&&(e[f.set](x[s.name]),delete e[i]);for(o=0;c>o;++o)l=r[o].getInternalName(b),b[l]=e[l],delete e[l]}for(t&&t.platformConfig&&(t=m.resolvePlatformConfig(e,t)),w&&e.afterCachedConfig&&!e.afterCachedConfig.$nullFn&&e.afterCachedConfig(t),e.config=x,o=0,c=C.length;c>o;++o)s=C[o],e[s.names.get]=s.initGetter||s.getInitGetter();if(e.transformInstanceConfig&&(t=e.transformInstanceConfig(t)),t)for(u in t)p=t[u],s=y[u],(!k[u]||(Tk.log.warn(k[u]),s))&&(s?(s.lazy||++$,v[u]||(e[s.names.get]=s.initGetter||s.getInitGetter()),s.merge?p=s.merge(p,x[u],e):p&&p.constructor===Object&&(d=x[u],p=d&&d.constructor===Object?n.merge(x[u],p):Tk.clone(p))):(h=e.self.prototype[u],e.$configStrict&&"function"==typeof h&&!h.$nullFn&&Tk.raise("Cannot override method "+u+" on "+e.$className+" instance."),e[u]=p),x[u]=p);if(!e.beforeInitConfig||e.beforeInitConfig.$nullFn||e.beforeInitConfig(t)!==!1){if(t)for(u in t){if(!$)break;s=y[u],s&&!s.lazy&&(--$,f=s.names,i=f.get,e.hasOwnProperty(i)&&(e[f.set](x[u]),delete e[f.get]))}for(o=0,c=C.length;c>o;++o)s=C[o],f=s.names,i=f.get,!s.lazy&&e.hasOwnProperty(i)&&(e[f.set](x[s.name]),delete e[i]);delete e.isConfiguring}},getCurrentConfig:function(e){var n,r=e.defaultConfig,s={};for(n in r)s[n]=e[t[n].names.get]();return s},merge:function(e,t,n){var r,s,i,a,o=this.configs;for(r in n)s=n[r],a=o[r],a&&(a.merge?s=a.merge(s,t[r],e):s&&s.constructor===Object&&(i=t[r],s=i&&i.constructor===Object?Tk.Object.merge(i,s):Tk.clone(s))),t[r]=s;return t},reconfigure:function(e,n,r){var s,i,a,o,l,c,f,u=e.config,p=[],g=e.$configStrict&&!(r&&r.strict===!1),d=this.configs,h=r&&r.defaults;for(l in n)if((!h||!e.hasOwnProperty(l))&&(u[l]=n[l],s=d[l],!this.deprecations[l]||(Tk.log.warn(this.deprecations[l]),s))){if(s)e[s.names.get]=s.initGetter||s.getInitGetter();else if(f=e.self.prototype[l],g){if("function"==typeof f&&!f.$nullFn){Tk.Error.raise("Cannot override method "+l+" on "+e.$className+" instance.");continue}"type"!==l&&Tk.log.warn('No such config "'+l+'" for class '+e.$className)}p.push(l)}for(a=0,o=p.length;o>a;a++)l=p[a],s=d[l],s?(c=s.names,i=c.get,e.hasOwnProperty(i)&&(e[c.set](n[l]),delete e[i])):(s=t[l]||Tk.Config.get(l),c=s.names,e[c.set]?e[c.set](n[l]):e[l]=n[l])},resolvePlatformConfig:function(e,t){var n,r,s,i=t&&t.platformConfig,a=t;if(i&&(r=Tk.getPlatformConfigKeys(i),s=r.length))for(a=Tk.merge({},a),n=0,s=r.length;s>n;++n)this.merge(e,a,i[r[n]]);return a}}}(),Tk.Inventory=function(){var e=this;e.names=[],e.paths={},e.alternateToName={},e.aliasToName={},e.nameToAliases={},e.nameToAlternates={}},Tk.Inventory.prototype={_array1:[0],prefixes:null,dotRe:/\./g,wildcardRe:/\*/g,addAlias:function(e,t,n){return this.addMapping(e,t,this.aliasToName,this.nameToAliases,n)},addAlternate:function(e,t){return this.addMapping(e,t,this.alternateToName,this.nameToAlternates)},addMapping:function(e,t,n,r,s){var i,a,o,l,c,f,u=e.$className||e,p=u,g=this._array1;Tk.isString(u)&&(p={},p[u]=t);for(o in p)for(a=p[o],Tk.isString(a)&&(g[0]=a,a=g),c=a.length,f=r[o]||(r[o]=[]),l=0;c>l;++l)(i=a[l])&&n[i]!==o&&(!s&&n[i]&&Tk.log.warn("Overriding existing mapping: '"+i+"' From '"+n[i]+"' to '"+o+"'. Is this intentional?"),n[i]=o,f.push(i))},getAliasesByName:function(e){return this.nameToAliases[e]||null},getAlternatesByName:function(e){return this.nameToAlternates[e]||null},getNameByAlias:function(e){return this.aliasToName[e]||""},getNameByAlternate:function(e){return this.alternateToName[e]||""},getNamesByExpression:function(e,t,n){var r,s,i,a,o,l,c,f=this,u=f.aliasToName,p=f.alternateToName,g=f.nameToAliases,d=f.nameToAlternates,h=n?t:{},m=[],y=Tk.isString(e)?[e]:e,k=y.length,T=f.wildcardRe;for(s=0;k>s;++s)if((r=y[s]).indexOf("*")<0)(l=u[r])||(l=p[r])||(l=r),l in h||t&&l in t||(h[l]=1,m.push(l));else{c=new RegExp("^"+r.replace(T,"(.*?)")+"$");for(l in g)if(!(l in h||t&&l in t)){if(!(a=c.test(l))){for(o=(i=g[l]).length;!a&&o-->0;)a=c.test(i[o]);if(i=d[l],i&&!a)for(o=i.length;!a&&o-->0;)a=c.test(i[o])}a&&(h[l]=1,m.push(l))}}return m},getPath:function(e){var t,n=this,r=n.paths,s="";return e in r?s=r[e]:(t=n.getPrefix(e),t&&(e=e.substring(t.length+1),s=r[t],s&&(s+="/")),s+=e.replace(n.dotRe,"/")+".js"),s},getPrefix:function(e){if(e in this.paths)return e;for(var t,n,r=this.getPrefixes(),s=r.length;s-->0;)if(t=(n=r[s]).length,t<e.length&&"."===e.charAt(t)&&n===e.substring(0,t))return n;return""},getPrefixes:function(){var e=this,t=e.prefixes;return t||(e.prefixes=t=e.names.slice(0),t.sort(e._compareNames)),t},removeName:function(e){var t,n,r=this,s=r.aliasToName,i=r.alternateToName,a=r.nameToAliases,o=r.nameToAlternates,l=a[e],c=o[e];if(delete a[e],delete o[e],l)for(t=l.length;t--;)e===(n=l[t])&&delete s[n];if(c)for(t=c.length;t--;)e===(n=c[t])&&delete i[n]},resolveName:function(e){var t,n=this;return e in n.nameToAliases||(t=n.aliasToName[e])||(t=n.alternateToName[e]),t||e},select:function(e,t){var n,r=this,s={},i={excludes:s,exclude:function(){return r.getNamesByExpression(arguments,s,!0),this}};for(n in e)i[n]=r.selectMethod(s,e[n],t||e);return i},selectMethod:function(e,t,n){var r=this;return function(s){var i=Tk.Array.slice(arguments,1);return i.unshift(r.getNamesByExpression(s,e)),t.apply(n,i)}},setPath:Tk.Function.flexSetter(function(e,t){var n=this;return n.paths[e]=t,n.names.push(e),n.prefixes=null,n}),_compareNames:function(e,t){var n=e.length-t.length;return n||(n=t>e?-1:1),n}},Tk.define("Tk.Mixin",function(e){return{statics:{addHook:function(e,t,n,r){var s=Tk.isFunction(e),i=function(){var t=arguments,n=s?e:r[e],i=this.callParent(t);return n.apply(this,t),i},a=t.hasOwnProperty(n)&&t[n];s&&(e.$previous=Tk.emptyFn),i.$name=n,i.$owner=t.self,a?(i.$previous=a.$previous,a.$previous=i):t[n]=i}},onClassExtended:function(t,n){var r,s,i,a,o=n.mixinConfig,l=n.xhooks,c=t.superclass,f=n.onClassMixedIn;l&&(delete n.xhooks,(o||(n.mixinConfig=o={})).on=l),o&&(r=c.mixinConfig,r&&(n.mixinConfig=o=Tk.merge({},r,o)),n.mixinId=o.id,o.beforeHooks&&Tk.raise('Use of "beforeHooks" is deprecated - use "before" instead'),o.hooks&&Tk.raise('Use of "hooks" is deprecated - use "after" instead'),o.afterHooks&&Tk.raise('Use of "afterHooks" is deprecated - use "after" instead'),
s=o.before,i=o.after,l=o.on,a=o.extended),(s||i||l||a)&&(n.onClassMixedIn=function(t){var n,r=this.prototype,o=t.prototype;if(s&&Tk.Object.each(s,function(e,n){t.addMember(e,function(){return r[n].apply(this,arguments)!==!1?this.callParent(arguments):void 0})}),i&&Tk.Object.each(i,function(e,n){t.addMember(e,function(){var e=this.callParent(arguments);return r[n].apply(this,arguments),e})}),l)for(n in l)e.addHook(l[n],o,n,r);a&&t.onExtended(function(){var e=Tk.Array.slice(arguments,0);return e.unshift(t),a.apply(this,e)},this),f&&f.apply(this,arguments)})}}}),Tk.Array=function(){var e={from:function(e,t){if(void 0===e||null===e)return[];if(Tk.isArray(e))return t?slice.call(e):e;var n=typeof e;return!e||void 0===e.length||"string"===n||"function"===n&&e.apply?[e]:ExtArray.toArray(e)}};return e}(),Tk.Function=function(){var e={flexSetter:function(e){return function(t,n){var r,s;if(null!==t)if("string"!=typeof t){for(r in t)t.hasOwnProperty(r)&&e.call(this,r,t[r]);if(Tk.enumerables)for(s=Tk.enumerables.length;s--;)r=Tk.enumerables[s],t.hasOwnProperty(r)&&e.call(this,r,t[r])}else e.call(this,t,n);return this}},alias:function(e,t){return function(){return e[t].apply(e,arguments)}},clone:function(e){return function(){return e.apply(this,arguments)}}};return e}();var TemplateClass=function(){},TkObject=Tk.Object={chain:Object.create||function(e){TemplateClass.prototype=e;var t=new TemplateClass;return TemplateClass.prototype=null,t},getKeys:"function"==typeof Object.keys?function(e){return e?Object.keys(e):[]}:function(e){var t,n=[];for(t in e)e.hasOwnProperty(t)&&n.push(t);return n}};