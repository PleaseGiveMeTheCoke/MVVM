import Dep from "./dep";

 export default class Observer{
    constructor(data){
        this.data = data;

        this.walk(this.data)
    }

    walk(data) {
        if(!data || typeof data !== 'object') {
            return;
        }

        Object.keys(data).forEach(key =>{
            this.defineReactive(data,key,data[key])
        });
    }

    defineReactive(data,key,value){
        let dep = new Dep();
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:false,
            get:()=>{
                Dep.target && dep.addSub(Dep.target);
                return value;
            },
            set:(newValue)=>{
                console.log("set")
                value = newValue;
                dep.notify();
            }
        });
        //递归执行，如果value为object类型需要继续拦截value的属性
        this.walk(value);
    }
 }