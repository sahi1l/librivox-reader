import { loadHolmes } from "./holmes.js";
let playlist = [];
let sources = {};
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];
  }
}
function Shuffle(source) {
    playlist = [...source.entries];
    shuffle(playlist);
    UpdatePlaylist();
}

function GetRandom(source) {
    AddToPlaylist(source.get());
}
function skip(amt) {
    let time = $("audio")[0].currentTime;
    if (time) {
        $("audio")[0].currentTime = time+amt;
    }
}
function ClearAudio() {
    $("#audio").html("");
    $("#playing").html("");
    $("#player").addClass("hide");
}
function UpdatePlaylist() {
    $("#playlist").html("");
    for (let n in playlist) {
        let entry = playlist[n];
        let $li = $("<li>").appendTo("#playlist").html(entry.name);
        $("<button>").addClass("trash").html("&#128465;").prependTo($li).on("click",(e,en=entry)=>RemoveFromPlaylist(n));
    }
    if(!$("audio").length) {
        Play();
    }
}
function RemoveFromPlaylist(n) {
    playlist.splice(n,1);
    UpdatePlaylist();
}
function AddToPlaylist(entry) {
    playlist.push(entry);
    UpdatePlaylist();
}
function Play(entry) {
    console.log("Play");
    if (!entry || !entry.name) {//sometimes Play is getting an event thingy
        if (!playlist.length) {
            return;
        } else {
            entry = {...playlist[0]};
            playlist = playlist.slice(1);
        }
    }
    $("#playing").html(entry.name);
    $("#audio").html("");
    $("#player").removeClass("hide");
    let $audio = $("<audio>").prop({controls:true,autoplay:true}).appendTo($("#audio"));
    $("<source>").attr({src: entry.url, type:"audio/mp3"}).appendTo($audio);
    if(entry.parttwo) {
        $("audio").on("ended",(e)=>{Play({name:entry.name,url:entry.parttwo});});
    } else {
        $("audio").on("ended",Play);
    }
    UpdatePlaylist();
}

function init() {
    sources = loadHolmes();
    console.debug(sources);
    for (let srcid of Object.keys(sources)) {
        let source = sources[srcid];
        source.$w = $("<section>").appendTo("nav");
        let $h2 = $("<h2>").html(source.name).appendTo(source.$w);
        $("<button>").addClass("shuffle").html("Shuffle")
            .appendTo($h2)
            .on("click", (e,s=source) => {Shuffle(s);}
               );
        $("<button>").addClass("random").html("Random").appendTo($h2)
            .on("click", (e,s=source) => {GetRandom(s);}
               );
        let $ul = $("<ul>").appendTo(source.$w);
        console.debug(source,source.length());
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
            $add.on("click",(e,en=entry) => {AddToPlaylist(en);});
            if (entry.parttwo) {
                $row.append("*");
            }
        }
    }
/*    $ul = $("#others ul");
    for (let i=0;i<others.length;i++) {
        let entry = others[i];
        let $li = $("<li>").appendTo($ul);
        let $row = $("<p>").appendTo($li);
        $row.on("click",(e,en=entry)=>Play(entry));
        $row.html(entry.name);
        $row.attr({href:entry.url});
        if (entry.parttwo) {
            $row.append("*");
        }
    }
*/
    $("#player #buttons button").on("click",(e) => {skip(Number(e.target.innerText));});
    ClearAudio();
}
        

$(init)
