class Compile {
    constructor(el, mvvm) {
        /**
         * 工具，利于可修改性
         */
        this.CompileUtil = {
            /**
             * 获取实例上对应的数据
             * @param vm
             * @param expr
             */
            getVal(vm, expr) {
                //用于处理{{message.a.b.c}}这类情况
                expr = expr.split('.');
                return expr.reduce((prev, next) => {
                    return prev[next];
                }, vm.getdata());
            },
            /**
             * 获取编译后文本
             * @param vm
             * @param expr
             */
            getTextVal(vm, expr) {
                return expr.replace(/\{\{([^}]+)\}\}/g, (...arg) => {
                    return this.getVal(vm, arg[1]);
                });
            },
            /**
             * 文本处理
             * @param node
             * @param mvvm
             * @param expr
             */
            text(node, mvvm, expr) {
                let updateFn = this.updater['textUpdater'];
                let value = this.getTextVal(mvvm, expr);
                expr.replace(/\{\{([^}]+)\}\}/g, (...arg) => {
                    new Watcher(mvvm, arg[1], (newValue) => {
                        //如果数据变化文本节点需重新获取依赖数据
                        updateFn && updateFn(node, this.getTextVal(mvvm, expr));
                    });
                });
                updateFn && updateFn(node, value);
            },
            setVal(vm, expr, value) {
                expr = expr.split('.');
                return expr.reduce((prev, next, currentIndex) => {
                    if (currentIndex === expr.length - 1) {
                        return prev[next] = value;
                    }
                    return prev[next];
                }, vm.getdata());
            },
            bind(node, mvvm, expr) {
                let updateFn = this.updater['modelUpdater'];
                new Watcher(mvvm, expr, (newValue) => {
                    updateFn && updateFn(node, this.getVal(mvvm, expr));
                });
                updateFn && updateFn(node, this.getVal(mvvm, expr));
            },
            /**
             * 输入框处理
             * @param node
             * @param mvvm
             * @param expr
             */
            model(node, mvvm, expr) {
                //输入框处理
                let updateFn = this.updater['modelUpdater'];
                //加一个监控，当数据变化时调用watcher的callback
                new Watcher(mvvm, expr, (newValue) => {
                    updateFn && updateFn(node, this.getVal(mvvm, expr));
                });
                node.addEventListener('input', (e) => {
                    let newValue = e.target.value;
                    this.setVal(mvvm, expr, newValue);
                });
                updateFn && updateFn(node, this.getVal(mvvm, expr));
            },
            updater: {
                textUpdater(node, value) {
                    node.textContent = value;
                },
                modelUpdater(node, value) {
                    node.value = value;
                }
            }
        };
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.mvvm = mvvm;
        //元素能获取才开始编译
        if (this.el) {
            //真是DOM移到内存中
            let fragment = this.nodeToFragment(this.el);
            //编译
            this.compile(fragment);
            //塞回页面
            this.el.appendChild(fragment);
        }
    }
    /**
     * 判断是否是元素节点
     * @param node
     */
    isElementNode(node) {
        return node.nodeType === 1;
    }
    /**
     * 判断是否是指令
     * @param attrName
     * @private
     */
    isDirective(attrName) {
        return attrName.includes('v-');
    }
    /**
     * 将内存中内容放到文档碎片中
     * @param el
     * @private
     */
    nodeToFragment(el) {
        //文档碎片
        let fragment = document.createDocumentFragment();
        let theone;
        while (theone = el.firstChild) {
            fragment.appendChild(theone);
        }
        return fragment;
    }
    compile(fragment) {
        //需要递归
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                //如果是元素节点，继续深入
                this.compileElement(node);
                this.compile(node);
            }
            else {
                this.compileText(node);
            }
        });
    }
    /**
     * 编译元素
     * @param node
     * @private
     */
    compileElement(node) {
        //v-model
        let attrs = node.attributes;
        Array.from(attrs).forEach(attr => {
            //判断v-
            // @ts-ignore
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                //取对应值放到节点中
                // @ts-ignore
                let expr = attr.value;
                let [, type] = attrName.split('-');
                //可扩展性
                this.CompileUtil[type](node, this.mvvm, expr);
            }
        });
    }
    /**
     * 编译文本
     * @param node
     * @private
     */
    compileText(node) {
        //带{{}}
        let text = node.textContent;
        let reg = /\{\{([^}]+)\}\}/g;
        if (reg.test(text)) {
            this.CompileUtil['text'](node, this.mvvm, text);
        }
    }
}
//# sourceMappingURL=Compile.js.map