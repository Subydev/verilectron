var net = require("net");
const { dialog } = require("electron").remote;
var showdown = require("showdown");
var fs = require("fs");
var format = require("xml-formatter");
var myintro = introJs();
const { app } = require('electron').remote

// import settings from 'electron-settings';
var settings = require("electron-settings")
var client;
var connection = false;
var client_message = "";
var server_message = "";

async function hasSettings(setting) {
  return await settings.has(setting);
}
async function getSettings(setting) {
  return await await settings.get(setting);
}
$(".versionText").text(`Version: ${app.getVersion()}`);

hasSettings('tour.completed').then(result => {
  if (!result) {
    handleCmdChange("<measure_point />")
    RunTutorial()
  }
  if (result) {
    getSettings('tour.completed').then(result => {
      if (!result) {
        handleCmdChange("<measure_point />")
        RunTutorial()
      }
      if (result) {
        console.log(result)
      }
    }).catch(error => {
      alert(error);
    });
  }
}).catch(error => {
  alert(error);
});

function RunTutorial() {
  myintro.setOptions({
    showProgress: true,
    showBullets: false,
    steps: [{
      title: 'Verisurf API Tour',
      intro: "Lets walk through a few steps to get started."
    },
    {
      title: 'Connect',
      intro: "Start by connecting to Verisurf, make sure the 'localhost' port is enabled in Verisurf SDK Preferences.",
      element: document.querySelector('.connectButton'),
    },
    {
      title: 'Categories',
      intro: "Select from a Category of API Calls",
      element: document.querySelector('.categoryTour'),
    },
    {
      title: 'Command',
      intro: "Browse for a command you would like to see an example of.",
      element: document.querySelector('.commandTour'),
    },
    {
      title: 'ID',
      intro: "For certain commands, you need an ID that identifies something, you can set that here.",
      element: document.querySelector('.idTour'),
    },
    {
      title: 'Send Comand',
      intro: "Click here to send the command to Verisurf.",
      element: document.querySelector('.sendCommandtour'),
    },
    {
      title: 'Results View"',
      intro: "One a command is sent, you can see the XML information Verisurf sends back. Typically this data is parsed, then used inside a programmers application.",
      element: document.querySelector('.textAreaTour'),
    },
    {
      title: 'DRO"',
      intro: "Use Open DRO to open an external window to run Measurement commands such as build, measure and trigger.",
      element: document.querySelector('.droTour'),
      position: 'right'

    },
    {
      title: 'Markdown View"',
      intro: "Whenever a Command is selected, the Markdown view is displayed for further information about the selected Command, such as parameters, requirements and response types.",
      element: document.querySelector('.mdTour'),
      position: 'left'
    },

    {
      intro: "You're now ready to use the Verisurf API Sample App, for further questions and enhancements, please contact SDK@verisurf.com.",
    }
    ]
  }).start();

}

myintro.onexit(function () {
  myintro.showHints();
  $("#mdContent").hide();
  settings.set('tour', {
    completed: true,
  });
})

function Connect() {
  if (client_message.length == undefined) {
  }
  if (connection == false) {
    client = net.createConnection(33666, "localhost");
    $('#connectButton').addClass('disabled');
    $('#disconnectButton').removeClass('disabled');
    client.on("error", function (err) {
      client_message = "Verisurf Connection Failed";
      UpdateTextarea();
      console.log(err);
    });
    client.on("connect", function () {
      client_message = "Verisurf Connection Opened";
      connection = true;
    });
    client.on("data", function (data) {
      server_message = data;
      UpdateTextarea();
    });
    client.on("close", function () {
      connection = false;
    });
  } else {
    client_message = "Verisurf Connection Already Established";
    UpdateTextarea();
  }
}

function CustomCommand(cmd) {
  if (cmd == undefined) {
    $("#results").val("No Connection Found or you haven't selected a command.");
  }
  var cmd = $("#command").val();
  var param = $("#paramField").val();

  if (cmd.includes("device")) {
    cmd = `${cmd.slice(0, -2) + "id='" + param + "' />"}`;
  }
  if (cmd.includes("inspect")) {
    cmd = `${cmd.slice(0, -2) + "id='" + param + "' />"}`;
  }
  switch (cmd) {
    case "<import_data />":
      ImportDataFile();
      break;
    case "<import_cloud_mesh />":
      ImportCloudMesh();
      break;
    case "<device_cmm_ipp id='1' />":
      $("#cmmIppModal").modal("show");
      break;
    case "<object_info />":
      SendCommand("<object_info id='" + param + "' />");
      break;
    case "<object_delete />":
      SendCommand("<object_delete id='" + param + "' />");
      break;
    case "<object_info />":
      SendCommand("<object_info id='" + param + "' />");
      break;
    case "<object_set_alignment />":
      SendCommand("<object_set_alignment id='" + param + "' />");
      break;
    case "<object_selection_set />":
      SendCommand("<object_selection_set ids='" + param + "' />");
      break;
    case "<file_open />":
      FileOpen();
      $("#results").val("");
      break;
    case "<file_save />":
      FileSave();
      $("#results").val("");

      break;
    default:
      SendCommand(cmd);
  }
}

