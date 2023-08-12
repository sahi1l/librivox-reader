/*global $, Cookies*/
import { sources } from "./Holmes/holmes.js";
let playing = "";
let namelisting = {};
let history;
class History {
    //makes a random choice from a list
    //uses localStorage and values to avoid making duplicate jobs
    constructor() {
        this.cname = "history";
        this.maxhistory = 10; //maximum number of stories to avoid when choosing
        this.history = (Cookies.get(this.cname)??"").split(";");
    }
    write() {
        Cookies.set(this.cname, this.history.join(";"));
    }
    add(item) {
        if (this.contains(item)) {
            //move its previous appearance to the front
            this.history.splice(this.history.indexOf(item),1);
            this.history.push(item);
        } else {
            this.history.push(item);
            this.history = this.history.slice(-this.maxhistory);
        }
    }
    contains(item) {
        return (item in this.history);
    }
}

class Playlist {
    constructor() {
        this.getWidgets = this.getWidgets.bind(this);
        this.clear = this.clear.bind(this);
        $(this.getWidgets); //if this doesn't work, put it in init
        this.list = [];
        this.names = []; //redundant with this.list to save time
    }
    getWidgets() {
        this.$w = $("#playlist>ul");
        this.$clear = $("#playlist>#clear").hide();
        this.$clear.on("click",this.clear);
    }
    next() {
        this.names.splice(0,1);
        return this.list.splice(0,1)[0];
    };
    add(entry,allowDups=true) {//replaces AddToPlaylist
        //IDEA: implement allowDups=false
        this.list.push(entry);
        this.names.push(entry.name);
        this.update();
    }
    dupQ(entry) {
        if (entry === undefined) {
            return true;
        }
        return (history.contains(entry.name) || this.names.includes(entry.name));
    }
    addShuffle(entries,allowDups=true){
        entries = [...entries];
        let t = 0;
        while (entries.length>0 && t<100) {
            let entry;
            do {
                let i = Math.floor(Math.random()*entries.length);
                entry = entries.splice(i,1)[0];
            } while (this.dupQ(entry));
            //FIX: also check if the playlist includes the name
            this.list.push(entry);
            this.names.push(entry.name);
            t++;
        }
        this.update();
    }
    remove(n) {//replaces RemoveFromPlaylist
        let result = this.list.splice(n,1)[0];
        this.names.splice(n,1);
        this.update();
        return result;
    }
    clear () {
        this.list = [];
        this.names = [];
        this.update();
    }
    isempty() {
        return this.list.length==0;
    }
    
    update() {
        let trashicon = "&#128465;"
        this.$w.html("");
        for (let n in this.list) {
            //Make playlist entry
            let entry = this.list[n];
            let $li = $("<li>").appendTo(this.$w);
            let $p = $("<p>").html(entry.name).appendTo($li)
                .on("click",(e)=>{Play(this.remove(n));});
            $("<button>").addClass("trash")
                .html(trashicon)
                .prependTo($li)
                .on("click",(e)=>this.remove(n));
        }
        this.$clear.toggle(!this.isempty());
        if(!$("audio").length) {Play();}
    }
}
let playlist = new Playlist();
function Shuffle(source) {
    //rewrite to add one at a time
    playlist.addShuffle(source.entries);
}

function GetRandom(source) {
    let G;
    do { 
        G = source.get();
    } while (playlist.dupQ(G));
    playlist.add(G);
}
function skip(amt,cls=undefined) {
    let audio = $("audio")[0];
    let time = audio.currentTime;
    if(cls) {
        if(cls.includes("skipstart")){
            audio.currentTime = 0;
            return;
        } else if (cls.includes("skipend")) {
            audio.currentTime = audio.duration;
            return;
        }
    }
    if (time) {//if something is actually playing
        audio.currentTime = time+amt;
        //if amt is undefined, jump to the end
    }
}
function ClearAudio() {
    $("#audio").html("");
    $("#playing").html("");
    $("#player").addClass("hide");
}
function SaveCookies() {
    let $audio = $("audio");
    if ($audio.length==0) {return;}
    let name = playing;
    let time = $audio[0].currentTime;
    if (name != "") {
        Cookies.set("name",name,{expires: 1});
        Cookies.set("time",time,{expires: 1});
    }
}
function Play(entry) {
    if (!entry || !entry.name) {//sometimes Play is getting an event thingy
        entry = playlist.next();
        if(!entry || !entry.name) {ClearCookie();return;}
    }
    history.add(entry.name);
    $("#playing").html(entry.name);
    $("#audio").html("");
    $("#player").removeClass("hide");
    let $audio = $("<audio>").prop({controls:true,autoplay:true});
    playing = entry.name;
    $("<source>").attr({src: entry.url, type:"audio/mp3"}).appendTo($audio);
    $audio.appendTo($("#audio"));
    $audio.on("abort",(e) => $("#error").html("abort"));
    $audio.on("error",(e) => $("#error").html("loading error"));
    $audio.on("stalled",(e) => $("#error").html("stalled"));
    if(entry.parttwo) {
        $audio.on("ended",(e)=>{
            Play({name:entry.name+" Part II",url:entry.parttwo});});
    } else {
        $("audio").on("ended",()=>{ClearCookie();Play();});
    }
    playlist.update();
}

function PopulateStoryList() {
    for (let srcid of Object.keys(sources)) {
        let source = sources[srcid];
        source.$w = $("<section>").appendTo("nav");
        let $h2 = $("<h2>").html(source.name).appendTo(source.$w);

        let $buttons = $("<div id=rndbuttons>").appendTo(source.$w);
        $("<button>").addClass("shuffle bordered")
            .html("Shuffle")
            .appendTo($buttons)
            .on("click",
                (e,src=source) => {playlist.addShuffle(src.entries);}
               );
        
        $("<button>").addClass("random bordered")
            .html("Random")
            .appendTo($buttons)
            .on("click",
                (e,src=source) => {GetRandom(src);}
               );
        
        let $ul = $("<ul>").appendTo(source.$w);
        for (let i=0;i<source.length();i++) {
            let entry = source.get(i);
            namelisting[entry.name] = entry;
            let $li = $("<li>").appendTo($ul);
            let $row = $("<p>").appendTo($li);
            $row.on("click",(e,en=entry)=>Play(entry));
            $row.html(entry.name);
            $row.attr({href:entry.url});
            let $add = $("<button>")
                .addClass("add")
                .css({display:"inline"})
                .html("+")
                .prependTo($li);
            $add.on("click",(e,en=entry) => {playlist.add(en);});
            if (entry.parttwo) {$row.append("*");}
        }
    }
}

function GetCookies() {
    let name = Cookies.get("name");
    let time = Cookies.get("time");
    if (!name) {return;}
    let entry = namelisting[name];
    if (entry) {
        Play(entry);
        $("audio")[0].currentTime = Number(time);
//        $("#last").show();
        $("#last").on("click",(e,t=time) => {
            $("audio")[0].currentTime = Number(t);
            $("#last").hide();
        }
        );
    }
}
function ClearCookie() {
    playing = "";
    Cookies.remove("name");
    Cookies.remove("time");
}

function init() {
    console.log(Cookies);
    PopulateStoryList();
    history = new History();
    
    $("#player #buttons button.skip").on("click",(e) => {skip(Number(e.target.innerText),e.target.className);});
    ClearAudio();
    $("#last").hide();
    
    GetCookies();
    setInterval(SaveCookies,5000);
}
        

$(init);
