import { Adventures, Memoirs, Return, LastBow } from "./list.js";
class Entry {
    constructor(name,url) {
        this.name = name;
        this.url = url;
        this.isentry = true;
    }
}
class Source {
    constructor(name,tag) {
        this.name = name;
        this.tag = tag;
        this.entries = [];
    }
    add(entry) {this.entries.push(entry);}
    length() {return this.entries.length;}
    get(val) {
        if (val==undefined) {
            val = Math.floor(Math.random() * this.length());
        } else if (val==-1) {val = this.length()-1;}
        return this.entries[val];
    }
}

export function loadHolmes() {
    let sources = [new Source("Stories",'good'),
                   new Source("Uncomfortable",'others')];
    for (let L of [Adventures,Memoirs,Return,LastBow]) {
        let urltemplate = L[0];
        let last = null;
        for (let n=1; n<L.length; n++) {
            let url = urltemplate.replace("@",("0"+n).slice(-2));
            let code = L[n][0];
            let name = L[n].slice(1);
            if (code == "^" && last) {
                last.parttwo = url;
                continue;
            }
            let entry = new Entry(name.replace(" Part 1",""),url);
            if (code == "*") {sources[0].add(entry); last = sources[0].get(-1);}
            if (code == "-") {sources[1].add(entry); last = sources[1].get(-1);}
        }
    }
    return sources;
}
export let sources = loadHolmes();
