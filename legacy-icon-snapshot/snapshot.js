const CDP = require("chrome-remote-interface");
const fs = require("fs");

const url = "http://localhost:9999";
const format = "png"; // or jpeg
const renderSize = 2048;
const viewportWidth = renderSize;
const viewportHeight = renderSize;
const userAgent = undefined;
const fullPage = undefined;

const express = require("express");

const app = express();
app.get("/", (req, res) => {
  const iconColor = "#5599cc";
  const bgColor = "#f5f5f5";
  const iconName = "arrows-h";
  const iconSize = 0.8 * renderSize;
  res.send(
    // this is embarrassing:
    '<!doctype html><html><head><script src="https://use.fontawesome.com/bfad455f3e.js"></script></head><body style="' +
      "text-align: center;vertical-align: middle;position: absolute;padding: 0;margin: 0;background: " +
      bgColor +
      ';left: 0;right: 0;top: 0;bottom: 0;">' +
      '<i class="fa fa-' +
      iconName +
      '" aria-hidden="true" style="color: ' +
      iconColor +
      "; font-size: " +
      iconSize +
      "px; margin-top: " +
      (viewportHeight / 2 - iconSize / 2) +
      'px;"></i></body></html>',
  );
});
var server = require("http").createServer(app);

server.listen(9999, () => {
  // Start the Chrome Debugging Protocol
  CDP(async function(client) {
    // Extract used DevTools domains.
    const { DOM, Emulation, Network, Page, Runtime } = client;

    // Enable events on domains we are interested in.
    await Page.enable();
    await DOM.enable();
    await Network.enable();

    // If user agent override was specified, pass to Network domain
    if (userAgent) {
      await Network.setUserAgentOverride({ userAgent });
    }

    // Set up viewport resolution, etc.
    const deviceMetrics = {
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 0,
      mobile: false,
      fitWindow: false,
    };
    await Emulation.setDeviceMetricsOverride(deviceMetrics);
    await Emulation.setVisibleSize({
      width: viewportWidth,
      height: viewportHeight,
    });

    // Navigate to target page
    await Page.navigate({ url });

    // Wait for page load event to take screenshot
    Page.loadEventFired(async () => {
      // If the `full` CLI option was passed, we need to measure the height of
      // the rendered page and use Emulation.setVisibleSize
      if (fullPage) {
        const { root: { nodeId: documentNodeId } } = await DOM.getDocument();
        const { nodeId: bodyNodeId } = await DOM.querySelector({
          selector: "body",
          nodeId: documentNodeId,
        });
        const { model: { height } } = await DOM.getBoxModel({
          nodeId: bodyNodeId,
        });

        await Emulation.setVisibleSize({
          width: viewportWidth,
          height: height,
        });
        // This forceViewport call ensures that content outside the viewport is
        // rendered, otherwise it shows up as grey. Possibly a bug?
        await Emulation.forceViewport({ x: 0, y: 0, scale: 1 });
      }

      setTimeout(async function() {
        const screenshot = await Page.captureScreenshot({ format });
        const buffer = new Buffer(screenshot.data, "base64");
        fs.writeFile("output.png", buffer, "base64", function(err) {
          if (err) {
            console.error(err);
          } else {
            console.log("Screenshot saved");
          }
          client.close();
          server.close();
        });
      }, 1);
    });
  }).on("error", err => {
    console.error("Cannot connect to browser:", err);
  });
});

/*

# Icon Snapshot Tool

This hack is a simple font awesome icon genertor implemented with headless chrome.

May come in handy one day to let users specify an icon and color to get a quick initial app icon

*/

// // https://medium.com/@dschnr/using-headless-chrome-as-an-automated-screenshot-tool-4b07dffba79a

// sudo apt-get install libxss1 libappindicator1 libindicator7
// wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
// sudo dpkg -i google-chrome*.deb  # Might show "errors", fixed by next line
// sudo apt-get install -f

// # Install Node Stable (v7)
// curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
// sudo apt-get install -y nodejs

// # Run Chrome as background process
// # https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
// # --disable-gpu currently required, see link above
// google-chrome --headless --hide-scrollbars --remote-debugging-port=9222 --disable-gpu &

// # Install script dependencies
// npm install chrome-remote-interface minimist
