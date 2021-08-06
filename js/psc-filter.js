var pscFilters = {};
var pscPagingSettings = {};
var pscFilterSettings = {};


/**
 * containerId: ID of grid container element
 * filterListId: ID of filter bar/block UL element
 * taxonomy: taxonomy slug for this filter
 * terms: object with slug => name term pairs
 **/

function pscBuildFilter(containerId,filterListId,taxonomy,terms){

   var containerElement = document.getElementById(containerId);

   var blocks = containerElement.childNodes;

   pscFilterSettings["filterListId"] = filterListId;


   var classes = '';

   for(var i = 0; i < blocks.length; i++){
      classes += ' '+blocks[i].className;
   }

   var classesArrayRaw = classes.split(" ");


    var seen = {};

    var classesArray = classesArrayRaw.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });


   classesArray.sort(function(a,b){
    return a.localeCompare(b);
   });


   for(var i = 0; i < classesArray.length; i++){
      if(classesArray[i].substr(0,taxonomy.length) == taxonomy){

        var termSlug = classesArray[i].substr(taxonomy.length+1);
        var li = document.createElement("li");
        var a = document.createElement("a");
        var text = document.createTextNode(terms[termSlug]);

        li.className = "filter-"+taxonomy+"-"+termSlug;

        a.className = "psc-filter-button";
        a.setAttribute('href',"#");
        a.setAttribute('data-filter-dimension',taxonomy);
        a.setAttribute('data-filter-value',termSlug);
        a.setAttribute('data-filter-container',containerId);

        a.onclick = function(e){
          e.preventDefault();
          pscFilter(e.target.getAttribute("data-filter-dimension"),e.target.getAttribute("data-filter-value"),e.target.getAttribute("data-filter-container"));
        };

        a.appendChild(text);

        li.appendChild(a);

        document.getElementById(filterListId).appendChild(li);

      }
   }

   foldFilterList(taxonomy);

}

jQuery(document).ready(function($) {

  $('.psc-filter-button').on('click', function (e) {

    e.preventDefault();

    pscFilter(e.target.getAttribute("data-filter-dimension"),e.target.getAttribute("data-filter-value"),e.target.getAttribute("data-filter-container"));

  });

});


function pscFilter(dimension,value,containerId){

   if(value == 'all'){
     if(pscFilters[dimension]){
       delete pscFilters[dimension];
     }
   }else if(value){
      pscFilters[dimension] = value;
   }

   var parentElement = document.getElementById(containerId);
   var blocks = parentElement.childNodes;

   var hasFilters = false;
   if(Object.keys(pscFilters).length > 0){
     hasFilters = true;
   }

   var resultCount = 0;

   for(var i = 0; i < blocks.length; i++){

      var block = blocks[i];

      if(block.nodeType != 1){
        continue;
      }

      block.setAttribute('data-display-cause','');

      if(hasFilters){
         for (var fDimension in pscFilters){
            //if(block.classList.contains(fDimension+'-'+pscFilters[fDimension])){
            if(block.className.indexOf(fDimension+'-'+pscFilters[fDimension]) != -1){
               block.style.display = "block";
            }else{
               block.style.display = "none";
               break;
            }
         }
      }else{
         block.style.display = "block";
      }

      if(block.style.display == "block"){
         resultCount++;
      }

   }


   if(resultCount == 0){
     jQuery("#"+pscFilterSettings.upfx+"-psc-filter-no-results").show();
   }else{
     jQuery("#"+pscFilterSettings.upfx+"-psc-filter-no-results").hide();
   }

   var allButtons = document.getElementsByClassName('psc-filter-button');

   for(var i = 0; i < allButtons.length; i++){

      var button = allButtons[i];
      var buttonDimension = button.getAttribute('data-filter-dimension');
      var buttonValue = button.getAttribute('data-filter-value');
      if(buttonDimension == dimension){
        if((!pscFilters[buttonDimension] && buttonValue == "all") || buttonValue == pscFilters[buttonDimension]){
           button.className = "psc-filter-button active";
        }else{
           button.className = "psc-filter-button";
        }
      }
   }


   foldFilterList(dimension);

   if(pscPagingSettings.paginate){
      pscPaginate();
   }
}

