

//观察者
class Watcher{
    private vm: any;
    private expr: any;
    private cb: any;
    private value: any;

    constructor(vm,expr,cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;

        //先获取老的值
        this.value = this.get();

    }


    /**
     * 获取值
     * @private
     */
    private get() {
        Dep.target = this;
     let value = this.getVal(this.vm,this.expr);
     Dep.target = null;
     return value;
    }

    /**
     * 获取值
     * @param vm
     * @param expr
     */
    getVal(vm,expr){
        expr = expr.split('.');
        return expr.reduce((prev,next) =>{
            return prev[next];
        },vm.getdata())
    }

    update(){
        let newValue = this.getVal(this.vm,this.expr);
        let oldValue = this.value;
        if(newValue != oldValue){
            this.cb(newValue);

        }
    }
}