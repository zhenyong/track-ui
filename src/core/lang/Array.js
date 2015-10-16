/**
 * @class Tk.Array
 * @singleton
 *
 * 一堆处理数组的静态方法，针对一些老的浏览器提供一些 ES5 的数组功能
 */
Tk.Array = (function() {

    var arrayPrototype = Array.prototype,
        slice = arrayPrototype.slice,
        supportsSplice = (function() {
            var array = [],
                lengthBefore,
                j = 20;

            if (!array.splice) {
                return false;
            }

            // This detects a bug in IE8 splice method:
            // see http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/6e946d03-e09f-4b22-a4dd-cd5e276bf05a/

            while (j--) {
                array.push("A");
            }

            array.splice(15, 0, "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F");

            lengthBefore = array.length; //41
            array.splice(13, 0, "XXX"); // add one element

            if (lengthBefore + 1 !== array.length) {
                return false;
            }
            // end IE8 bug

            return true;
        }()),
        supportsIndexOf = 'indexOf' in arrayPrototype;

    var fixArrayIndex = function(array, index) {
            return (index < 0) ? Math.max(0, array.length + index) : Math.min(array.length, index);
        },
        /*
            Does the same work as splice, but with a slightly more convenient signature. The splice
            method has bugs in IE8, so this is the implementation we use on that platform.

            The rippling of items in the array can be tricky. Consider two use cases:

                          index=2
                          removeCount=2
                         /=====\
                +---+---+---+---+---+---+---+---+
                | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
                +---+---+---+---+---+---+---+---+
                                 /  \/  \/  \/  \
                                /   /\  /\  /\   \
                               /   /  \/  \/  \   +--------------------------+
                              /   /   /\  /\   +--------------------------+   \
                             /   /   /  \/  +--------------------------+   \   \
                            /   /   /   /+--------------------------+   \   \   \
                           /   /   /   /                             \   \   \   \
                          v   v   v   v                               v   v   v   v
                +---+---+---+---+---+---+       +---+---+---+---+---+---+---+---+---+
                | 0 | 1 | 4 | 5 | 6 | 7 |       | 0 | 1 | a | b | c | 4 | 5 | 6 | 7 |
                +---+---+---+---+---+---+       +---+---+---+---+---+---+---+---+---+
                A                               B        \=========/
                                                         insert=[a,b,c]

            In case A, it is obvious that copying of [4,5,6,7] must be left-to-right so
            that we don't end up with [0,1,6,7,6,7]. In case B, we have the opposite; we
            must go right-to-left or else we would end up with [0,1,a,b,c,4,4,4,4].
            */
        replaceSim = function(array, index, removeCount, insert) {
            var add = insert ? insert.length : 0,
                length = array.length,
                pos = fixArrayIndex(array, index);

            // we try to use Array.push when we can for efficiency...
            if (pos === length) {
                if (add) {
                    array.push.apply(array, insert);
                }
            } else {
                var remove = Math.min(removeCount, length - pos),
                    tailOldPos = pos + remove,
                    tailNewPos = tailOldPos + add - remove,
                    tailCount = length - tailOldPos,
                    lengthAfterRemove = length - remove,
                    i;

                if (tailNewPos < tailOldPos) { // case A
                    for (i = 0; i < tailCount; ++i) {
                        array[tailNewPos + i] = array[tailOldPos + i];
                    }
                } else if (tailNewPos > tailOldPos) { // case B
                    for (i = tailCount; i--;) {
                        array[tailNewPos + i] = array[tailOldPos + i];
                    }
                } // else, add == remove (nothing to do)

                if (add && pos === lengthAfterRemove) {
                    array.length = lengthAfterRemove; // truncate array
                    array.push.apply(array, insert);
                } else {
                    array.length = lengthAfterRemove + add; // reserves space
                    for (i = 0; i < add; ++i) {
                        array[pos + i] = insert[i];
                    }
                }
            }

            return array;
        },



        spliceSim = function(array, index, removeCount) {
            var pos = fixArrayIndex(array, index),
                removed = array.slice(index, fixArrayIndex(array, pos + removeCount));

            if (arguments.length < 4) {
                replaceSim(array, pos, removeCount);
            } else {
                replaceSim(array, pos, removeCount, slice.call(arguments, 3));
            }

            return removed;
        },

        spliceNative = function(array) {
            return array.splice.apply(array, slice.call(arguments, 1));
        },

        splice = supportsSplice ? spliceNative : spliceSim;


    var ret = {
        /**
         * 把非数组的值转化为数组，返回情况：
         *
         * - 对 `undefined` or `null` 返回 空数组
         * - 对 数组 返回 本身
         * - 对于像数组的（如：arguments, NodeList）则返回一个副本
         * - 对 其他单值，则把该值作为数组唯一元素，返回一个新数组
         *
         * @param {Object} value 
         * @param {Boolean} [newReference] `true` 如果原来已经是个数组，这里可以强制要求返回一个新的数组
         * @return {Array} array
         */
        from: function(value, newReference) {
            if (value === undefined || value === null) {
                return [];
            }

            if (Tk.isArray(value)) {
                return (newReference) ? slice.call(value) : value;
            }

            var type = typeof value;

            //处理那些像数组的情况，排除字符串和函数
            // strings and functions 都有 length 属性
            if (value && value.length !== undefined && type !== 'string' && (type !== 'function' || !value.apply)) {
                return ExtArray.toArray(value);
            }

            return [value];
        },

        /**
         * @method
         * Get the index of the provided `item` in the given `array`, a supplement for the
         * missing arrayPrototype.indexOf in Internet Explorer.
         *
         * @param {Array} array The array to check.
         * @param {Object} item The item to find.
         * @param {Number} from (Optional) The index at which to begin the search.
         * @return {Number} The index of item in the array (or -1 if it is not found).
         */
        indexOf: supportsIndexOf ? function(array, item, from) {
            return arrayPrototype.indexOf.call(array, item, from);
        } : function(array, item, from) {
            var i, length = array.length;

            for (i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
                if (array[i] === item) {
                    return i;
                }
            }

            return -1;
        },

        /**
         * @method
         * Checks whether or not the given `array` contains the specified `item`.
         *
         * @param {Array} array The array to check.
         * @param {Object} item The item to find.
         * @return {Boolean} `true` if the array contains the item, `false` otherwise.
         */
        contains: supportsIndexOf ? function(array, item) {
            return arrayPrototype.indexOf.call(array, item) !== -1;
        } : function(array, item) {
            var i, ln;

            for (i = 0, ln = array.length; i < ln; i++) {
                if (array[i] === item) {
                    return true;
                }
            }

            return false;
        },

        /**
         * Returns a shallow copy of a part of an array. This is equivalent to the native
         * call `Array.prototype.slice.call(array, begin, end)`. This is often used when "array"
         * is "arguments" since the arguments object does not supply a slice method but can
         * be the context object to `Array.prototype.slice`.
         *
         * @param {Array} array The array (or arguments object).
         * @param {Number} begin The index at which to begin. Negative values are offsets from
         * the end of the array.
         * @param {Number} end The index at which to end. The copied items do not include
         * end. Negative values are offsets from the end of the array. If end is omitted,
         * all items up to the end of the array are copied.
         * @return {Array} The copied piece of the array.
         * @method slice
         */
        // Note: IE8 will return [] on slice.call(x, undefined).
        slice: ([1,2].slice(1, undefined).length ?
            function (array, begin, end) {
                return slice.call(array, begin, end);
            } :
            function (array, begin, end) {
                // see http://jsperf.com/slice-fix
                if (typeof begin === 'undefined') {
                    return slice.call(array);
                }
                if (typeof end === 'undefined') {
                    return slice.call(array, begin);
                }
                return slice.call(array, begin, end);
            }
        ),

        /**
         * Replaces items in an array. This is equivalent to the splice method of Array, but
         * works around bugs in IE8's splice method. The signature is exactly the same as the
         * splice method except that the array is the first argument. All arguments following
         * removeCount are inserted in the array at index.
         *
         * @param {Array} array The Array on which to replace.
         * @param {Number} index The index in the array at which to operate.
         * @param {Number} removeCount The number of items to remove at index (can be 0).
         * @param {Object...} elements The elements to add to the array. If you don't specify
         * any elements, splice simply removes elements from the array.
         * @return {Array} An array containing the removed items.
         * @method
         */
        splice: splice,
        
        /**
         * Pushes new items onto the end of an Array.
         *
         * Passed parameters may be single items, or arrays of items. If an Array is found in the argument list, all its
         * elements are pushed into the end of the target Array.
         *
         * @param {Array} target The Array onto which to push new items
         * @param {Object...} elements The elements to add to the array. Each parameter may
         * be an Array, in which case all the elements of that Array will be pushed into the end of the
         * destination Array.
         * @return {Array} An array containing all the new items push onto the end.
         *
         */
        push: function(target) {
            var len = arguments.length,
                i = 1,
                newItem;

            if (target === undefined) {
                target = [];
            } else if (!Ext.isArray(target)) {
                target = [target];
            }
            for (; i < len; i++) {
                newItem = arguments[i];
                Array.prototype.push[Ext.isIterable(newItem) ? 'apply' : 'call'](target, newItem);
            }
            return target;
        },

    };


    return ret;

}());