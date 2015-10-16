/**
 * @singleton
 * 
 * 针对现有词条结构去加载生成字典，可以自动扫描上下文词条，或者手动添加词条
 * 通过 Dic.scan() 扫描形如 V5.ResGInfoState = {} 这样的全局变量，然后把 `ResGInfoState`
 * 作为词条的目录名。可以多次调用 scan 方法。
 *
 * 	例子：
 * 		
 * 	 V5.ResGInfoState = {
 * 	 	"global": {
 * 	 		"__cacheNameEx": "Cache"
 * 	 	},
		"items": [{
			"key": "00",
			"_name": "Incapaz de Seguir",
			"_tips": "Lo lamentamos, no se puede hacer el seguimiento del número insertado.",
			"_00_tipsMore_I1": "El transportista n...",
			"_00_tipsMore_I2": "Lamentamos informa..."
		}, {
			"key": "01",
			"_name": "Seguimiento Normal",
			"_tips": "De su número de seguimiento ya hay información.",
			"_01_tipsMore_I1": "Esto ..."
		}]
 * 	 }
 *
 * 	Dic.scan();//等同于调用多个 Dic.addCategory('ResGInfoState', 'V5.ResGInfoState');
 *
 * 	Dic.get('ResGInfoState','__cacheNameEx')//=> "Cache"
 * 	Dic.getItem('ResGInfoState','01')//=> {key:01,_name:"Seguimiento Normal",...}
 *
 * 	var infoStateDic = Dic.getCategory('ResGInfoState');
 * 	infoStateDic.get('__cacheNameEx');//=> "Cache"
 * 	infoStateDic.getItem('01')//=> {key:01,_name:"Seguimiento Normal",...}
 *
 * 
 */

(function(window) {
	/* 
	{
		//第一层命名空间是词条目录
		ResGInfoState: {
			"global": {
				"__cacheNameEx": "Cache"
			},
			itemsMap: {//itemsMap 根据词条的 items 生成
				'00': xxx//对应 items 中 key 为 '00' 的部分
			},
			"items": [{
				"key": "00",
				"_name": "Incapaz de Seguir",
				"_tips": "Lo lamentamos, no se puede hacer el seguimiento del número insertado.",
				"_00_tipsMore_I1": "El transportista no tiene capacidad de seguimiento en línea para este tipo de envío especificado, por favor, no dude en ponerse en contacto con el transportista para otras opciones de seguimiento. Por ejemplo: Usted puede ir a ver el sitio web oficial de la compañía, encontrar la página de \"contáctenos\", el correo electrónico o marcar la línea directa de ayuda.",
				"_00_tipsMore_I2": "Lamentamos informarle que no pudimos identificar a qué transportista pertenece el número de seguimiento. Si es un nuevo servicio de transporte no lo tenemos agregado para el seguimiento, por favor, no dude en <a href=\"mailto:serv@17track.net\">contactarnos</a>, estaremos encantados de agregarlo y tener más servicios."
			}, {
				"key": "01",
				"_name": "Seguimiento Normal",
				"_tips": "De su número de seguimiento ya hay información.",
				"_01_tipsMore_I1": "Esto quiere decir que el transporte ya ha aceptado su paquete, Y fue procesado e ingresado con la información de seguimiento. Por favor espere. Tendremos actualizaciones sincronizadas si hay algún escaneo adicional disponible desde el transporte."
			}]
		},
		ResGExpress: {
			...
		}
	}
	 */

	var defaultOptions = {
		rootName: 'V5',
		itemObjectCheck: function(name) {
			return /^ResG/.test(name);
		}
	};

	var data = {};
	var categoryCache = {};

	var Dic = {
		data: data, 
		/**
		 * 添加一份词条
		 *
		 * @param {String} name 例如 'ResGInfoState'
		 * @param {Object} obj  词条对象{global:{},items:[]}
		 */
		addCategory: function(name, obj) {
			console.log('>>>addCategory', name, obj);
			if (data[name]) {
				console.log('重复', name, '返回');
				return;
			}

			data[name] = obj;
			categoryCache[name] = new Category(name, obj);
		},

		/**
		 * 获取某份词条
		 *
		 * @param  {String} name  词条目录名，例如 'ResGInfoState'
		 *
		 * @return {Category}      [description]
		 */
		getCategory: function(name) {
			return categoryCache[name];
		},

		/**
		 * 获取某份词条的 global 下的词条
		 *
		 * @param  {[type]} categoryName 词条目录名，例如 'ResGInfoState'
		 * @param  {[type]} name         global 下的某个属性值
		 *
		 * @return {String}              
		 */
		get: function (categoryName, name) {
			var c = this.getCategory(categoryName);
			return c && c.get(name);
		},

		/**
		 * 获取某份词条的 items 下的词条
		 *
		 * @param  {[type]} categoryName 词条目录名，例如 'ResGInfoState'
		 * @param  {[type]} key          items 中某个元素的 key 属性
		 *
		 * @return {String}              
		 */
		getItem: function (categoryName, key) {
			var c = this.getCategory(categoryName);
			return c && c.getItem(key);
		},

		/**
		 * 扫描形如 `V5.ResGInfoState` 这样的全局词条对象，然后加载到字典对象中
		 *
		 * @param  {Object} [options]
		 * @param  {String} [options.rootName="V5"] 词条顶级命名空间
		 * @param  {Function} [options.itemObjectCheck] function(name,object){}
		 * 判断 `V5` 下的属性名是否为词条属性，返回 true 表示词条
		 * @param  {Function} [options.itemObjectCheck.name] `V5` 下的属性名
		 * @param  {Object} [options.itemObjectCheck.object] 词条对象
		 *
		 * @return {Num}         新增了多少份词条
		 */
		scan: function(options) {
			var p;

			options = options || {};
			var rootName = options.rootName || defaultOptions.rootName;
			var itemObjectCheck = options.itemObjectCheck || defaultOptions.itemObjectCheck;

			var root = rootName ? window[rootName] : window;
			root = root || window;

			for (p in root) {
				if (root.hasOwnProperty(p) && itemObjectCheck(p)) {
					this.addCategory(p, root[p]);
				}
			}
		}
	};

	//@tag Dic
	/**
	 *
	 * 一个 Category 对应一份词条对象, 例如 V5.ResGInfoState
	 *
	 */
	function Category(name, object) {
		if (!object.itemsMap) {
			object.itemsMap = pluckItems(object.items);
		}
		this.data = object;
	}

	Category.prototype = {
		/**
		 * 获取 global 下的词条
		 *
		 * @param  {[type]} categoryName 词条目录名，例如 'ResGInfoState'
		 * @param  {[type]} name         global 下的某个属性值
		 *
		 * @return {String}              
		 */
		get: function(name) {
			var data = this.data;
			return data && data.global && data.global[name];
		},
		/**
		 * 获取 items 下的词条
		 *
		 * @param  {[type]} key          items 中某个元素的 key 属性
		 *
		 * @return {String}              
		 */
		getItem: function(key) {
			var data, itemsMap;
			return data && (itemsMap = data.itemsMap) && itemsMap[key];
		}
	};

	function pluckItems(items) {
		var item, ret = {};
		for (var i = 0, len = items ? items.length : 0; i < len; i++) {
			item = items[i];
			ret[item.key] = item;
		}
		return ret;
	}

	window.Dic = Dic;

})(window);