let good = [];
let others = [];
let playlist = [];
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

    // swap elements array[i] and array[j]
    // we use "destructuring assignment" syntax to achieve that
    // you'll find more details about that syntax in later chapters
    // same can be written as:
    // let t = array[i]; array[i] = array[j]; array[j] = t
    [array[i], array[j]] = [array[j], array[i]];
  }
}
function ShuffleGood() {
    playlist = [...good];
    shuffle(playlist);
    UpdatePlaylist();
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
        $("<div>").addClass("button").html("&#128465;").prependTo($li).on("click",(e,en=entry)=>RemoveFromPlaylist(n));
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
    for (let L of [AoSH,MoSH,RoSH]) {
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
            let entry = {name: name.replace(" Part 1",""), url: url};
            if (code == "*") {good.push(entry); last = good[good.length-1];}
            if (code == "-") {others.push(entry); last = others[others.length-1];}}
    }
    let $ul = $("#good ul");
    for (let i=0;i<good.length;i++) {
        let entry = good[i];
        let $li = $("<li>").appendTo($ul);
        let $row = $("<p>").appendTo($li);
        $row.on("click",(e,en=entry)=>Play(entry));
        $row.html(entry.name);
        $row.attr({href:entry.url});
        let $add = $("<div>").addClass("button").css({display:"inline"}).html("+").prependTo($li);
        $add.on("click",(e,en=entry) => {AddToPlaylist(en);});
        if (entry.parttwo) {
            $row.append("*");
        }
    }
    $ul = $("#others ul");
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

    $("#player #buttons .button").on("click",(e) => {skip(Number(e.target.innerText))});
    $("#good h2 button").on("click",ShuffleGood);
    ClearAudio();
}
        

$(init)
