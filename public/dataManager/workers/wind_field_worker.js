var currentLoadInfo = null;

self.onmessage = function (event) {
  if (!event || !event.data || event.data.msg !== "load") return;

  currentLoadInfo = event.data.loadInfo;
  loadWindData(currentLoadInfo);
};

function loadWindData(loadInfo) {
  try {
    var request = new XMLHttpRequest();
    request.open("GET", loadInfo.dataUrl, true);
    request.responseType = "text";

    if (loadInfo.Authorization) {
      request.setRequestHeader("Content-type", "application/json");
      request.setRequestHeader(
        "Authorization",
        "Basic YWRtaW46YzYxZDRmYzMtM2RhMS00ZTQ5LWIzYWYtNDgxYzZmMzFiNzI3",
      );
    }

    if (loadInfo.headers) {
      Object.keys(loadInfo.headers).forEach(function (name) {
        request.setRequestHeader(name, loadInfo.headers[name]);
      });
    }

    request.onload = function () {
      if (request.readyState !== 4 || request.status < 200 || request.status >= 300) {
        postFailure(loadInfo);
        return;
      }

      try {
        var payload = JSON.parse(request.responseText);
        if (Number.isInteger(loadInfo.frameIndex)) {
          var frames = Array.isArray(payload) ? payload : payload && payload.frames;
          if (!frames || !frames[loadInfo.frameIndex]) {
            throw new Error("Wind frame does not exist.");
          }
          payload = frames[loadInfo.frameIndex].data;
        }

        self.postMessage({
          msg: "success",
          loadInfo: loadInfo,
          frameData: payload,
        });
      } catch (error) {
        postFailure(loadInfo);
      }
    };

    request.onerror = function () {
      postFailure(loadInfo);
    };
    request.send(null);
  } catch (error) {
    postFailure(loadInfo);
  }
}

function postFailure(loadInfo) {
  self.postMessage({
    msg: "error",
    loadInfo: loadInfo,
  });
}
