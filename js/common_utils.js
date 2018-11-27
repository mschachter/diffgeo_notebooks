
function decorateCodeToggle()
{
    $("#codeToggle").append('<form action="javascript:codeToggle()"><input type="submit" id="toggleButton" value="Hide Code"></form>');
}

function codeToggle()
{
    var tb_value = $('#toggleButton').val()
    var code_shown = tb_value == 'Hide Code'
    if (code_shown){
        $('div.input').hide('500');
        $('#toggleButton').val('Show Code')
    } else {
        $('div.input').show('500');
        $('#toggleButton').val('Hide Code')
    }
}

function createTOC()
{
    var toc = "";
    var level = 0;
    var levels = {}
    $('#toc').html('');

    $("#title").css({"font-size": 30, "font-weight": "bold"});

    $(":header").each(function(i){        
        if (this.id=='tocheading'){console.log('reached tocheading');return;}
        
        var titleText = this.innerHTML;
        var openLevel = this.tagName[1];
        // console.log('creating toc, this.id=',this.id,', this.class=', this.class, ',i=',i,', titleText=',titleText,', openLevel=',openLevel);

        if (levels[openLevel]){
        levels[openLevel] += 1;
        } else{
        levels[openLevel] = 1;
        }

        if (openLevel > level) {
        toc += (new Array(openLevel - level + 1)).join('<ul class="toc">');
        } else if (openLevel < level) {
        toc += (new Array(level - openLevel + 1)).join("</ul>");
        for (i=level;i>openLevel;i--){levels[i]=0;}
        }

        level = parseInt(openLevel);

        if (this.id==''){this.id = this.innerHTML.replace(/ /g,"-")}
        var anchor = this.id;
        
        toc += '<li><a href="#' + encodeURIComponent(anchor) + '">'
        + levels[openLevel].toString() + '. ' + titleText
        + '</a></li>';
        
    });
    if (level) {
    toc += (new Array(level + 1)).join("</ul>");
    }
    $('#toc').append(toc);
}

function initPage()
{
    // Executes the createToc function
    setTimeout(function(){createTOC();},100);

    // Rebuild to TOC every minute
    setInterval(function(){createTOC();},60000);

    decorateCodeToggle();
}

$( document ).ready(function() {
    initPage();
});


