
class Observer{
    constructor(data: any) {
        this.observe(data);
    }


    /**
     * set和get形式
     * @param data
     * @private
     */
    observe(data: any) {
        if(!data || typeof data !== 'object'){
            return;
        }
        //将数据进行劫持
        Object.keys(data).forEach(key =>{
            //劫持
            this.defineReactive(data,key,data[key]);
            this.observe(data[key]);
        })
    }

    /**
     * 定义响应式
     * @param obj
     * @param key
     * @param value
     * @private
     */
    private defineReactive(obj: any, key: string, value: any) {
        let that = this;
        let dep = new Dep();
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:true,
            get(){
                Dep.target && dep.addSub(Dep.target);
                return value;
            },
            set(newValue: any) {
                if(newValue != value){
                    that.observe(newValue);
                    value = newValue;
                    dep.notify();
                }
            }
        })
    }
}


/**
 * 发布订阅模式
 */
class Dep{
    private subs: any[];
    static target: any;
    constructor() {
        this.subs = [];
    }

    /**
     * 添加订阅数组
     */
    addSub(watcher){
        this.subs.push(watcher);
    }

    notify(){
        this.subs.forEach(watcher => watcher.update());
    }

}