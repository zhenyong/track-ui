define 的 extend 情况

define -> ClsMgr.create (clsName, data, createdFn)
			makeCtor 
				-> 干净构造器，指定 name 为类名
			return new ExtClass()
				->	ExtClass.create	
						->	拷贝base的静态
					ExtClass.process 
						-> 遍历默认预处理器
								0: className (必处理) 
									-> 设置内置类名信息

								1: loader (必处理)	
									->	找到'extend', 'mixins', 'requires'配置的类集合
										把当前类依赖的类放到映射表<cls:dependencies>
										检查循环依赖
										加载依赖（如果依赖未加载）
											-> 异步加载（如果依赖还未加载完
												-> 收集缺失的类，解析成完整类名，解析成加载路径
												

										回调 -> 把当前类的'extend', 'mixins', 'requires'对应的字符串值变为类



								2: extend (必处理)
								3: privates （依赖）
								4: statics（依赖）
								5: inheritableStatics（依赖）
								6: platformConfig（依赖）
								7: config（依赖）
								8: cachedConfig（依赖）
								9: mixins（依赖）
								10: alias（"xtype", "alias"） 																			