function Disconnect() {
  if (client) {
    client_message = "Verisurf Connection Closed";
    UpdateTextarea();

    client.destroy();
    client = undefined;
    $('#disconnectButton').addClass('disabled');
    $('#connectButton').removeClass('disabled');
  }
}

function SendCommand(command) {
  console.log(`Sent ${command}`)
  if (client !== undefined && command !== undefined) {
    client.write(command + "\n");
    client_message = command;
  }
}

function FileOpen() {
  if (client !== undefined) {
    var filename = dialog.showOpenDialog({
      filters: [
        {
          name: "Verisurf Files",
          extensions: ["mcam"],
        },
      ],
      properties: ["openFile"],
    });
    if (filename.length)
      SendCommand("<file_open filename='" + filename + "' />");
  }
}

function FileSave() {
  console.log("File Save");
  if (client !== undefined) {
    var filename = dialog.showSaveDialog({
      filters: [
        {
          name: "Verisurf Files",
          extensions: ["mcam"],
        },
      ],
    });
    if (filename.length)
      SendCommand("<file_save filename='" + filename + "' />");
  }
}

function ImportDataFile() {
  if (client !== undefined) {
    var filename = dialog.showOpenDialog({
      filters: [
        {
          name: "Verisurf Data Files",
          extensions: ["txt", "csv", "xyz", "dat", "ref", "des", "raz"],
        },
      ],
      properties: ["openFile"],
    });
    if (filename.length)
      SendCommand("<import_data filename='" + filename + "' />");
  }
}

function ImportCloudMesh() {
  if (client !== undefined) {
    var filename = dialog.showOpenDialog({
      filters: [
        {
          name: "Verisurf Data Files",
          extensions: ["ascii", "stl", "obj", "ply"],
        },
      ],
      properties: ["openFile"],
    });
    if (filename.length)
      SendCommand(
        "<Import_Cloud_Mesh filename='" + filename + "' filetype='11' />"
      );
  }
}

function UpdateTextarea() {
  var update = '';
  if (client_message.length)
    update += "CLIENT: " + client_message + "\r\n\r\n";
  if (server_message.length)
    update += "SERVER: " + server_message;
  if (server_message.length && server_message.includes("data"))

    client_message = '';
  server_message = '';

  $("#results").val(update);
}
function SendIppCmd(e) {
  SendCommand("<device_cmm_ipp id='1' cmd='" + e + "' />");
  $("#cmmIppModal").modal("hide");
}

function handleCmdChange(e) {
  generateMdSection(e);
}
function OpenDRO() {
  const remote = require('electron').remote;
  const BrowserWindow = remote.BrowserWindow;
  const win = new BrowserWindow({
    width: 1360,
    height: 1000,
    minHeight: 800,
    minWidth: 1160,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegrationInWorker: true
    }
    // frame: false
  });


  win.loadURL(`file://${__dirname}/dro.html`)
  Disconnect();
}

function showCommands() {
  var startLen = 0;
  var endLen = 0;

  var listLen = document.getElementById("categorySelect");
  switch (listLen.value) {
    case "CAD":
      startLen = 0;
      endLen = 22;
      break;

    case "General":
      startLen = 22;
      endLen = 34;
      break;

    case "Device":
      startLen = 34;
      endLen = 45;
      break;

    case "Measure":
      startLen = 45;
      endLen = 63;
      break;

    case "Verisurf Database":
      startLen = 63;
      endLen = 72;
      break;
    case "Report":
      startLen = 72;
      endLen = 85;
      break;
    case "All":
      startLen = 0;
      endLen = VSApiFuncs.length;
      break;
  }
  $("#command").empty();
  for (var i = startLen; i < endLen; i++) {
    $("#command").append(
      "<option id='" +
      i +
      "' option value = '" +
      VSApiFuncs[i].val +
      "'>" +
      VSApiFuncs[i].name +
      "</option"
    );
  }
  $("#commandContainer").show();
}

function generateMdSection(e) {
  console.log(e)
  $("#mdContent").show();
  document.getElementById("cmdExpTitle").innerHTML = `${e.slice(1, -3) + " explained"
    }`;
  // __dirname + '/../extraResources/'
  var filePath = `${__dirname + "/extraResources/" + e.slice(1, -3) + ".md"}`;

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      alert("An error ocurred reading the file :" + err.message);
      return;
    }
    (converter = new showdown.Converter()), converter.setFlavor("github");
    converter.setOption("headerLevelStart", "3");
    (text = data), (html = converter.makeHtml(text));
    document.getElementById("mdBody").innerHTML = `${html}`;
  });
}