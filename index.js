const { Plugin } = require("powercord/entities");
const { inject, uninject } = require("powercord/injector");

module.exports = class PIPStream extends Plugin {
  startPlugin() {
    const module = this.getAllModulesByKeyword("openChannelCallPopout");

    // TODO: Fix pip closing when using in big player

    inject(
      "pip_pipbutton",
      module[0],
      "openChannelCallPopout",
      (args) => {
        this.findLargestPlayingVideo().requestPictureInPicture();

        return false;
      },
      true
    );
  }

  getAllModulesByKeyword = (keyword, matchCase = false) => {
    return require("powercord/webpack").getAllModules((module) => {
      const modules = [
        ...Object.keys(module),
        ...Object.keys(module.__proto__),
      ];
      for (let i = 0; i < modules.length; i++) {
        if (matchCase) {
          if (modules[i].indexOf(keyword) > -1) return true;
        } else {
          if (modules[i].toLowerCase().indexOf(keyword.toLowerCase()) > -1)
            return true;
        }
      }
      return false;
    }, false);
  };

  pluginWillUnload() {
    uninject("pip_pipbutton");
  }

  findLargestPlayingVideo() {
    const videos = Array.from(document.querySelectorAll("video"))
      .filter((video) => video.readyState != 0)
      .filter((video) => video.disablePictureInPicture == false)
      .sort((v1, v2) => {
        const v1Rect = v1.getClientRects()[0] || {
          width: 0,
          height: 0,
        };
        const v2Rect = v2.getClientRects()[0] || {
          width: 0,
          height: 0,
        };
        return v2Rect.width * v2Rect.height - v1Rect.width * v1Rect.height;
      });
    if (videos.length === 0) {
      return;
    }
    return videos[0];
  }
};
