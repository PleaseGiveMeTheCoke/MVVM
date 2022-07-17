import Watcher from "./watcher";

export default class Compiler{
    constructor(context){
        this.$el = context.$el;
        this.context = context;
        if(this.$el){
            //把原始dom转为文档片段
            this.$fragment = this.nodeToFragment(this.$el);
            //编译模板
            this.compiler(this.$fragment);
            //把文档片段添加到页面中
            this.$el.appendChild(this.$fragment)    
        }
    }
    //把所有的元素转为文档片段
    nodeToFragment(node){
        let fragment = document.createDocumentFragment();
        if(node.childNodes && node.childNodes.length){
            node.childNodes.forEach(child => {
                //判断是不是需要添加的节点（注释节点或者无用的换行节点不予添加）
                if(!this.ignorable(child)){
                    fragment.appendChild(child)
                }
            });
        }
        return fragment;
    }

    ignorable(node){
        var reg = /^[\t\n\r]+/;
        return (
            node.nodeType === 8 || node.nodeType === 3 || reg.test(node.textContent)
        )
    }

    compiler(node) {
        if(node.childNodes && node.childNodes.length){
            node.childNodes.forEach(child => {
                if(child.nodeType === 1){
                    this.compilerElementNode(child)
                }else if(child.nodeType === 3){
                    this.compilerTextNode(child)
                }
            });
        }
    }

    compilerElementNode(node){
        let attrs = [...node.attributes];
        let that = this;
        attrs.forEach(attr =>{
            let {name:attrName,value:attrValue } = attr;
            if(attrName.indexOf("v-") === 0){
                let dirName = attrName.slice(2);
                switch(dirName){
                    case "text":
                        new Watcher(attrValue,this.context,newValue =>{
                            node.textContent = newValue;
                        })
                        break;
                    case "model":
                        new Watcher(attrValue,this.context,newValue =>{
                            node.value = newValue;
                        });
                        node.addEventListener("input",e=>{
                            that.context[attrValue] = e.target.value;
                        })
                        break;
                }
            }
            if(attrName.indexOf("@")===0){
                this.compilerMethods(this.context,node,attrName,attrValue);
            }
        })
        this.compiler(node);
    }
    //函数编译
    compilerMethods(scope,node,attrName,attrValue){
        //获取类型
        let type = attrName.slice(1);
        //获取函数体
        let fn = scope[attrValue];
        node.addEventListener(type,fn.bind(scope));
    }

    compilerTextNode(node){
        let text = node.textContent.trim();
        if(text){
           let exp =  this.parseTextExp(text);
            new Watcher(exp,this.context,newValue => {
                node.textContent = newValue;
            });
        }
    }

    parseTextExp(text){
        let regText = /\{\{(.+?)\}\}/g;
        let pieces = text.split(regText);
        let matches = text.match(regText);
        let tokens = [];
        pieces.forEach(element => {
            if(matches && matches.indexOf("{{"+element+"}}")>-1){
                tokens.push("("+element+")")
            }else{
                tokens.push("`"+element+"`")
            }
        });

        return tokens.join("+");
    }
}