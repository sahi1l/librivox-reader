import { Adventures, Memoirs, Return } from "./holmesList.js";
class Source {
    constructor(name) {
        this.name = name;
        this.entries = [];
    }
    add(entry) {this.entries.push(entry);}
    length() {return this.entries.length;}
    get(val) {
        if (val== undefined) {
            val = Math.floor(Math.random() * this.length());
        } else if (val==-1) {val = this.length()-1;}
        return this.entries[val];
    }
}

export function loadHolmes() {
    let sources = {good: new Source("Good"),
               others: new Source("Others")};
    for (let L of [Adventures,Memoirs,Return]) {
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
            let entry = {name: name.replace(" Part 1",""),
                         url: url};
            if (code == "*") {sources.good.add(entry); last = sources.good.get(-1);}
            if (code == "-") {sources.others.add(entry); last = sources.others.get(-1);}
        }
    }
    return sources;
}
