/*global $*/
import { sources } from "./Holmes/holmes.js";

class Playlist {
    constructor() {
        this.getWidgets = this.getWidgets.bind(this);
        this.clear = this.clear.bind(this);
        $(this.getWidgets); //if this doesn't work, put it in init
        this.list = [];
    }
    getWidgets() {
        this.$w = $("#playlist>ul");
        this.$clear = $("#playlist>#clear").hide();
        this.$clear.on("click",this.clear);
    }
    next() {
        return this.list.splice(0,1)[0];
    };
    add(entry,allowDups=true) {//replaces AddToPlaylist
        //IDEA: implement allowDups=false
        this.list.push(entry);
        this.update();
    }
    addShuffle(entries,allowDups=true){
        entries = [...entries];
        let t = 0;
        while (entries.length>0 && t<100) {
            let i = Math.floor(Math.random()*entries.length);
            let entry = entries.splice(i,1)[0];
            this.list.push(entry);
            t++;
        }
        this.update();
    }
    remove(n) {//replaces RemoveFromPlaylist
        let result = this.list.splice(n,1)[0];
        this.update();
        return result;
    }
    clear () {
        this.list = [];
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
    playlist.add(source.get());
}
function skip(amt,cls=undefined) {
    console.debug("skip",amt,cls);
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
function Play(entry) {
    if (!entry || !entry.name) {//sometimes Play is getting an event thingy
        entry = playlist.next();
        if(!entry || !entry.name) {return;}
    }
    $("#playing").html(entry.name);
    $("#audio").html("");
    $("#player").removeClass("hide");
    let $audio = $("<audio>").prop({controls:true,autoplay:true});
    $("<source>").attr({src: entry.url, type:"audio/mp3"}).appendTo($audio);
    $audio.appendTo($("#audio"));
    if(entry.parttwo) {
        $("audio").on("ended",(e)=>{
            Play({name:entry.name+" Part II",url:entry.parttwo});});
    } else {
        $("audio").on("ended",Play);
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
                (e,src=source) => {playlist.add(source.get());}
               );
        
        let $ul = $("<ul>").appendTo(source.$w);
        for (let i=0;i<source.length();i++) {
            let entry = source.get(i);
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
function init() {
    PopulateStoryList();
    $("#player #buttons button.skip").on("click",(e) => {skip(Number(e.target.innerText),e.target.className);});
    ClearAudio();
}
        

$(init)