function unfoldFilterList(event){

     var li;

     if(event.target.tagName == "SPAN"){
       li = event.target.parentNode.parentNode;
     }else if(event.target.tagName == "DIV"){
       li = event.target.parentNode;
     }

     var div = li.childNodes[0];

     var taxonomyTitle = li.childNodes[0].childNodes[0].innerHTML;

     var ul = li.parentNode;
     var taxonomy = ul.getAttribute("data-filter-taxonomy");
     var lis = ul.childNodes;

     div.innerHTML = "<span>"+taxonomyTitle+"</span>";
     div.className = "";

     for(var i=1;i<lis.length;i++){
       lis[i].style.display = "block";
     }

     li.onclick = function(e){
        console.log(e);
        var list = e.target.parentNode.parentNode;
        if (list.tagName != "UL"){
          list = list.parentNode;
        }
        foldFilterList(list.getAttribute("data-filter-taxonomy"));
     };

}


function foldFilterList(taxonomy){

   var filterList = document.getElementById(taxonomy+"-filter");
   var filterListItems = filterList.childNodes;
   var activeButtonText = filterList.getElementsByClassName("active")[0].innerHTML;

   var titleLi = filterListItems[0];

   var taxonomyTitle = titleLi.childNodes[0].childNodes[0].innerHTML;

   titleLi.childNodes[0].innerHTML = "<span>"+taxonomyTitle+"</span>: "+activeButtonText+"";
   titleLi.childNodes[0].className = "all-rounded";

   titleLi.onclick = function(e){
      unfoldFilterList(e);
   };

   for(var i=1;i<filterListItems.length;i++){
     filterListItems[i].style.display = "none";
   }
}


function logMillis(label){
  var log_time = new Date();
  console.log(label+": "+log_time.getSeconds()+":"+log_time.getMilliseconds());
}


function pscPaginate(page){

    if(!page){
      page = 1;
    }

    var containerId = pscPagingSettings.container;
    var upfx = pscPagingSettings.upfx;
    var rpp = pscPagingSettings.rpp;
    var containerElement = document.getElementById(containerId);
    var blocks = containerElement.childNodes;
    var topPagingBar = document.getElementById('psc-paging-bar-'+upfx);
    var bottomPagingBar = document.getElementById('psc-paging-bar-bottom-'+upfx);

    if(!bottomPagingBar){

       var bottomPagingBar = topPagingBar.cloneNode();
       bottomPagingBar.id = 'psc-paging-bar-bottom-'+upfx;
       containerElement.parentNode.insertBefore(bottomPagingBar,containerElement.nextSibling);

    }

    var count = 0;

    for(var i = 0; i < blocks.length; i++){

        var block = blocks[i];

        if(block.nodeType != 1){
          continue;
        }

        if(block.style.display != 'none' || (block.style.display == 'none' && block.getAttribute("data-display-cause") == 'paging')){

          count += 1;

          if(page == "all"){
            if(block.getAttribute("data-display-cause") == 'paging'){
               block.style.display = 'block';
            }
          }else if(count < ((rpp * (page -1))+1) || count > (rpp * page)){
             block.style.display = 'none';
             block.setAttribute('data-display-cause','paging');
          }else{
            if(block.getAttribute("data-display-cause") == 'paging'){
               block.style.display = 'block';
            }
          }
        }
    }

    var num_pages = count/rpp;

    if(num_pages <= 1){
     topPagingBar.style.display = "none";
     bottomPagingBar.style.display = "none";
     return;
    }else{
     topPagingBar.style.display = "block";
     bottomPagingBar.style.display = "block";
    }


    var pagingControlsUl = document.getElementById('psc-paging-controls-ul-'+upfx);

    pagingControlsUl.innerHTML = '<li><span>page</span></li>';



    for(var i = 0; i < num_pages; i++){
        addPagingButton(page,(i+1).toString(),pagingControlsUl);
    }

    addPagingButton(page,"all",pagingControlsUl);

    bottomPagingBar.innerHTML = '';
    bottomPagingBar.appendChild(pagingControlsUl.cloneNode(true));

    var bottomPagingLinks = bottomPagingBar.getElementsByTagName("a");

    for(var i = 0; i < bottomPagingLinks.length; i++){
      bottomPagingLinks[i].onclick = function(e){
          e.preventDefault();
          pscPaginate(e.target.getAttribute("data-paginate-page"));
          topPagingBar.scrollIntoView(false); // Scroll to top when bottom paging is clicked
      };
    }
}

function addPagingButton(currentPage,buttonValue,pagingControlsUl){

    var li = document.createElement("li");
    var a = document.createElement("a");
    var text = document.createTextNode(buttonValue);

    if(buttonValue == currentPage){
       a.className = "psc-paging-button active";
    }else{
       a.className = "psc-paging-button";
    }

    a.href = "#";
    a.setAttribute('data-paginate-page',buttonValue);

    a.onclick = function(e){
      e.preventDefault();
      pscPaginate(e.target.getAttribute("data-paginate-page"));
    };

    a.appendChild(text);
    li.appendChild(a);
    pagingControlsUl.appendChild(li);

}
