Ext.data.JsonP.Tk_Function({"tagname":"class","name":"Tk.Function","autodetected":{},"files":[{"filename":"function.js","href":"function.html#Tk-Function"}],"singleton":true,"members":[{"name":"alias","tagname":"method","owner":"Tk.Function","id":"method-alias","meta":{}},{"name":"clone","tagname":"method","owner":"Tk.Function","id":"method-clone","meta":{}},{"name":"flexSetter","tagname":"method","owner":"Tk.Function","id":"method-flexSetter","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-Tk.Function","component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/function.html#Tk-Function' target='_blank'>function.js</a></div></pre><div class='doc-contents'><p>一堆好用的静态方法，用于加工函数，或者返回一些高效的回调方法</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-alias' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Tk.Function'>Tk.Function</span><br/><a href='source/function.html#Tk-Function-method-alias' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Tk.Function-method-alias' class='name expandable'>alias</a>( <span class='pre'>object, methodName</span> ) : Function<span class=\"signature\"></span></div><div class='description'><div class='short'>对 object 的 methodName 方法创建一个别名方法 . ...</div><div class='long'><p>对 <code>object</code> 的 <code>methodName</code> 方法创建一个别名方法 .\n注意：返回的方法的执行时 this 会指向 <code>object</code> 本身.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>object</span> : Object/Function<div class='sub-desc'>\n</div></li><li><span class='pre'>methodName</span> : String<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Function</span><div class='sub-desc'><p>aliasFn</p>\n</div></li></ul></div></div></div><div id='method-clone' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Tk.Function'>Tk.Function</span><br/><a href='source/function.html#Tk-Function-method-clone' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Tk.Function-method-clone' class='name expandable'>clone</a>( <span class='pre'>method</span> ) : Function<span class=\"signature\"></span></div><div class='description'><div class='short'>对一个方法创建一个副本. ...</div><div class='long'><p>对一个方法创建一个副本. 返回的新方法在调用时会把所有参数传递给原方法执行。\n新方法和原方法调用效果一样，更多是为了创建一个方法避免原方法被污染。</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>method</span> : Function<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Function</span><div class='sub-desc'><p>cloneFn</p>\n</div></li></ul></div></div></div><div id='method-flexSetter' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Tk.Function'>Tk.Function</span><br/><a href='source/function.html#Tk-Function-method-flexSetter' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Tk.Function-method-flexSetter' class='name expandable'>flexSetter</a>( <span class='pre'>setter</span> ) : Function<span class=\"signature\"></span></div><div class='description'><div class='short'>把支持两个参数的方法包装成支持 键值 对象作为参数\n\n例如:\n\nvar oldSetValue = function (name) {\n    this[name] = value;\n};\nvar setValue = Tk.Func...</div><div class='long'><p>把支持两个参数的方法包装成支持 键值 对象作为参数</p>\n\n<p>例如:</p>\n\n<pre><code>var oldSetValue = function (name) {\n    this[name] = value;\n};\nvar setValue = <a href=\"#!/api/Tk.Function-method-flexSetter\" rel=\"Tk.Function-method-flexSetter\" class=\"docClass\">Tk.Function.flexSetter</a>(oldSetValue);\n\n// 保证原来用法没问题\nsetValue('name1', 'value1');\n\n// 支持 键值对象\nsetValue({\n    name1: 'value1',\n    name2: 'value2'\n});\n//等同于 oldSetValue('name1', 'value1');oldSetValue('name2', 'value2')\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>setter</span> : Function<div class='sub-desc'><p>The single value setter method.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>name</span> : String<div class='sub-desc'><p>The name of the value being set.</p>\n</div></li><li><span class='pre'>value</span> : Object<div class='sub-desc'><p>The value being set.</p>\n</div></li></ul></div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Function</span><div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});