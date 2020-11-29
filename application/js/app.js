var masterExt = navigator.engmodeExtension || navigator.jrdExtension || navigator.kaiosExtension; 
var executor;
var overlayTimeout;
var keyTimeout;
var longPress;

window.addEventListener('DOMContentLoaded', function() {

  var mainlist = document.getElementById('filepicker')
  var items = [], textIndex = 0
  var activityHandler = null
  var defPathPrefixes = ["iso","ISO","downloads","0/iso","0/ISO","0/downloads","1/iso","1/ISO","1/downloads"]
  
  function fparts(fName) {
    let parts = fName.split('/')
    let basename = parts.pop()
    return {dirname: parts.join('/'), basename: basename}
  }
  
  function refreshFileList() {
    mainlist.innerHTML = ''
    for(let i=0,l=items.length;i<l;i++) {
      let item = document.createElement('div')
      item.innerHTML = items[i].name
      item.classList.add('picker-file')
      mainlist.appendChild(item)
    }
    mainlist.children[0].classList.add('active')
  }
  
  function rescanFiles(pathPrefixes) {
    items = []
    let sdcards = navigator.getDeviceStorages('sdcard'), storageAmount = sdcards.length
    for(let i=0;i<storageAmount;i++) {
//      for(let k=0;k<pathPrefixes.length;k++) {
//        let fileCursor = sdcards[i].enumerate(pathPrefixes[k])
        let fileCursor = sdcards[i].enumerate()
        fileCursor.onsuccess = function() {
          if(fileCursor.result && fileCursor.result.name !== null) {
            let file = fileCursor.result;
            if(fparts(fileCursor.result.name).basename.indexOf('.iso') > -1) {
              items.push(file)
              refreshFileList()
            }
            fileCursor.continue()
          }
        }
//      }
    }
  }
  
  function selectFileByIndex() {
    [].forEach.call(mainlist.children, function(el) {
      el.classList.remove('active')
    })
    let activeElem = mainlist.children[textIndex]
    activeElem.classList.add('active')
    if(activeElem.offsetTop > mainlist.offsetHeight)
      mainlist.scrollTop = activeElem.offsetTop
    else mainlist.scrollTop = 0
  }
  
  function mountIso(isoFile) {
    console.log("Called action mount");
//    let isoFile = isoFileObj.name;
    if (isoFile.substring(0,8).toLowerCase()=='/sdcard/') isoFile='/usbmsc/'+isoFile.substring(8);
    if (isoFile.substring(0,9).toLowerCase()=='/sdcard1/') isoFile='/sdcard/'+isoFile.substring(9);

    executor = masterExt.startUniversalCommand('mount -o remount,rw /system && sleep 0.5 && rm -f /etc/adb.iso && ln -s ' + "'" + isoFile + "'" + ' /etc/adb.iso && mount -o remount,ro /system', true);
    executor.onsuccess = function() {
		keyOverlay.style.display = 'block';
		keyOverlay.innerHTML = '&#128191;'; 
		console.log('ISO mounted.');

		// clear overlay
		clearTimeout(overlayTimeout);
		overlayTimeout = setTimeout(function () {
			keyOverlay.innerHTML = ' ';
			keyOverlay.style.display = 'none';
		}, 1000);        
    }
  }

  function unmountIso() {
    executor = masterExt.startUniversalCommand('mount -o remount,rw /system && sleep 0.5 && rm -f /etc/adb.iso && mount -o remount,ro /system', true);
    executor.onsuccess = function() {
		keyOverlay.style.display = 'block';
		keyOverlay.innerHTML = '&#10060;'; // '&#9167;';
		console.log('ISO unmounted.');

		// clear overlay
		clearTimeout(overlayTimeout);
		overlayTimeout = setTimeout(function () {
			keyOverlay.innerHTML = ' ';
			keyOverlay.style.display = 'none';
		}, 1000);
    }
  }

  function saveSpeedDial(keyCode,isoFileObj) {
    localStorage.setItem('Speed'+keyCode.charCodeAt(0), isoFileObj.name);

    keyOverlay.style.display = 'block';
    keyOverlay.innerHTML = '&#128077;';
    console.log('Speed dial saved.');

    // clear overlay
    clearTimeout(overlayTimeout);
    overlayTimeout = setTimeout(function () {
        keyOverlay.innerHTML = ' ';
        keyOverlay.style.display = 'none';
    }, 1000);        
  }

  window.addEventListener('keyup', function(e) {
    clearTimeout(keyTimeout);
    switch(e.key) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '*':
      case '0':
      case '#':
        if (longPress==1) {
          var currentFile = items[textIndex];
          if(currentFile) 
            saveSpeedDial(e.key, currentFile.name);
        } else {
          var fileName = localStorage.getItem('Speed'+e.key.charCodeAt(0));
          if(fileName) 
            mountIso(fileName)
        }
        break;
      default:
        break;
    }
  })
  
  window.addEventListener('keydown', function(e) {
   switch(e.key) {
     case 'ArrowUp': //scroll up
     case 'ArrowLeft':
       textIndex--
       if(textIndex < 0) textIndex = items.length -1
       selectFileByIndex()
       break;
     case 'ArrowDown': //scroll down
     case 'ArrowRight':
       textIndex++
       if(textIndex > (items.length - 1) ) textIndex = 0
       selectFileByIndex()
       break;
     case 'SoftRight': //rescan
       rescanFiles(defPathPrefixes)
       break;
     case 'SoftLeft': //help
       var helpWindow = new MozActivity({
          name: "c-iv.isoplayer.help",
          data: {}
       })
       helpWindow.onsuccess = function(){}
       break;
     case 'Call': //unmount
       unmountIso()
       break;       
     case 'Enter': //pick the file
       var currentFile = items[textIndex]
       if(currentFile)
         mountIso(currentFile.name)
       break;
     default:
       longPress = 0
       clearTimeout(keyTimeout)
       keyTimeout = setTimeout(function () {
           longPress=1
       }, 1000)
       break;
   }})
  
  rescanFiles(defPathPrefixes)
  
}, false)