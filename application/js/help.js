
window.addEventListener('DOMContentLoaded', function() {
  
   var activityHandler = null;
   
   navigator.mozSetMessageHandler('activity', function(activityRequest) {
    let option = activityRequest.source

    if(option.name === "c-iv.isoplayer.help") {
      activityHandler = activityRequest
    }
  })

  
  window.addEventListener('keydown', function(e) {
   let cntr = document.getElementById('help')
   switch(e.key) {
     case 'Enter': //close the activity
       activityHandler.postResult({})
       break;
     case 'ArrowUp': //close the activity
       if (cntr.scrollTop>0) cntr.scrollTo(0,cntr.scrollTop - 5);
       break;
     case 'ArrowDown': //close the activity
       if (cntr.scrollTop<cntr.scrollHeight) cntr.scrollTo(0,cntr.scrollTop + 5);
       break;
   }})
  
  
}, false)