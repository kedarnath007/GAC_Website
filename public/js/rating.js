function goBack(){
    window.history.back();
}

var rating = "";
var rating1 = "";
function starmark(item){
    var count = item.id[0];
    rating = count;
    console.log('Sridhar');
    var subid = item.id.substring(1);
    for(var i=0;i<5;i++){
        if(i<count){
            document.getElementById((i+1) + subid).style.color="orange";
        } else {
            document.getElementById((i+1) + subid).style.color="black";
        }
    }
}

function starmark1(item){
    var count = item.id[0];
    rating1 = count;
    var subid = item.id.substring(1);
    for(var i=0;i<5;i++){
        if(i<count){
            document.getElementById((i+1) + subid).style.color="orange";
        } else {
            document.getElementById((i+1) + subid).style.color="black";
        }
    }
}

function showRating(){
    var xhr = new XMLHttpRequest();
    var url = '&itemRating=' + rating + "&userRating=" + rating1;
    return url;
}