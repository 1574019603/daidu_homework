

class MVVM{

    private el: any;
    private data: any;



    constructor(options) {
        //将信息挂载在实例上
        this.el = options.el;
        this.data = options.data;

        //如果el存在则编译,使用编译类
        if(this.el){
            //数据劫持
            new Observer(this.data);
            //对数据和元素进行编译
            new Compile(this.el,this);
        }
    }

    getdata(): any {
        return this.data;
    }

    getel(): any{
        return this.el;
    }

}