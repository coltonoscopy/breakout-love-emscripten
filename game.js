
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'game.data';
    var REMOTE_PACKAGE_BASE = 'game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'fonts', true, true);
Module['FS_createPath']('/', 'graphics', true, true);
Module['FS_createPath']('/', 'lib', true, true);
Module['FS_createPath']('/', 'sounds', true, true);
Module['FS_createPath']('/', 'src', true, true);
Module['FS_createPath']('/src', 'states', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_game.data');

    };
    Module['addRunDependency']('datafile_game.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 6148, "filename": "/.DS_Store"}, {"audio": 0, "start": 6148, "crunched": 0, "end": 17065, "filename": "/main.lua"}, {"audio": 0, "start": 17065, "crunched": 0, "end": 36557, "filename": "/fonts/font.ttf"}, {"audio": 0, "start": 36557, "crunched": 0, "end": 37186, "filename": "/graphics/arrows.png"}, {"audio": 0, "start": 37186, "crunched": 0, "end": 38687, "filename": "/graphics/background.png"}, {"audio": 0, "start": 38687, "crunched": 0, "end": 45388, "filename": "/graphics/blocks.png"}, {"audio": 0, "start": 45388, "crunched": 0, "end": 53717, "filename": "/graphics/breakout.png"}, {"audio": 0, "start": 53717, "crunched": 0, "end": 53966, "filename": "/graphics/hearts.png"}, {"audio": 0, "start": 53966, "crunched": 0, "end": 54116, "filename": "/graphics/particle.png"}, {"audio": 0, "start": 54116, "crunched": 0, "end": 109245, "filename": "/graphics/ui.png"}, {"audio": 0, "start": 109245, "crunched": 0, "end": 112311, "filename": "/lib/class.lua"}, {"audio": 0, "start": 112311, "crunched": 0, "end": 119540, "filename": "/lib/push.lua"}, {"audio": 1, "start": 119540, "crunched": 0, "end": 154008, "filename": "/sounds/brick-hit-1.wav"}, {"audio": 1, "start": 154008, "crunched": 0, "end": 178668, "filename": "/sounds/brick-hit-2.wav"}, {"audio": 1, "start": 178668, "crunched": 0, "end": 217754, "filename": "/sounds/confirm.wav"}, {"audio": 1, "start": 217754, "crunched": 0, "end": 419324, "filename": "/sounds/high_score.wav"}, {"audio": 1, "start": 419324, "crunched": 0, "end": 444804, "filename": "/sounds/hurt.wav"}, {"audio": 1, "start": 444804, "crunched": 0, "end": 6493534, "filename": "/sounds/music.wav"}, {"audio": 1, "start": 6493534, "crunched": 0, "end": 6511560, "filename": "/sounds/no-select.wav"}, {"audio": 1, "start": 6511560, "crunched": 0, "end": 6517088, "filename": "/sounds/paddle_hit.wav"}, {"audio": 1, "start": 6517088, "crunched": 0, "end": 6541152, "filename": "/sounds/pause.wav"}, {"audio": 1, "start": 6541152, "crunched": 0, "end": 6620694, "filename": "/sounds/recover.wav"}, {"audio": 1, "start": 6620694, "crunched": 0, "end": 6678354, "filename": "/sounds/score.wav"}, {"audio": 1, "start": 6678354, "crunched": 0, "end": 6682356, "filename": "/sounds/select.wav"}, {"audio": 1, "start": 6682356, "crunched": 0, "end": 6813170, "filename": "/sounds/victory.wav"}, {"audio": 1, "start": 6813170, "crunched": 0, "end": 6821990, "filename": "/sounds/wall_hit.wav"}, {"audio": 0, "start": 6821990, "crunched": 0, "end": 6828138, "filename": "/src/.DS_Store"}, {"audio": 0, "start": 6828138, "crunched": 0, "end": 6830660, "filename": "/src/Ball.lua"}, {"audio": 0, "start": 6830660, "crunched": 0, "end": 6834825, "filename": "/src/Brick.lua"}, {"audio": 0, "start": 6834825, "crunched": 0, "end": 6835188, "filename": "/src/constants.lua"}, {"audio": 0, "start": 6835188, "crunched": 0, "end": 6836931, "filename": "/src/Dependencies.lua"}, {"audio": 0, "start": 6836931, "crunched": 0, "end": 6841771, "filename": "/src/LevelMaker.lua"}, {"audio": 0, "start": 6841771, "crunched": 0, "end": 6844138, "filename": "/src/Paddle.lua"}, {"audio": 0, "start": 6844138, "crunched": 0, "end": 6844751, "filename": "/src/StateMachine.lua"}, {"audio": 0, "start": 6844751, "crunched": 0, "end": 6848057, "filename": "/src/Util.lua"}, {"audio": 0, "start": 6848057, "crunched": 0, "end": 6848755, "filename": "/src/states/BaseState.lua"}, {"audio": 0, "start": 6848755, "crunched": 0, "end": 6852361, "filename": "/src/states/EnterHighScoreState.lua"}, {"audio": 0, "start": 6852361, "crunched": 0, "end": 6854338, "filename": "/src/states/GameOverState.lua"}, {"audio": 0, "start": 6854338, "crunched": 0, "end": 6855925, "filename": "/src/states/HighScoreState.lua"}, {"audio": 0, "start": 6855925, "crunched": 0, "end": 6859353, "filename": "/src/states/PaddleSelectState.lua"}, {"audio": 0, "start": 6859353, "crunched": 0, "end": 6867060, "filename": "/src/states/PlayState.lua"}, {"audio": 0, "start": 6867060, "crunched": 0, "end": 6869264, "filename": "/src/states/ServeState.lua"}, {"audio": 0, "start": 6869264, "crunched": 0, "end": 6871763, "filename": "/src/states/StartState.lua"}, {"audio": 0, "start": 6871763, "crunched": 0, "end": 6873563, "filename": "/src/states/VictoryState.lua"}], "remote_package_size": 6873563, "package_uuid": "db19455c-4e1d-4fcd-9f2a-f57aa9f6a87a"});

})();
